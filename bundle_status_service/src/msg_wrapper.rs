use solana_client::rpc_client::SerializableMessage;

pub struct MsgWrapper<'a, T>(pub &'a T);

impl<'a> SerializableMessage for MsgWrapper<'a, solana_sdk::message::Message> {
    fn serialize(&self) -> Vec<u8> {
        self.0.serialize()
    }
}

impl<'a> SerializableMessage for MsgWrapper<'a, solana_sdk::message::v0::Message> {
    fn serialize(&self) -> Vec<u8> {
        self.0.serialize()
    }
}
