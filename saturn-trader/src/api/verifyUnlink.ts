import bs58 from "bs58";
import { type ISolanaChain } from "@phantom/react-sdk";
import type { NonceResponse } from "./verifyWallet";

export type SolVerifyRequest = {
  request_id: string;
  public_key: string;
  signature: string;
};

export async function verifyUnlink(
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

    // Format must exactly match the backend's expected message in auth_endpoints.rs
    const unlinkMessage = `Unlink from any primary account. Nonce: ${nonceData.nonce}`;
    const encodedMessage = new TextEncoder().encode(unlinkMessage);
    const signedMessage = await solana.signMessage(encodedMessage);

    // Encode the signature as Base58 for the backend
    const signatureBase58 = bs58.encode(signedMessage.signature);

    // Prepare the verification request
    const verifyPayload: SolVerifyRequest = {
      request_id: nonceData.request_id,
      public_key: publicKey,
      signature: signatureBase58,
    };

    const response = await fetch("http://localhost:3001/wallet/unlink", {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyPayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to unlink wallet: ${response.statusText}`);
    }

    window.dispatchEvent(new Event("saturn_wallet_unlinked"));
    return true;
  } catch (error) {
    console.error("Wallet unlink error:", error);
    return false;
  }
}
