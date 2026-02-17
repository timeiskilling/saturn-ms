use crate::constant::{self, HEADER_SIZE};
use crate::prelude::*;
use async_trait::async_trait;
use common::traits::{InstructionParser, TransactionBuilder};
use jupiter_trader_data::models::jupiter_models::JupiterSwapInstructionsRsponse;
use redis::AsyncCommands;
use redis::aio::MultiplexedConnection;
use saturn_errors::error::{
    ATlError, BuildTransactionError, RedisErr, SaturnTransactionsServiceError,
};
use saturn_errors::models::Instruction as JupiterInstruction;
use solana_client::nonblocking::rpc_client::RpcClient;
use solana_sdk::instruction::Instruction as SolanaInstruction;
use solana_sdk::message::v0::{self, Message};
use solana_sdk::message::{AddressLookupTableAccount, VersionedMessage};
use solana_sdk::signature::Signature;
use solana_sdk::transaction::VersionedTransaction;
use std::str::FromStr;

pub struct SolanaTransactionsBuilder<P> {
    pub rpc_client: Arc<RpcClient>,
    pub alt_redis: MultiplexedConnection,
    pub parser: P,
}

impl<P> SolanaTransactionsBuilder<P> {
    pub fn new(
        rpc_client: Arc<RpcClient>,
        alt_redis: redis::aio::MultiplexedConnection,
        parser: P,
    ) -> Self {
        Self {
            rpc_client,
            alt_redis,
            parser,
        }
    }

    async fn fetch_map_address_lookup_tables(
        &self,
        address: &Value,
    ) -> Result<Vec<AddressLookupTableAccount>, SaturnTransactionsServiceError> {
        let mut tabel_accounts = Vec::new();

        if let Some(account_address) = address.as_object() {
            for (key, acc_addresses) in account_address {
                let pubkey = Pubkey::from_str(key).map_err(|e| {
                    SaturnTransactionsServiceError::ATlError(ATlError::PubkeyConvertingErr {
                        bad_bytes: key.as_bytes().to_vec(),
                        issue: e.to_string(),
                    })
                })?;

                if let Some(data) = acc_addresses.as_array() {
                    let mut addresses = Vec::new();

                    for addresses_val in data {
                        if let Some(address_str) = addresses_val.as_str() {
                            addresses.push(Pubkey::from_str(address_str).map_err(|e| {
                                SaturnTransactionsServiceError::ATlError(
                                    ATlError::PubkeyConvertingErr {
                                        bad_bytes: address_str.as_bytes().to_vec(),
                                        issue: e.to_string(),
                                    },
                                )
                            })?);
                        }
                    }

                    let lookup_table = AddressLookupTableAccount {
                        key: pubkey,
                        addresses,
                    };

                    tabel_accounts.push(lookup_table);
                }
            }
        }

        Ok(tabel_accounts)
    }
    async fn fetch_address_lookup_tables(
        &self,
        alt_address: &[String],
    ) -> Result<Vec<AddressLookupTableAccount>, SaturnTransactionsServiceError> {
        use constant::TTL_FOR_ATL;

        let mut con = self.alt_redis.clone();
        let keys: Vec<String> = alt_address.to_vec();

        let cached_data: Vec<Option<Vec<u8>>> = con.mget(keys).await.map_err(|e| {
            SaturnTransactionsServiceError::Redis(RedisErr::MgetALT {
                redis_issue: e.to_string(),
            })
        })?;

        let mut results = vec![None; alt_address.len()];
        let mut missing_indices = Vec::with_capacity(alt_address.len());
        let mut missing_pubkeys = Vec::with_capacity(alt_address.len());

        for (i, (addr_str, cache_hit)) in alt_address.iter().zip(cached_data).enumerate() {
            let pubkey = Pubkey::from_str(addr_str).map_err(|e| {
                SaturnTransactionsServiceError::ATlError(ATlError::PubkeyConvertingErr {
                    bad_bytes: addr_str.as_bytes().to_vec(),
                    issue: e.to_string(),
                })
            })?;

            match cache_hit {
                Some(data) => {
                    results[i] = Some(AddressLookupTableAccount {
                        key: pubkey,
                        addresses: self.parse_lookup_table(&data)?,
                    });
                }
                None => {
                    missing_indices.push(i);
                    missing_pubkeys.push(pubkey);
                }
            }
        }

        if !missing_pubkeys.is_empty() {
            tracing::info!("Fetching {} missing ALTs from RPC", missing_pubkeys.len());

            let accounts_data = self
                .rpc_client
                .get_multiple_accounts(&missing_pubkeys)
                .await
                .map_err(|_| {
                    SaturnTransactionsServiceError::ATlError(ATlError::FetchALTs {
                        alt_pubkeys: missing_pubkeys.iter().map(|k| k.to_string()).collect(),
                    })
                })?;
            let mut pipe = redis::pipe();

            for ((&original_idx, pubkey), account_opt) in missing_indices
                .iter()
                .zip(&missing_pubkeys)
                .zip(accounts_data)
            {
                if let Some(account) = account_opt {
                    pipe.set_ex(pubkey.to_string(), &account.data, TTL_FOR_ATL);

                    results[original_idx] = Some(AddressLookupTableAccount {
                        key: *pubkey,
                        addresses: self.parse_lookup_table(&account.data)?,
                    });
                } else {
                    return Err(SaturnTransactionsServiceError::ATlError(
                        ATlError::NotFound {
                            pubkey: pubkey.to_string(),
                        },
                    ));
                }
            }

            let _: () = pipe.query_async(&mut con).await.map_err(|e| {
                SaturnTransactionsServiceError::Redis(RedisErr::QueryExecute {
                    issue: e.to_string(),
                })
            })?;
        }

        let final_results: Result<Vec<_>, _> = results
            .into_iter()
            .map(|opt| {
                opt.ok_or_else(|| {
                    SaturnTransactionsServiceError::ATlError(ATlError::NotFound {
                        pubkey: "Unknown error during ALT reconstruction".to_string(),
                    })
                })
            })
            .collect();

        final_results
    }

