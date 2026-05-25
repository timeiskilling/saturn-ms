import { expect, test } from "vitest";
import { GrpcClient } from "@/protoTypes/grpcClient";
import type { streaming } from "@/protoTypes/streaming_status";

test("10 concurrent request latency", async () => {
  const client = new GrpcClient({
    baseUrl: "http://127.0.0.1:3000",
  });

  const bundleService = client.getBundleService();
  const promises: Promise<streaming.ITransactionsBuld>[] = [];

  const requests: streaming.ITransactionsBuld = {
    transactions: [
      {
        id: "test_tx_01",
        inputMint: "So11111111111111111111111111111111111111112",
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        amount: 1000000,
        slippageBps: 50,
        userPk: "jdocuPgEAjMfihABsPgKEvYtsmMzjUHeq9LX4Hvs7f3",
        options: { dexes: [], excludeDexes: [], dynamicSlippage: false },
      },
      {
        id: "test_tx_02",
        inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        outputMint: "So11111111111111111111111111111111111111112",
        amount: 10000,
        slippageBps: 50,
        userPk: "jdocuPgEAjMfihABsPgKEvYtsmMzjUHeq9LX4Hvs7f3",
        options: { dexes: [], excludeDexes: [], dynamicSlippage: false },
      },
    ],
  };

  const NUMBER_OF_REQUESTS = 5;

  const start = performance.now();

  try {
    for (let i = 0; i < NUMBER_OF_REQUESTS; i++) {
      promises.push(bundleService.createTransactions(requests));
    }
    const results = await Promise.all(promises);

    const end = performance.now();
    const executionTime = end - start;

    console.log(`Actual length: ${results.length}`);
    console.log(`ExecutionTime: ${executionTime.toFixed(2)} мс`);

    expect(results).toBeDefined();
    expect(results).toHaveLength(NUMBER_OF_REQUESTS);

    results.forEach((result, index) => {
      expect(result).toBeDefined();
      expect(result.transactions).toBeDefined();
      expect(result.transactions).toHaveLength(3);
      const tx = result.transactions?.[0] as
        | streaming.IBuiltTransaction
        | undefined;
      expect(tx).toBeDefined();
      if (tx) {
        expect(tx.id).toBeDefined();
        expect(tx.transactionBase58).toBeDefined();
        expect(typeof tx.transactionBase58).toBe("string");
      }
    });

    // expect(executionTime).toBeLessThan(2000);
  } catch (error: any) {
    console.error(`The err was:`, error);
    throw error;
  }
}, 40000);
