import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WalletTestComponent from './App'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletTestComponent />
  </StrictMode>,
)
