import { type TokenAccount } from "@/solanaAccountData/tokenAccount";
import { usePhantom } from "@phantom/react-sdk";
import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

export function getTokenAccounts(
  programID: PublicKey,
  rpcUrl: string = "https://api.devnet.solana.com",
) {
  const { isConnected, addresses } = usePhantom();
  const [tokens, setTokens] = useState<TokenAccount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokenAccounts = async () => {
    if (!addresses?.[0] || !isConnected) return;

    setLoading(true);

    // try {
    //   const connection = new Connection(rpcUrl);
    //   const publicKey = new PublicKey(addresses[0].address);

    // }
  };
}
