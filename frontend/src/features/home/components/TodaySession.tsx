import { useEffect, useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { fetchStats } from '@/core/api/srs.api'
import { fetchMyQuests } from '@/core/api/me.api'
import { useLessonProgress } from '@/core/lessonProgress'
import { todayISO } from '@/core/skills'
import { setUrlParam } from '@/core/hooks/useTabParam'
import { LAB_TARGET, labDone, labPane, readLabScores, type LabKey } from '@/core/labScores'
import { videoUrl } from '@/data/videos'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import type { SrsStats } from '@/models/srs.model'

const PASS = 70

interface Step {
  id: string
  icon: IconName
  text: string
  done: boolean
  warn?: boolean
  action?: { label: string; run: () => void }
}

// Thời gian còn lại tới nửa đêm (giờ máy), dạng 3:12
function untilMidnight(now: Date): string {
  const end = new Date(now)
  end.setHours(24, 0, 0, 0)
  const mins = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60000))
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`
}

export default function TodaySession() {
  const { t, learnLang, setView, loadLesson, videos, savedVideos, user, todayXp, dailyBonus } = useAppStore()
  const { bonusAvailable } = useAuth()
  const { prog } = useLessonProgress()
  const [stats, setStats] = useState<SrsStats | null>(null)
  const [claimable, setClaimable] = useState(0)
  const [bonusBusy, setBonusBusy] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let alive = true
    fetchStats(learnLang).then((s) => { if (alive) setStats(s) }).catch(() => { if (alive) setStats(null) })
    return () => { alive = false }
  }, [learnLang])

  useEffect(() => {
    let alive = true
    fetchMyQuests()
      .then((r) => {
        if (!alive) return
        setClaimable(r.quests.filter((q) => q.active !== false && !q.claimed && (q.progress ?? 0) >= q.target).length)
      })
      .catch(() => { if (alive) setClaimable(0) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  // Nhiệm vụ phòng luyện chưa xong của tuần hiện tại trong lộ trình (chỉ tiếng Hàn / Trung, khi đã bắt đầu lộ trình).
  // Nạp lộ trình lúc cần để trang chủ không phải tải sẵn dữ liệu từ vựng.
  const [lab, setLab] = useState<{ week: number; label: string; key: LabKey; mode?: string } | null>(null)
  useEffect(() => {
    setLab(null)
    if (learnLang !== 'ko' && learnLang !== 'zh') return undefined
    let alive = true
    Promise.all([
      import('../../english/progress'),
      learnLang === 'ko'
        ? import('@/data/koreanRoadmap').then((m) => m.KO_PLAN_12_WEEKS)
        : import('@/data/chineseRoadmap').then((m) => m.ZH_PLAN_12_WEEKS),
    ]).then(([prog, weeks]) => {
      if (!alive) return
      const plan = prog.readPlan(learnLang)
      if (!plan.start) return
      const week = prog.planWeek(plan.start)
      if (plan.rewarded.includes(week)) return
      const scores = readLabScores(learnLang)
      const t = weeks.find((w) => w.week === week)?.tasks
        .find((x) => x.kind === 'lab' && x.lab && !labDone(scores, x.lab, x.modes ?? [], x.passPct ?? 80))
      if (t?.lab) setLab({ week, label: t.label, key: t.lab, mode: t.modes?.[0] })
    }).catch(() => {  })
    return () => { alive = false }
  }, [learnLang])

  // Bài shadowing gần nhất của đúng ngôn ngữ đang học mà chưa đạt hết câu
  const resume = useMemo(() => {
    const known = [...savedVideos, ...videos]
    for (const [key, e] of Object.entries(prog.l)) {
      if (!key.startsWith('speak:')) continue
      const id = key.slice(6)
      const video = known.find((v) => v.id === id)
      if (!video || (video.lang || 'ko') !== learnLang) continue
      const passed = Object.values(e.s).filter((v) => v >= PASS).length
      if (passed >= e.n) continue
      return { video, passed, total: e.n, title: e.ti || video.title, today: e.t === todayISO() }
    }
    return null
  }, [prog, savedVideos, videos, learnLang])

  const steps: Step[] = []

  if (stats && stats.total > 0) {
    steps.push(stats.due > 0
      ? { id: 'srs', icon: 'cards', text: t('td.due', { n: stats.due }), done: false, action: { label: t('td.review'), run: () => setView('flashcards') } }
      : { id: 'srs', icon: 'cards', text: stats.reviewed_today > 0 ? t('td.reviewed', { n: stats.reviewed_today }) : t('td.noDue'), done: true })
  }

  if (resume) {
    steps.push({
      id: 'lesson', icon: 'mic', done: resume.today,
      text: t('td.resume', { title: resume.title, k: resume.passed, n: resume.total }),
      action: {
        label: t('td.continue'),
        run: () => loadLesson(videoUrl(resume.video.id), { lang: resume.video.lang || learnLang, video: resume.video }),
      },
    })
  }

  if (lab) {
    steps.push({
      id: 'lab', icon: 'tool', done: false,
      text: t('td.lab', { week: lab.week, label: lab.label }),
      action: {
        label: t('td.practice'),
        run: () => {
          const target = LAB_TARGET[lab.key]
          setView(target.view)
          setUrlParam('tab', target.tab)
          setUrlParam('pane', labPane(lab.key, lab.mode))
        },
      },
    })
  }

  if (bonusAvailable) {
    steps.push({
      id: 'bonus', icon: 'gift', text: t('td.bonus'), done: false,
      action: {
        label: bonusBusy ? '…' : t('td.claim'),
        run: () => {
          if (bonusBusy) return
          setBonusBusy(true)
          dailyBonus().catch(() => {  }).finally(() => setBonusBusy(false))
        },
      },
    })
  }

  if (claimable > 0) {
    steps.push({ id: 'quest', icon: 'target', text: t('td.quests', { n: claimable }), done: false, action: { label: t('td.open'), run: () => setView('quests') } })
  }

  const atRisk = (user?.streak ?? 0) > 0 && todayXp === 0
  if (atRisk) {
    steps.unshift({ id: 'streak', icon: 'flame', warn: true, done: false, text: t('td.streakRisk', { n: user.streak, time: untilMidnight(now) }) })
  }

  const open = steps.filter((s) => !s.done)
  if (!steps.length) return null

  return (
    <section className="td" aria-label={t('td.title')}>
      <div className="td-head">
        <span className="td-title"><Icon name="calendar" size={15} /> {t('td.title')}</span>
        <span className="td-count">{open.length ? t('td.left', { n: open.length }) : t('td.allDone')}</span>
      </div>
      {open.length === 0 ? (
        <p className="td-done-line"><Icon name="check-circle" size={16} /> {t('td.doneLine', { n: user?.streak ?? 0 })}</p>
      ) : (
        <ul className="td-list">
          {steps.map((s) => (
            <li key={s.id} className={'td-row' + (s.done ? ' done' : '') + (s.warn ? ' warn' : '')}>
              <Icon name={s.done ? 'check-circle' : s.icon} size={16} />
              <span className="td-text">{s.text}</span>
              {s.action && !s.done && (
                <button type="button" className="btn-primary sm" onClick={s.action.run}>{s.action.label}</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
