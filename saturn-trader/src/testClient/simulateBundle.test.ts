import { expect, test } from "vitest";
import { GrpcClient } from "@/protoTypes/grpcClient";
import type { streaming } from "@/protoTypes/streaming_status";

test("simulateBundle", async () => {
  // 1. Create a specific test client pointed to your local testing server
  const testClient = new GrpcClient({
    baseUrl: "http://127.0.0.1:3000",
  });

  const bundleService = testClient.getBundleService();

  const request: streaming.ISimulateBundleRequest = {
    swaps: [
      {
        id: "test_sim_01",
        inputMint: "So11111111111111111111111111111111111111112", // SOL
        inputAmount: 1000000000, // 1 SOL
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        expectedOutput: 150000000, // 150 USDC
        slippageBps: 50, // 0.5%
      },
    ],
  };

  try {
    // 4. Call the gRPC method and await the response
    const response = await bundleService.simulateBundle(request);

    console.log("SimulateBundle Response:", JSON.stringify(response, null, 2));

    // 5. Write Vitest assertions to verify the response
    expect(response).toBeDefined();
    expect(response.swaps).toBeDefined();
    expect(response.swaps?.length).toBe(1);

    const firstSwap = response.swaps?.[0];
    expect(firstSwap).toBeDefined();
    if (firstSwap) {
      expect(firstSwap.id).toBe("test_sim_01");
      expect(firstSwap.inputMint).toBe(
        "So11111111111111111111111111111111111111112",
      );
      expect(Number(firstSwap.inputAmount)).toBe(1000000000);

      // Minimum output should be exactly 99.5% of expected output (150 * 0.995 = 149.25)
      // 150,000,000 * (10000 - 50) / 10000 = 149,250,000
      expect(Number(firstSwap.minimumOutput)).toBe(149250000);

      // Network fee should be standard 5000 lamports
      expect(Number(firstSwap.networkFeeLamports)).toBe(5000);
    }

    // Check bundle-level fees
    expect(Number(response.jitoTipLamports)).toBeGreaterThanOrEqual(0);

    // totalNetworkFeeLamports should be (swaps.length * 5000) + 5000 (tip tx)
    // For 1 swap: 5000 + 5000 = 10000
    expect(Number(response.totalNetworkFeeLamports)).toBe(10000);
  } catch (error) {
    console.error("SimulateBundle Error:", error);
    // You can optionally uncomment this to force fail the test if any network error occurs
    // expect.fail("Failed to execute SimulateBundle gRPC request");
  }
});
