use async_trait::async_trait;

pub trait InstructionParser<Input, Output> {
    type Error;
    fn parse_instructions(&self, input: Input) -> Result<Output, Self::Error>;
}

#[async_trait]
pub trait TransactionBuilder<Input, Context> {
    type Output;
    type Error;

    async fn build_transaction(
        &self,
        input: Input,
        context: Context,
    ) -> Result<Self::Output, Self::Error>;
}
