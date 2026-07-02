import { lazy, Suspense } from 'react'
import Sidebar from '@/layout/Sidebar'
import Topbar from '@/layout/Topbar'
import Spinner from '@/core/components/Spinner'
import LookupModal from '@/features/lookup/LookupModal'
import AuthModal from '@/features/auth/AuthModal'
import GiftModal from '@/features/gift/GiftModal'
import OnboardingModal from '@/features/onboarding/OnboardingModal'
import FeedbackWidget from '@/features/feedback/FeedbackWidget'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

// Mỗi trang tách thành chunk riêng, chỉ tải khi người dùng mở tới -> khởi động nhẹ hơn nhiều.
const HomePage = lazy(() => import('@/features/home/HomePage'))
const LearnPage = lazy(() => import('@/features/learn/LearnPage'))
const LibraryPage = lazy(() => import('@/features/library/LibraryPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const ReviewPage = lazy(() => import('@/features/review/ReviewPage'))
const PricingPage = lazy(() => import('@/features/pricing/PricingPage'))
const MyVideosPage = lazy(() => import('@/features/myvideos/MyVideosPage'))
const PathPage = lazy(() => import('@/features/path/PathPage'))
const SpeakingPage = lazy(() => import('@/features/speaking/SpeakingPage'))
const VocabHomePage = lazy(() => import('@/features/vocab/VocabHomePage'))
const EnglishPage = lazy(() => import('@/features/english/EnglishPage'))
const ActivitiesPage = lazy(() => import('@/features/activities/ActivitiesPage'))
const LeaderboardPage = lazy(() => import('@/features/leaderboard/LeaderboardPage'))
const QuestsPage = lazy(() => import('@/features/quests/QuestsPage'))
const ShopPage = lazy(() => import('@/features/shop/ShopPage'))
const GardenPage = lazy(() => import('@/features/garden/GardenPage'))
const LingoRadarPage = lazy(() => import('@/features/lingo/LingoRadarPage'))
const AdminPage = lazy(() => import('@/features/admin/AdminPage'))
// Thú cưng là trang trí (không then chốt) + kéo theo bộ ảnh nặng -> hoãn sau lần render đầu.
const PetWidget = lazy(() => import('@/features/pet/PetWidget'))

export default function App() {
  const { view } = useAppStore()
  const { isAdmin } = useAuth()

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          <Suspense fallback={<div className="center-state"><Spinner /></div>}>
            {view === 'home' && <HomePage />}
            {view === 'learn' && <LearnPage />}
            {view === 'library' && <LibraryPage />}
            {(view === 'courses' || view === 'path') && <PathPage />}
            {view === 'myvideos' && <MyVideosPage />}
            {view === 'speaking' && <SpeakingPage />}
            {view === 'english' && <EnglishPage />}
            {view === 'vocab' && <VocabHomePage />}
            {view === 'flashcards' && <ReviewPage />}
            {view === 'activities' && <ActivitiesPage />}
            {view === 'leaderboard' && <LeaderboardPage />}
            {view === 'quests' && <QuestsPage />}
            {view === 'shop' && <ShopPage />}
            {view === 'garden' && <GardenPage />}
            {view === 'lingo' && <LingoRadarPage />}
            {view === 'dashboard' && <DashboardPage />}
            {view === 'pricing' && <PricingPage />}
            {view === 'admin' && isAdmin && <AdminPage />}
          </Suspense>
        </div>
      </div>
      <LookupModal />
      <AuthModal />
      <GiftModal />
      <OnboardingModal />
      <FeedbackWidget />
      <Suspense fallback={null}><PetWidget /></Suspense>
    </div>
  )
}
