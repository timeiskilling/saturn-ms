export type TargetPayload = {
  target_wallet: string;
};

export async function disconnectWallet(
  targetWalletPublicKey: string,
): Promise<boolean> {
  try {
    const payload: TargetPayload = {
      target_wallet: targetWalletPublicKey,
    };

    const response = await fetch("http://localhost:3001/wallet/disconnect", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to disconnect wallet: ${response.statusText}`);
    }

    window.dispatchEvent(new Event("saturn_wallet_disconnected"));
    return true;
  } catch (error) {
    console.error("Wallet disconnect error:", error);
    return false;
  }
}
