use solana_client::rpc_client::SerializableMessage;
pub struct MsgWrapper<'a>(pub &'a solana_sdk::message::Message);
impl<'a> SerializableMessage for MsgWrapper<'a> {
    fn serialize(&self) -> Vec<u8> {
        self.0.serialize()
    }
}
