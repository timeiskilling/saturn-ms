// use async_trait::async_trait;

pub trait InstructionParser<Input, Output> {
    type Error;
    fn parse_instructions(&self, input: Input) -> Result<Output, Self::Error>;
}

// #[async_trait]
pub trait TransactionBuilder<Input, Context> {
    type Output;
    type Error;

    fn build_transaction(
        &self,
        input: Input,
        context: Context,
    ) -> impl Future<Output = Result<Self::Output, Self::Error>>;
}
