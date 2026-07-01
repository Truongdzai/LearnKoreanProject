import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/providers'
import App from '@/App'
import { initMonitor } from '@/core/monitor'
import '@/styles/globals.css'

initMonitor()

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>,
)
