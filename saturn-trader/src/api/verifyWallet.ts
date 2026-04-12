import bs58 from "bs58";
import { type ISolanaChain } from "@phantom/react-sdk";

export type NonceResponse = {
  nonce: string;
  request_id: string;
  message_template: string;
};

export type SolVerifyRequest = {
  request_id: string;
  public_key: string;
  signature: string;
};

export async function verifyWallet(
  solana: ISolanaChain,
  publicKey: string,
): Promise<boolean> {
  try {
    // 1. Request a nonce and message template from the backend
    const nonceResponse = await fetch("http://localhost:3001/auth/nonce", {
      method: "GET",
      credentials: "include",
    });

    if (!nonceResponse.ok) {
      throw new Error(`Failed to fetch nonce: ${nonceResponse.statusText}`);
    }

    const nonceData: NonceResponse = await nonceResponse.json();

    // 2. Encode the message and sign it using Phantom
    const encodedMessage = new TextEncoder().encode(nonceData.message_template);
    const signedMessage = await solana.signMessage(encodedMessage);

    // 3. Encode the signature as Base58 for the backend
    const signatureBase58 = bs58.encode(signedMessage.signature);

    // 4. Send the verification request to the backend
    const verifyPayload: SolVerifyRequest = {
      request_id: nonceData.request_id,
      public_key: publicKey,
      signature: signatureBase58,
    };

    const verifyResponse = await fetch("http://localhost:3001/auth/verify", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyPayload),
    });

    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify wallet: ${verifyResponse.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Wallet verification error:", error);
    return false;
  }
}
