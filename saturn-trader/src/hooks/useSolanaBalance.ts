import { useState, useEffect } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { usePhantom } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";

export function useSolanaBalance(
  rpcUrl: string = "https://api.devnet.solana.com",
) {
  const { isConnected, addresses } = usePhantom();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBalance() {
      if (isConnected && addresses.length > 0) {
        try {
          const solAddress = addresses.find(
            (addr) => addr.addressType === AddressType.solana,
          );

          if (solAddress) {
            const connection = new Connection(rpcUrl, "confirmed");
            const pubKey = new PublicKey(solAddress.address);
            const balanceLamports = await connection.getBalance(pubKey);

            setBalance(balanceLamports / LAMPORTS_PER_SOL);
          }
        } catch (error) {
          console.error("Failed to fetch balance:", error);
          setBalance(null);
        }
      } else {
        setBalance(null);
      }
    }

    fetchBalance();
  }, [isConnected, addresses, rpcUrl]);

  return balance;
}
