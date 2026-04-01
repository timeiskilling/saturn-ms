import { useSolana } from "@phantom/react-sdk";
import { Buffer } from "buffer";
import { getBase58Encoder, getTransactionDecoder} from "gill";
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
      const base58Decoder = getBase58Encoder();
      const txBytes = base58Decoder.encode(tx.transactionBase58);

      const transaction = getTransactionDecoder().decode(txBytes);
      return transaction;
    });

    const signedTx = await solana.signAllTransactions(versionedTransactions as any);

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
