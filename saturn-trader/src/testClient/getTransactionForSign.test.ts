import { expect, test } from "vitest";
import { GrpcClient } from "@/protoTypes/grpcClient";
import type { streaming } from "@/protoTypes/streaming_status";

test("getTransactionForSign", async () => {
  // 1. Create a specific test client pointed to your local testing server
  const testClient = new GrpcClient({
    baseUrl: "http://127.0.0.1:3000",
  });

  const bundleService = testClient.getBundleService();

  const request: streaming.ITransactionsBuld = {
    transactions: [
      {
        id: "test_tx_01",
        inputMint: "So11111111111111111111111111111111111111112", // SOL
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        amount: 1000000,
        slippageBps: 50, // 0.5%
        userPk: "jdocuPgEAjMfihABsPgKEvYtsmMzjUHeq9LX4Hvs7f3",
        options: {
          dexes: [],
          excludeDexes: [],
          dynamicSlippage: false,
        },
      },
    ],
  };

  try {
    // 4. Call the gRPC method and await the response
    const response = await bundleService.createTransactions(request);

    console.log("gRPC Response:", JSON.stringify(response, null, 2));

    // 5. Write Vitest assertions to verify the response

    // We expect the server to return at least 1 transaction string to sign
    expect(response).toBeDefined();
    expect(response.transactions).toBeDefined();
    expect(response.transactions?.length).toBeGreaterThan(0);

    // Check that we got back a valid base58 transaction string
    const firstTx = response.transactions?.[0];
    expect(firstTx).toBeDefined();
    if (firstTx) {
      expect(firstTx.id).toBeDefined();
      expect(firstTx.transactionBase58).toBeDefined();
      expect(typeof firstTx.transactionBase58).toBe("string");
    }

    // Note: delta information is now obtained via the simulateBundle endpoint
  } catch (error) {
    // If the server isn't running or returns an error, the test should fail gracefully
    console.error("gRPC Error:", error);
    // You can optionally uncomment this to force fail the test if any network error occurs
    expect.fail("Failed to execute gRPC request");
  }
});
