import React, { useEffect, useState } from 'react';
// 1. init (default) 
import initWasm, { create_wallet_manager } from "encryptions-service";

const StartWalletTestComponent: React.FC = () => {
  const [status, setStatus] = useState<string>('Whaiting...');

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {

        await initWasm();
        console.log("Wasm init succes");

        const rpcUrl = "https://api.devnet.solana.com";
        const jupiterUrl = "https://api.jup.ag";

        console.log("Call create_wallet_manager...");

        const walletManager = await create_wallet_manager(rpcUrl, jupiterUrl);

        if (isMounted) {
          console.log("Result (WasmWalletManager):", walletManager);
          setStatus('Sucsses! Objecy in console.');
        }

        const request = {
          password: "MySuperSecretPassword123!",
          displayName: "My First Wasm Wallet",
        };

        const pubKey = await walletManager.createWallet(request)

        console.log("Response Public Key:", pubKey);


      } catch (error) {
        console.error("Err:", error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unexpected behavior';
          setStatus(`Err: ${errorMessage}`);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Test Wasm Wallet</h2>
      <p>Status: <strong>{status}</strong></p>
      <small>Open console (F12).</small>
    </div>
  );
};

export default StartWalletTestComponent;