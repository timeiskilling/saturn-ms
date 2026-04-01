import { useState, useEffect } from "react";
import { createSolanaClient,address,LAMPORTS_PER_SOL} from "gill";
import { TOKEN_PROGRAM_ADDRESS, TOKEN_2022_PROGRAM_ADDRESS} from "gill/programs";
// import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { usePhantom } from "@phantom/react-sdk";
import { AddressType } from "@phantom/browser-sdk";

interface CacheEntry {
  promise: Promise<number> | null;
  data: number | null;
  timestamp: number;
}
const cache: Record<string, CacheEntry> = {};
const CACHE_TTL = 15000; // 15 seconds cache

export function useSolanaBalance(
  rpcUrl: string = "https://api.devnet.solana.com",
) {
  const { isConnected, addresses } = usePhantom();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchBalance() {
      if (isConnected && addresses.length > 0) {
        const solAddress = addresses.find(
          (addr) => addr.addressType === AddressType.solana,
        );

        if (solAddress) {
          const addressPb = solAddress.address;
          const cacheKey = `${addressPb}-${rpcUrl}`;

          if (!cache[cacheKey]) {
            cache[cacheKey] = { promise: null, data: null, timestamp: 0 };
          }

          const entry = cache[cacheKey];
          const now = Date.now();

          if (entry.data !== null && now - entry.timestamp < CACHE_TTL) {
            if (mounted) setBalance(entry.data);
            return;
          }

          if (entry.promise) {
            try {
              const data = await entry.promise;
              if (mounted) setBalance(data);
            } catch (error) {
              if (mounted) setBalance(null);
            }
            return;
          }

          entry.promise = (async () => {
            const { rpc } = createSolanaClient({
              urlOrMoniker: rpcUrl,
            })
            const publicKey = address(addressPb);
            const balanceLamports = await rpc.getBalance(publicKey).send();
            return Number(balanceLamports.value) / Number(LAMPORTS_PER_SOL);
          })();

          try {
            const data = await entry.promise;
            entry.data = data;
            entry.timestamp = Date.now();
            if (mounted) setBalance(data);
          } catch (error) {
            console.error("Failed to fetch balance:", error);
            if (mounted) setBalance(null);
          } finally {
            entry.promise = null;
          }
        }
      } else {
        if (mounted) setBalance(null);
      }
    }

    fetchBalance();

    return () => {
      mounted = false;
    };
  }, [isConnected, addresses, rpcUrl]);

  return balance;
}
