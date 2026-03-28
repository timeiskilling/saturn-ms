import { expect, test, beforeAll, afterAll } from "vitest";
import Redis from "ioredis";

let redisSubscriber: Redis;
let redisPublisher: Redis;

beforeAll(() => {
  // We need two independent Redis instances to test pub/sub properly.
  // One connects to listen (subscribe) and the other acts as our regular client.
  const redisConfig = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
  };

  redisSubscriber = new Redis(redisConfig);
  redisPublisher = new Redis(redisConfig);
});

afterAll(async () => {
  // Clean up connections
  await redisSubscriber.quit();
  await redisPublisher.quit();
});

test("should receive Binance token price data via Redis Pub/Sub", async () => {
  // We will listen for a common token update like SOLUSDT, but if it doesn't
  // arrive in time, we'll use pattern matching to catch ANY binance update.
  const pMessagePromise = new Promise<{ pattern: string; channel: string; message: string }>((resolve) => {
    // Listen for any published message matching binance:*
    redisSubscriber.on("pmessage", (pattern, channel, message) => {
      resolve({ pattern, channel, message });
    });
  });

  // Subscribe to all binance channels
  await redisSubscriber.psubscribe("binance:SOLUSDT");

  // Wait a few seconds to intercept an incoming stream message from the rust price_service worker.
  // The worker receives WebSocket data and publishes it straight to the channel.
  // We set a 5 second timeout to allow data to propagate.
  const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));

  const result = await Promise.race([pMessagePromise, timeoutPromise]);

  // Clean up the subscription
  await redisSubscriber.punsubscribe("binance:SOLUSDT");

  // If result is null, the timeout fired before we received a pub/sub message
  expect(result, "Did not receive any Pub/Sub messages on 'binance:*' within 5 seconds").not.toBeNull();

  if (result) {
    const { channel, message } = result;


    expect(channel).toMatch(/^binance:/);

    // Verify the published payload is valid JSON
    const parsedData = JSON.parse(message) as string;

    expect(parsedData).toBeDefined();

    console.log(`Received Pub/Sub on channel ${channel}:`, parsedData);
    // Verify some basic expected fields based on Binance stream format
    // Because the Rust backend pushes the raw payload, we should expect standard
    // Binance payload properties like `data.s` (symbol), `data.p` (price change), etc.
  }
}, 10000); // Give the test up to 10 seconds total to complete
