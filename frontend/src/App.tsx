import { Suspense, useState } from 'react'
import { lazyPage } from '@/core/lazyPage'
import Sidebar from '@/layout/Sidebar'
import Footer from '@/layout/Footer'
import Topbar from '@/layout/Topbar'
import Spinner from '@/core/components/Spinner'
import LookupModal from '@/features/lookup/LookupModal'
import AuthModal from '@/features/auth/AuthModal'
import VerifyEmailBanner from '@/features/auth/VerifyEmailBanner'
import ConsentBar from '@/features/shared/ConsentBar'
import ChangePasswordModal from '@/features/auth/ChangePasswordModal'
import GiftModal from '@/features/gift/GiftModal'
import OnboardingModal from '@/features/onboarding/OnboardingModal'
import FeedbackWidget from '@/features/feedback/FeedbackWidget'
import NoAccess from '@/features/shared/NoAccess'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'

const HomePage = lazyPage(() => import('@/features/home/HomePage'))
const LearnPage = lazyPage(() => import('@/features/learn/LearnPage'))
const LibraryPage = lazyPage(() => import('@/features/library/LibraryPage'))
const DashboardPage = lazyPage(() => import('@/features/dashboard/DashboardPage'))
const ReviewPage = lazyPage(() => import('@/features/review/ReviewPage'))
const PricingPage = lazyPage(() => import('@/features/pricing/PricingPage'))
const MyVideosPage = lazyPage(() => import('@/features/myvideos/MyVideosPage'))
const PathPage = lazyPage(() => import('@/features/path/PathPage'))
const SpeakingPage = lazyPage(() => import('@/features/speaking/SpeakingPage'))
const TutorPage = lazyPage(() => import('@/features/tutor/TutorPage'))
const VocabHomePage = lazyPage(() => import('@/features/vocab/VocabHomePage'))
const EnglishPage = lazyPage(() => import('@/features/english/EnglishPage'))
const ToeicPage = lazyPage(() => import('@/features/toeic/ToeicPage'))
const KoreanPage = lazyPage(() => import('@/features/korean/KoreanPage'))
const ChinesePage = lazyPage(() => import('@/features/chinese/ChinesePage'))
const TopikPage = lazyPage(() => import('@/features/topik/TopikPage'))
const HskPage = lazyPage(() => import('@/features/hsk/HskPage'))
const ActivitiesPage = lazyPage(() => import('@/features/activities/ActivitiesPage'))
const LeaderboardPage = lazyPage(() => import('@/features/leaderboard/LeaderboardPage'))
const QuestsPage = lazyPage(() => import('@/features/quests/QuestsPage'))
const ShopPage = lazyPage(() => import('@/features/shop/ShopPage'))
const GardenPage = lazyPage(() => import('@/features/garden/GardenPage'))
const LingoRadarPage = lazyPage(() => import('@/features/lingo/LingoRadarPage'))
const AdminPage = lazyPage(() => import('@/features/admin/AdminPage'))
const PetWidget = lazyPage(() => import('@/features/pet/PetWidget'))
const LandingPage = lazyPage(() => import('@/features/landing/LandingPage'))
const HelpPage = lazyPage(() => import('@/features/pages/PublicPages').then((m) => ({ default: m.HelpPage })))
const AboutPage = lazyPage(() => import('@/features/pages/PublicPages').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazyPage(() => import('@/features/pages/PublicPages').then((m) => ({ default: m.ContactPage })))
const BlogPage = lazyPage(() => import('@/features/pages/PublicPages').then((m) => ({ default: m.BlogPage })))
const NotFoundPage = lazyPage(() => import('@/features/pages/PublicPages').then((m) => ({ default: m.NotFoundPage })))
const TermsPage = lazyPage(() => import('@/features/pages/LegalPages').then((m) => ({ default: m.TermsPage })))
const PrivacyPage = lazyPage(() => import('@/features/pages/LegalPages').then((m) => ({ default: m.PrivacyPage })))

export default function App() {
  const { view, t } = useAppStore()
  const { isAdmin, isAuthed } = useAuth()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="app">
      <a className="skip-link" href="#main">{t('a11y.skip')}</a>
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <Topbar navOpen={navOpen} onMenu={() => setNavOpen(true)} />
        <div className="content">
          <VerifyEmailBanner />
          <main id="main" tabIndex={-1} aria-label={t('a11y.main')}>
          <Suspense fallback={<div className="center-state"><Spinner /></div>}>
            {view === 'home' && (isAuthed ? <HomePage /> : <LandingPage />)}
            {view === 'help' && <HelpPage />}
            {view === 'about' && <AboutPage />}
            {view === 'contact' && <ContactPage />}
            {view === 'blog' && <BlogPage />}
            {view === 'terms' && <TermsPage />}
            {view === 'privacy' && <PrivacyPage />}
            {view === 'notfound' && <NotFoundPage />}
            {view === 'learn' && <LearnPage />}
            {view === 'library' && <LibraryPage />}
            {(view === 'courses' || view === 'path') && <PathPage />}
            {view === 'myvideos' && <MyVideosPage />}
            {view === 'speaking' && <SpeakingPage />}
            {view === 'tutor' && <TutorPage />}
            {view === 'english' && <EnglishPage />}
            {view === 'toeic' && <ToeicPage />}
            {view === 'korean' && <KoreanPage />}
            {view === 'chinese' && <ChinesePage />}
            {view === 'topik' && <TopikPage />}
            {view === 'hsk' && <HskPage />}
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
            {view === 'admin' && (isAdmin ? <AdminPage /> : <NoAccess />)}
          </Suspense>
          </main>
          <Footer />
        </div>
      </div>
      <ConsentBar />
      <LookupModal />
      <AuthModal />
      <ChangePasswordModal />
      <GiftModal />
      <OnboardingModal />
      <FeedbackWidget />
      <Suspense fallback={null}><PetWidget /></Suspense>
    </div>
  )
}
