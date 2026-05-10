import { expect, test, beforeAll, afterAll } from "vitest";
import Redis from "ioredis";

let redis: Redis;

beforeAll(() => {
  // Connect to the local Redis instance.
  // Defaults to standard 127.0.0.1:6379
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
  });
});

afterAll(async () => {
  // Gracefully close the Redis connection after tests
  await redis.quit();
});

test("should have Binance token price data in Redis", async () => {
  // We add a small delay to give the websocket time to receive data
  // and the Rust worker time to write it to Redis if the service just started.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // The Rust worker sets the key format as 'binance:{symbol}'
  // Based on configuration, a common ticker will be 'SOLUSDT'
  let targetKey = "binance:SOLUSDT";
  let targetData = await redis.hgetall(targetKey);

  // If SOLUSDT is not found, we fallback to checking if ANY binance data exists
  // to prevent the test from failing purely due to token list variations.
  if (Object.keys(targetData).length === 0) {
    const keys = await redis.keys("binance:*");
    if (keys.length > 0) {
      targetKey = keys[0] as string;
      targetData = await redis.hgetall(targetKey);
    }
  }

  console.log(`Consumed data for key ${targetKey}:`, targetData);

  // Ensure we actually got data from Redis
  expect(
    Object.keys(targetData).length,
    `No Binance price data found in Redis for key ${targetKey}`,
  ).toBeGreaterThan(0);

  // Verify the exact fields written by the Rust `spawn_redis_price_worker` function
  // -> ("price_change", ...), ("percent", ...), ("prev_close", ...)
  expect(targetData).toHaveProperty("current_price");
  expect(targetData).toHaveProperty("price_change");
  expect(targetData).toHaveProperty("percent");

  // Validate the data types (ioredis returns hash values as strings)
  expect(typeof targetData.current_price).toBe("string");
  expect(typeof targetData.price_change).toBe("string");
  expect(typeof targetData.percent).toBe("string");
});
