import { useSolana } from "@phantom/react-sdk";
import { VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { Buffer } from "buffer";
import type { streaming } from "@/protoTypes/streaming_status";

export function useSignTransaction() {
  const { solana } = useSolana();

  const handleSignOnly = async (transaction: streaming.ITransactionsToSign) => {
    if (!transaction.transactions) {
      throw new Error("zero transaction");
    }

    const versionedTransactions = transaction.transactions.map((tx) => {
      if (!tx.transactionBase58) {
        throw new Error("null unexpected transaction");
      }
      const txBytes = bs58.decode(tx.transactionBase58);
      return VersionedTransaction.deserialize(txBytes);
    });

    const signedTx = await solana.signAllTransactions(versionedTransactions);

    const fullySignedBase64 = signedTx.map((tx) => {
      return Buffer.from(tx.serialize()).toString("base64");
    });

    console.log(
      "Here is the signed transaction ready to be sent later:",
      fullySignedBase64,
    );
    return fullySignedBase64;
  };

  return { handleSignOnly };
}
