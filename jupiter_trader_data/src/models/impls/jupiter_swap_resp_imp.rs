use crate::models::jupiter_models::JupiterSwapInstructionsRsponse;

impl JupiterSwapInstructionsRsponse {
    pub fn instruction_count(&self) -> usize {
        let mut count = 0;

        if self.token_ledger_instruction.is_some() {
            count += 1;
        }
        
        count += self.compute_budget_instructions.len();
        count += self.setup_instructions.len();
        count += 1; // swap_instruction
        count += 1; // cleanup_instruction
        count += self.other_instructions.len();

        count
    }
}