    async fn create_v0_message_with_alt(
        &self,
        instructions: &[solana_sdk::instruction::Instruction],
        alt_account: &[AddressLookupTableAccount],
        blockhash: Hash,
        pubkey: Pubkey,
    ) -> Result<v0::Message, SaturnTransactionsServiceError> {
        let message =
            Message::try_compile(&pubkey, instructions, alt_account, blockhash).map_err(|e| {
                SaturnTransactionsServiceError::BuildTransaction(Box::new(
                    BuildTransactionError::V0message(e),
                ))
            })?;
        Ok(message)
    }
    #[instrument(skip_all, level = "info")]
    fn parse_lookup_table(
        &self,
        account_data: &[u8],
    ) -> Result<Vec<Pubkey>, SaturnTransactionsServiceError> {
        if account_data.len() < HEADER_SIZE {
            return Err(SaturnTransactionsServiceError::ATlError(
                ATlError::ParseLookupTable {
                    pubkey_header_size: "invalid size too short".to_string(),
                },
            ));
        };

        let address_data: &[u8] = &account_data[HEADER_SIZE..];
        let address_count = address_data.len() / 32;

        let mut address = Vec::with_capacity(address_count + 1);

        for i in 0..address_count {
            let start = i * 32;
            let end = start + 32;
            let pubkey_bytes = &address_data[start..end];
            let pubkey = Pubkey::try_from(pubkey_bytes).map_err(|e| {
                SaturnTransactionsServiceError::ATlError(ATlError::PubkeyConvertingErr {
                    bad_bytes: pubkey_bytes.to_vec(),
                    issue: e.to_string(),
                })
            })?;
            address.push(pubkey);
        }

        Ok(address)
    }
}

#[async_trait]
impl<P> TransactionBuilder<JupiterSwapInstructionsRsponse, (Hash, Pubkey)>
    for SolanaTransactionsBuilder<P>
where
    P: for<'a> InstructionParser<&'a JupiterSwapInstructionsRsponse, Vec<SolanaInstruction>>
        + for<'a> InstructionParser<&'a [JupiterInstruction], Vec<SolanaInstruction>>
        + Send
        + Sync,
{
    type Output = String;
    type Error = SaturnTransactionsServiceError;

    async fn build_transaction(
        &self,
        swap_response: JupiterSwapInstructionsRsponse,
        (blockhash, pubkey): (Hash, Pubkey),
    ) -> Result<Self::Output, Self::Error> {
        let instructions = self
            .parser
            .parse_instructions(&swap_response)
            .map_err(|_| {
                SaturnTransactionsServiceError::BuildTransaction(Box::new(
                    BuildTransactionError::General("Parse error".into()),
                ))
            })?;

        let address_lookup_table_accounts =
            if let Some(address_lookup_tables) = &swap_response.addresses_by_lookup_table_address {
                tracing::info!("fetch addresses 1");
                self.fetch_map_address_lookup_tables(address_lookup_tables)
                    .await?
            } else {
                tracing::info!("fetch addresses 2");
                self.fetch_address_lookup_tables(&swap_response.address_lookup_table_addresses)
                    .await?
            };

        let message = self
            .create_v0_message_with_alt(
                &instructions,
                &address_lookup_table_accounts,
                blockhash,
                pubkey,
            )
            .await?;

        let versioned_message = VersionedMessage::V0(message);

        let num_required = match &versioned_message {
            VersionedMessage::Legacy(m) => m.header.num_required_signatures as usize,
            VersionedMessage::V0(m) => m.header.num_required_signatures as usize,
        };

        let transaction = VersionedTransaction {
            signatures: vec![Signature::default(); num_required],
            message: versioned_message,
        };

        let serialized_tx = bincode::serialize(&transaction).map_err(|e| {
            SaturnTransactionsServiceError::BuildTransaction(Box::new(
                BuildTransactionError::BincodeVersionedTransactionSerializetion {
                    data: transaction.clone(),
                    issue: e.to_string(),
                },
            ))
        })?;
        let base58_tx = bs58::encode(serialized_tx).into_string();

        Ok(base58_tx)
    }
}
