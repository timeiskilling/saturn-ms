import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WalletTestComponent from './components/WalletTestComponent'
import { WasmWalletService } from './services/wallet/implementations/wasm-wallet-service'
import { WalletProvider } from './contexts/WalletContext';

const walletService = new WasmWalletService({
  rpcUrl: "https://api.devnet.solana.com",
  jupiterUrl: "https://api.jup.ag"
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider walletService={walletService}>
      <WalletTestComponent />
    </WalletProvider>
  </StrictMode>,
)
