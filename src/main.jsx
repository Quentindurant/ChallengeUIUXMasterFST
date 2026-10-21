import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'
import { DemandeProvider } from './context/DemandeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DemandeProvider>
        <App />
      </DemandeProvider>
    </BrowserRouter>
  </StrictMode>,
)
