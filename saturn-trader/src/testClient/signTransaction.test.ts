import { expect, test, vi } from "vitest";
import { Buffer } from "buffer";
import { getBase58Decoder } from "gill";
import type { streaming } from "@/protoTypes/streaming_status";

// We mock the dependencies to isolate the test from the actual Phantom Wallet
// and Solana Web3 implementations.
vi.mock("@phantom/react-sdk", () => ({
  useSolana: vi.fn(() => ({
    solana: {
      signAllTransactions: vi.fn(async (txs: any[]) => {
        // Mock returning the passed transactions but changing their serialize
        // behavior to return a known byte array for testing base64 conversion.
        return txs.map((tx) => ({
          ...tx,
          serialize: () => new Uint8Array([10, 20, 30, 40, 50]),
        }));
      }),
    },
  })),
}));

vi.mock("gill", async (importOriginal) => {
  const actual = await importOriginal<typeof import("gill")>();
  return {
    ...actual,
    getTransactionDecoder: vi.fn(() => ({
      decode: vi.fn((bytes: Uint8Array) => ({
        serialize: () => bytes,
      })),
    })),
  };
});

test("handleSignOnly decodes base58, signs, and encodes to base64", async () => {
  // Dynamic import ensures the mocks are applied before the module is loaded
  const { useSignTransaction } =
    await import("@/components/api/singTransaction");

  const { handleSignOnly } = useSignTransaction();

  // 1. Setup mock input data
  // We provide a dummy transaction byte array, encoded in Base58
  const dummyTxBytes = new Uint8Array([1, 2, 3]);
  const dummyBase58 = getBase58Decoder().decode(dummyTxBytes);

  const mockRequest: streaming.ITransactionsToSign = {
    transactions: [
      {
        transactionBase58: dummyBase58,
      },
    ],
  };

  // 2. Call the function
  const result = await handleSignOnly(mockRequest);

  // 3. Assertions
  expect(result).toBeDefined();
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBe(1);

  // Check if it correctly converted to Base64 using Buffer
  // The mock signAllTransactions returns [10, 20, 30, 40, 50]
  const expectedBase64 = Buffer.from(
    new Uint8Array([10, 20, 30, 40, 50]),
  ).toString("base64");
  expect(result[0]).toBe(expectedBase64);
});

test("handleSignOnly fails if transactions array is missing", async () => {
  const { useSignTransaction } =
    await import("@/components/api/singTransaction");
  const { handleSignOnly } = useSignTransaction();

  const emptyRequest: streaming.ITransactionsToSign = {};

  await expect(handleSignOnly(emptyRequest)).rejects.toThrow(
    "zero transaction",
  );
});

test("handleSignOnly fails if transactionBase58 is missing", async () => {
  const { useSignTransaction } =
    await import("@/components/api/singTransaction");
  const { handleSignOnly } = useSignTransaction();

  const invalidRequest: streaming.ITransactionsToSign = {
    transactions: [
      {
        // missing transactionBase58
      },
    ],
  };

  await expect(handleSignOnly(invalidRequest)).rejects.toThrow(
    "null unexpected transaction",
  );
});
