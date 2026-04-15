import bs58 from "bs58";
import { type ISolanaChain } from "@phantom/react-sdk";
import type { NonceResponse } from "./verifyWallet";

export type PromoteWalletRequest = {
  request_id: string;
  target_wallet: string;
  signature: string;
};

export async function promoteWallet(
  solana: ISolanaChain,
  targetWalletPublicKey: string,
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
    const promoteMessage = `Promote wallet ${targetWalletPublicKey}. Nonce: ${nonceData.nonce}`;
    const encodedMessage = new TextEncoder().encode(promoteMessage);
    const signedMessage = await solana.signMessage(encodedMessage);

    // Encode the signature as Base58 for the backend
    const signatureBase58 = bs58.encode(signedMessage.signature);

    // Prepare the verification request
    const promotePayload: PromoteWalletRequest = {
      request_id: nonceData.request_id,
      target_wallet: targetWalletPublicKey,
      signature: signatureBase58,
    };

    const response = await fetch("http://localhost:3001/wallet/promote", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promotePayload),
    });

    if (!response.ok) {
      throw new Error(`Failed to promote wallet: ${response.statusText}`);
    }

    window.dispatchEvent(new Event("saturn_wallet_promoted"));
    return true;
  } catch (error) {
    console.error("Wallet promotion error:", error);
    return false;
  }
}
