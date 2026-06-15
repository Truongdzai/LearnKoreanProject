import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/providers'
import App from '@/App'
import '@/styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>,
)
