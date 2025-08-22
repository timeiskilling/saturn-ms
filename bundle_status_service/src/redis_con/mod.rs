use redis::ToRedisArgs;
use solana_sdk::{message::AddressLookupTableAccount, pubkey::Pubkey};

pub mod connection;

// impl ToRedisArgs for AddressLookupTableAccount {
//     fn write_redis_args<W>(&self, out: &mut W)
//     where
//         W: ?Sized + redis::RedisWrite {
//         todo!()
//     }
    
//     fn to_redis_args(&self) -> Vec<Vec<u8>> {
//         let mut out = Vec::new();
//         self.write_redis_args(&mut out);
//         out
//     }
    
//     fn describe_numeric_behavior(&self) -> redis::NumericBehavior {
//         redis::NumericBehavior::NonNumeric
//     }
    
//     fn num_of_args(&self) -> usize {
//         1
//     }
// }
