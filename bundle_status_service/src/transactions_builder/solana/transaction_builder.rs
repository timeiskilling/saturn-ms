use crate::prelude::*;
use common::traits::{InstructionParser, TransactionBuilder};
use jupiter_trader_data::models::jupiter_models::JupiterSwapInstructionsRsponse;
use saturn_errors::error::{ATlError, BuildTransactionError, SaturnTransactionsServiceError};
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
    // pub alt_redis: MultiplexedConnection,
    pub parser: P,
}

impl<P> SolanaTransactionsBuilder<P> {
    pub fn new(
        rpc_client: Arc<RpcClient>,
        // alt_redis: redis::aio::MultiplexedConnection,
        parser: P,
    ) -> Self {
        Self {
            rpc_client,
            // alt_redis,
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
}

// #[async_trait]
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
                return Err(SaturnTransactionsServiceError::BuildTransaction(Box::new(
                    BuildTransactionError::General(
                        "addresses_by_lookup_table_address is missing in Jupiter response".into(),
                    ),
                )));
            };

        let message = self
            .create_v0_message_with_alt(
                &instructions,
                &address_lookup_table_accounts,
                blockhash,
                pubkey,
            )
            .await?;

        // let tips = self
        //     .rpc_client
        //     .get_fee_for_message(&crate::msg_wrapper::MsgWrapper(&message))
        //     .await
        //     .map_err(|err| {
        //         SaturnTransactionsServiceError::Rpc(
        //             saturn_errors::error::RpcError::InvalidResponse {
        //                 expected: "Expected tip fee".to_string(),
        //                 got: err.to_string(),
        //             },
        //         )
        //     })?;

        let versioned_message = VersionedMessage::V0(message);

        let num_required = match &versioned_message {
            VersionedMessage::Legacy(m) => m.header.num_required_signatures,
            VersionedMessage::V0(m) => m.header.num_required_signatures,
            VersionedMessage::V1(m) => m.header.num_required_signatures,
        } as usize;

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
