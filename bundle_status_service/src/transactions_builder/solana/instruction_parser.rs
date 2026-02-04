use crate::jito_client_api::error_code::{BuildTransactionError, SaturnTransactionsServiceError};
use base64::{Engine, engine::general_purpose};
use common::traits::InstructionParser;
use jupiter_trader_data::models::jupiter_models::{Instruction, JupiterSwapInstructionsRsponse};
use solana_sdk::instruction::{AccountMeta as SolanaAccountMeta, Instruction as SolanaInstruction};

pub struct JupiterSolanaParser;

impl InstructionParser<&JupiterSwapInstructionsRsponse, Vec<SolanaInstruction>>
    for JupiterSolanaParser
{
    type Error = SaturnTransactionsServiceError;

    fn parse_instructions(
        &self,
        input: &JupiterSwapInstructionsRsponse,
    ) -> Result<Vec<SolanaInstruction>, Self::Error> {
        let len = input.instruction_count();

        let mut instructions = Vec::with_capacity(len);

        instructions.extend(self.parse_instructions(input.compute_budget_instructions.as_slice())?);
        instructions.extend(self.parse_instructions(input.compute_budget_instructions.as_slice())?);
        if let Some(token_ledger) = &input.token_ledger_instruction {
            instructions.extend(self.parse_instructions(std::slice::from_ref(token_ledger))?);
        }

        instructions
            .extend(self.parse_instructions(std::slice::from_ref(&input.swap_instruction))?);
        instructions
            .extend(self.parse_instructions(std::slice::from_ref(&input.cleanup_instruction))?);

        instructions.extend(self.parse_instructions(input.other_instructions.as_slice())?);

        Ok(instructions)
    }
}
impl InstructionParser<&[Instruction], Vec<SolanaInstruction>> for JupiterSolanaParser {
    type Error = SaturnTransactionsServiceError;

    fn parse_instructions(
        &self,
        input: &[Instruction],
    ) -> Result<Vec<SolanaInstruction>, Self::Error> {
        input
            .iter()
            .map(|instruct| {
                let program_id = instruct.program_id;

                let data = general_purpose::STANDARD
                    .decode(&instruct.data)
                    .map_err(|e| {
                        SaturnTransactionsServiceError::BuildTransaction(Box::new(
                            BuildTransactionError::InvalidDecode { decode_err: e },
                        ))
                    })?;

                let accounts: Vec<SolanaAccountMeta> = instruct
                    .accounts
                    .iter()
                    .map(|acc| SolanaAccountMeta {
                        pubkey: acc.pubkey,
                        is_signer: acc.is_signer,
                        is_writable: acc.is_writable,
                    })
                    .collect();

                Ok(SolanaInstruction {
                    program_id,
                    accounts,
                    data,
                })
            })
            .collect()
    }
}
