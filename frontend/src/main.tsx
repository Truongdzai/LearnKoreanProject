import { createRoot } from 'react-dom/client'
import { AppProviders } from '@/providers'
import App from '@/App'
import { initMonitor } from '@/core/monitor'
import { initAnalytics } from '@/core/analytics'
import { registerServiceWorker } from '@/core/pwa'
import { captureDuelCode, captureRefCode } from '@/core/utils/referral'
import '@/styles/globals.css'

initMonitor()
void initAnalytics()
registerServiceWorker()
captureRefCode()
captureDuelCode()

createRoot(document.getElementById('root')!).render(
  <AppProviders>
    <App />
  </AppProviders>,
)
