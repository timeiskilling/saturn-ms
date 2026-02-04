use jupiter_trader_data::models::jupiter_models::JupiterSwapInstructionsRsponse;

pub trait InstructionCount {
    fn instruction_count(&self) -> usize;
}

impl InstructionCount for JupiterSwapInstructionsRsponse {
    fn instruction_count(&self) -> usize {
        self.compute_budget_instructions.len()
            + self.setup_instructions.len()
            + 1 // swap_instruction is always present
            + 1 // cleanup_instruction is always present
            + self.other_instructions.len()
            + self.token_ledger_instruction.iter().count()
    }
}
