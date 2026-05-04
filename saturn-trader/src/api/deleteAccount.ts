import bs58 from "bs58";
import { type ISolanaChain } from "@phantom/react-sdk";
import type { NonceResponse } from "./verifyWallet";

export type DeleteAccountRequest = {
  request_id: string;
  signature: string;
  public_key: string;
};

export async function deleteAccount(
  solana: ISolanaChain,
  publicKey: string,
): Promise<boolean> {
  try {
    const nonceResponse = await fetch("http://localhost:3001/auth/nonce", {
      method: "GET",
      credentials: "include",
    });

    if (!nonceResponse.ok) {
      throw new Error(`Failed to fetch nonce: ${nonceResponse.statusText}`);
    }

    const nonceData: NonceResponse = await nonceResponse.json();
    const deleteMessage = `Delete account. Nonce: ${nonceData.nonce}`;
    const encodedMessage = new TextEncoder().encode(deleteMessage);
    const signedMessage = await solana.signMessage(encodedMessage);

    // Encode the signature as Base58 for the backend
    const signatureBase58 = bs58.encode(signedMessage.signature);

    // Prepare the delete verification request
    const verifyPayload: DeleteAccountRequest = {
      request_id: nonceData.request_id,
      signature: signatureBase58,
      public_key: publicKey,
    };

    const verifyResponse = await fetch("http://localhost:3001/auth/account", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyPayload),
    });

    if (!verifyResponse.ok) {
      throw new Error(`Failed to delete wallet: ${verifyResponse.statusText}`);
    }

    window.dispatchEvent(new Event("saturn_account_deleted"));
    return true;
  } catch (error) {
    console.error("Wallet verification error:", error);
    return false;
  }
}
