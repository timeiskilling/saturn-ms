import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WalletTestComponent from './App'
import MetaplexBackground from './mainPage/main'

createRoot(document.getElementById('root')!).render(
 <StrictMode>
    <MetaplexBackground />
    {/* Ваш контент буде автоматично поверх фону */}
    <div style={{ position: 'relative', zIndex: 1 ,color: 'white' }}> 
       <WalletTestComponent />
    </div>
  </StrictMode>,
)
