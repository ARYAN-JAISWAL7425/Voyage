import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { SavedTripsProvider } from '@/hooks/SavedTripsProvider'
import { AuthProvider } from '@/hooks/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SavedTripsProvider>
          <App />
        </SavedTripsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
