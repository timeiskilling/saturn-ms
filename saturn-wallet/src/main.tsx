// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WasmWalletService } from './services/wallet/implementations/wasm-wallet-service'
import { BalanceProvider, WalletProvider } from './contexts/WalletContext';
// import WalletTestComponent from './components/WalletTestComponent';
import WalletMainPage from './components/WalletMainPage';
import './index.css'
const walletService = new WasmWalletService({
  rpcUrl: "https://api.devnet.solana.com",
  jupiterUrl: "https://api.jup.ag"
});

createRoot(document.getElementById('root')!).render(
  <WalletProvider walletService={walletService}>
    <BalanceProvider autoRefreshInterval={25*1000}>
      <WalletMainPage />
    </BalanceProvider>
  </WalletProvider>
)
