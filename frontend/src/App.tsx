import Sidebar from '@/layout/Sidebar'
import Topbar from '@/layout/Topbar'
import HomePage from '@/features/home/HomePage'
import LearnPage from '@/features/learn/LearnPage'
import LibraryPage from '@/features/library/LibraryPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import ReviewPage from '@/features/review/ReviewPage'
import PricingPage from '@/features/pricing/PricingPage'
import MyVideosPage from '@/features/myvideos/MyVideosPage'
import PathPage from '@/features/path/PathPage'
import VocabHomePage from '@/features/vocab/VocabHomePage'
import LeaderboardPage from '@/features/leaderboard/LeaderboardPage'
import QuestsPage from '@/features/quests/QuestsPage'
import ShopPage from '@/features/shop/ShopPage'
import LookupModal from '@/features/lookup/LookupModal'
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
          {(view === 'courses' || view === 'path') && <PathPage />}
          {view === 'myvideos' && <MyVideosPage />}
          {view === 'vocab' && <VocabHomePage />}
          {view === 'flashcards' && <ReviewPage />}
          {view === 'leaderboard' && <LeaderboardPage />}
          {view === 'quests' && <QuestsPage />}
          {view === 'shop' && <ShopPage />}
          {view === 'dashboard' && <DashboardPage />}
          {view === 'pricing' && <PricingPage />}
        </div>
      </div>
      <LookupModal />
    </div>
  )
}
