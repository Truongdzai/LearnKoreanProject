import type { ReactNode } from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { AppStoreProvider } from '@/store/app.store'
import { AuthProviderStore } from '@/store/auth.store'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProviderStore>
        <AppStoreProvider>{children}</AppStoreProvider>
      </AuthProviderStore>
    </ErrorBoundary>
  )
}
