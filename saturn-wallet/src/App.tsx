import React, { useEffect, useState } from 'react';
import initWasm, { create_wallet_manager, WasmWalletManager } from "encryptions-service";
import { createWallet } from './wasmCalls/createWallet';


const WalletTestComponent: React.FC = () => {
  const [walletManager, setWalletManager] = useState<WasmWalletManager | null>(null);

  
  const [status, setStatus] = useState<string>('Initializing Wasm...');
  const [isReady, setIsReady] = useState(false);
  
  // const [recoveryPhrase, setRecoveryPhrase] = useState<string | null>(null);
  // const [createdPublicKey, setCreatedPublicKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        await initWasm();
        console.log("✅ Wasm init success");

        const rpcUrl = "https://api.devnet.solana.com";
        const jupiterUrl = "https://api.jup.ag";

        console.log("🔄 Call create_wallet_manager...");
        const manager = await create_wallet_manager(rpcUrl, jupiterUrl);

        if (isMounted) {
          console.log("✅ WalletManager ready:", manager);
          setWalletManager(manager); // Зберігаємо менеджер
          setIsReady(true);
          setStatus('Ready to create wallet. Click the button below.');
        }

      } catch (error) {
        console.error("Err:", error);
        if (isMounted) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setStatus(`Error: ${errorMessage}`);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Обробник створення гаманця (Твій код)
  const handleCreate = async () => {
    if (!walletManager) {
      console.error("Wallet manager not initialized");
      return;
    }

    try {
      setStatus("Creating wallet... (Generating keys & hashing password)");
      
      // Викликаємо нашу обгортку
      const response = await createWallet(
        walletManager, 
        "MySuperSecretPassword123!", 
        "My First Wasm Wallet"
      );

      console.log("🎉 Wallet created!", response);

      setStatus("Success! Wallet created.");

    } catch (e) {
      console.error("Error creating wallet:", e);
      setStatus(`Error creating wallet: ${e}`);
    }
  };

  return (
    <div>
      <h2>Test Wasm Wallet</h2>
      
      <div style={{ marginBottom: '20px', padding: '10px', background: '#222', borderRadius: '5px' }}>
        Status: <strong style={{ color: status.startsWith('Error') ? 'red' : '#00FFBD' }}>{status}</strong>
      </div>

      {/* Кнопка активна тільки коли Wasm завантажено */}
      {(
        <button 
          onClick={handleCreate} 
          disabled={!isReady}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: isReady ? 'pointer' : 'not-allowed',
            backgroundColor: isReady ? '#00FFBD' : '#555',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
        >
          {isReady ? "Create New Wallet" : "Loading..."}
        </button>
      )}

      {/* Блок результату (показуємо тільки після успішного створення) */}
      {(
        <div style={{ marginTop: '20px', border: '1px solid #333', padding: '20px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>
          <h3 style={{ color: '#00FFBD' }}>Wallet Created Successfully!</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <small style={{ color: '#888' }}>Public Key:</small>
            {/* <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{createdPublicKey}</div> */}
          </div>

          <div style={{ background: '#330000', padding: '15px', borderRadius: '8px', border: '1px solid red' }}>
            <strong style={{ color: 'red', display: 'block', marginBottom: '5px' }}>SECRET RECOVERY PHRASE (SAVE THIS):</strong>
            {/* <div style={{ fontFamily: 'monospace', fontSize: '18px', lineHeight: '1.5' }}>
              {recoveryPhrase}
            </div> */}
          </div>
        </div>
      )}

      <br />
      <small style={{ color: '#666' }}>Open console (F12) for detailed logs.</small>
    </div>
  );
};

export default WalletTestComponent;