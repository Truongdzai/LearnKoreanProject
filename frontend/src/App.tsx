import Sidebar from '@/layout/Sidebar'
import Topbar from '@/layout/Topbar'
import HomePage from '@/features/home/HomePage'
import LearnPage from '@/features/learn/LearnPage'
import LibraryPage from '@/features/library/LibraryPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ReviewPage from '@/features/review/ReviewPage'
import Placeholder from '@/features/shared/Placeholder'
import { useAppStore } from '@/store/app.store'

export default function App() {
  const { view } = useAppStore()

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          {view === 'home' && <HomePage />}
          {view === 'learn' && <LearnPage />}
          {view === 'library' && <LibraryPage />}
          {view === 'dashboard' && <DashboardPage />}
          {view === 'vocab' && <ReviewPage />}
          {(view === 'myvideos' || view === 'courses') && <Placeholder view={view} />}
        </div>
      </div>
    </div>
  )
}
