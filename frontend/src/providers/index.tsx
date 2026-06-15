import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { AppStoreProvider } from '@/store/app.store'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AppStoreProvider>{children}</AppStoreProvider>
    </ErrorBoundary>
  )
}
