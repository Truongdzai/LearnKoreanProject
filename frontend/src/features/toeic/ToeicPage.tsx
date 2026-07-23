import { useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { GRAMMAR_CAPSULES, SKILLS, TOEIC_TARGET, estimateScore, estimateScoreFull } from '@/data/toeicCore'
import { useLearnedWords } from '../english/progress'
import { buildFullTest, buildMiniTest, buildPartRun, buildWeakRun, skillStats, weakestSkills, type RunGroup, type RunResult } from './engine'
import { toeicDay, useActivitySince, useToeicState, type TaskCtx } from './state'
import Runner from './components/Runner'
import Roadmap60 from './components/Roadmap60'
import { CapsuleList, CapsuleView } from './components/CapsuleView'
import PartPractice from './components/PartPractice'
import SkillReport from './components/SkillReport'

type Tab = 'road' | 'grammar' | 'practice' | 'test' | 'report'

type Session =
  | { kind: 'practice'; part: number; n: number }
  | { kind: 'weak'; n: number }
  | { kind: 'test'; full?: boolean }

interface SessionResult {
  session: Session
  res: RunResult
  est?: { listening: number; reading: number; total: number }
}

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'road', label: 'Lộ trình 60 ngày', icon: 'map' },
  { id: 'grammar', label: 'Ngữ pháp', icon: 'book' },
  { id: 'practice', label: 'Luyện theo Part', icon: 'target' },
  { id: 'test', label: 'Thi thử', icon: 'trophy' },
  { id: 'report', label: 'Phân tích', icon: 'chart' },
]

const MINI_TEST_SECONDS = 30 * 60
const FULL_TEST_SECONDS = 120 * 60

export default function ToeicPage() {
  const { recordEvent } = useAppStore()
  const { state, startPlan, toggleTask, recordCapsule, recordAttempt, grantDayReward, latestEstimate } = useToeicState()
  const { learned } = useLearnedWords()
  const { activity, refresh } = useActivitySince(state.start)

  const [tab, setTab] = useState<Tab>('road')
  const [capsuleId, setCapsuleId] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState<SessionResult | null>(null)

  const ctx: TaskCtx = { state, learned, activity }
  const day = toeicDay(state.start)

  const weakList = useMemo(() => {
    const w = weakestSkills(skillStats(state.attempts.map((a) => a.skills)))
    return w.length ? w.map((s) => s.skill) : ['word-form', 'tense', 'l-wh']
  }, [state.attempts])

  const groups: RunGroup[] = useMemo(() => {
    if (!session) return []
    if (session.kind === 'practice') return buildPartRun(session.part, session.n)
    if (session.kind === 'weak') return buildWeakRun(weakList, session.n)
    return session.full ? buildFullTest() : buildMiniTest()
  }, [session, nonce])

  const startSession = (s: Session) => {
    setResult(null)
    setNonce((x) => x + 1)
    setSession(s)
  }

  const onFinish = (res: RunResult) => {
    if (!session) return
    const est = session.kind === 'test'
      ? (session.full
        ? estimateScoreFull(res.rawL, res.rawR)
        : estimateScore(res.rawL, res.totalL, res.rawR, res.totalR))
      : undefined
    recordAttempt({
      t: new Date().toISOString(),
      mode: session.kind === 'practice' ? 'practice' : session.kind === 'weak' ? 'weak' : 'test',
      part: session.kind === 'practice' ? session.part : undefined,
      n: res.total,
      correct: res.correct,
      skills: res.skills,
      est,
    })
    recordEvent('toeic', 1)
    refresh()
    setResult({ session, res, est })
    setSession(null)
  }

  if (session) {
    const title = session.kind === 'practice'
      ? `Luyện Part ${session.part} · ${session.n} câu`
      : session.kind === 'weak' ? 'Luyện điểm yếu'
      : session.full ? 'FULL TEST · 200 câu / 120 phút' : 'Thi thử TOEIC rút gọn'
    return (
      <div className="toeic-page">
        <Runner
          groups={groups}
          mode={session.kind === 'test' ? 'test' : 'practice'}
          title={title}
          timerSec={session.kind === 'test' ? (session.full ? FULL_TEST_SECONDS : MINI_TEST_SECONDS) : undefined}
          playOnce={session.kind === 'test' && session.full}
          onFinish={onFinish}
          onExit={() => setSession(null)}
        />
      </div>
    )
  }

  if (result) {
    const { res, est } = result
    const pct = res.total ? Math.round((res.correct / res.total) * 100) : 0
    return (
      <div className="toeic-page">
        <div className="quiz-done toeic-result">
          {est ? (
            <>
              <div className="tr-score-row center">
                <div className="tr-score-card big">
                  <small>Điểm TOEIC ước lượng</small>
                  <b className={est.total >= TOEIC_TARGET ? 'hit' : ''}>{est.total}</b>
                  <span>/ 990 · mục tiêu {TOEIC_TARGET}+</span>
                </div>
                <div className="tr-score-card"><small>🎧 Listening</small><b>{est.listening}</b><span>{res.rawL}/{res.totalL} câu đúng</span></div>
                <div className="tr-score-card"><small>📖 Reading</small><b>{est.reading}</b><span>{res.rawR}/{res.totalR} câu đúng</span></div>
              </div>
              <p className="toeic-disclaimer">
                {result.session.kind === 'test' && result.session.full
                  ? `FULL TEST ${res.total} câu — quy đổi theo bảng neo sát bảng điểm thật (Nghe ${res.rawL}/100 · Đọc ${res.rawR}/100).`
                  : `Ước lượng từ đề rút gọn ${res.total} câu — chỉ mang tính tham khảo. Muốn số liệu sát nhất, làm FULL TEST 200 câu / 120 phút.`}
              </p>
            </>
          ) : (
            <div className="qd-ring" style={{ ['--p' as string]: pct }}>
              <b>{pct}%</b>
              <span>{res.correct}/{res.total}</span>
            </div>
          )}
          <h3>
            {pct >= 85 ? 'Xuất sắc! 🎉' : pct >= 65 ? 'Tốt lắm, tiếp tục giữ nhịp!' : 'Sai là cách não học — xem lại giải thích bên dưới nhé.'}
          </h3>

          {res.wrong.length > 0 && (
            <div className="toeic-wrong">
              <div className="tr-sec-title">Các câu sai ({res.wrong.length})</div>
              {res.wrong.map((w, i) => (
                <div key={i} className="toeic-wrong-item">
                  <small>Part {w.part}</small>
                  <p lang="en">{w.q}</p>
                  <p className="tw-picked">Bạn chọn: <span lang="en">{w.picked}</span> → Đúng: <b lang="en">{w.right}</b></p>
                  {w.explain && <p className="tw-explain">💡 {w.explain}</p>}
                  {w.skill && SKILLS[w.skill] && (
                    <p className="tw-tip">🎯 Mẹo dạng "{SKILLS[w.skill].vi}": {SKILLS[w.skill].advice}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="quiz-done-actions">
            <button className="btn-primary" onClick={() => startSession(result.session)}>
              <Icon name="rocket" size={15} /> Làm lượt mới
            </button>
            <button className="btn-ghost" onClick={() => { setResult(null); setTab(result.session.kind === 'test' ? 'report' : tab) }}>
              {result.session.kind === 'test' ? 'Xem phân tích' : 'Quay lại'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const capsule = capsuleId ? GRAMMAR_CAPSULES.find((c) => c.id === capsuleId) : null

  return (
    <div className="toeic-page">
      <div className="lesson-head">
        <h2><Icon name="book" /> Luyện thi TOEIC · 60 ngày</h2>
        <div className="meta">
          Mục tiêu {TOEIC_TARGET}+ điểm (Nghe – Đọc)
          {state.start ? ` · Ngày ${day}/60` : ' · Chưa bắt đầu'}
          {latestEstimate ? ` · Ước lượng gần nhất: ${latestEstimate.total} điểm` : ''}
        </div>
      </div>

      <div className="en-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => { setTab(t.id); setCapsuleId(null) }}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'road' && (
        <Roadmap60
          state={state}
          ctx={ctx}
          latestEstimate={latestEstimate}
          onStart={startPlan}
          onToggleTask={toggleTask}
          onGrantReward={grantDayReward}
          onOpenCapsule={(id) => { setTab('grammar'); setCapsuleId(id) }}
          onPractice={(part, n) => startSession({ kind: 'practice', part, n })}
          onWeak={(n) => startSession({ kind: 'weak', n })}
          onMiniTest={() => startSession({ kind: 'test' })}
        />
      )}

      {tab === 'grammar' && (capsule ? (
        <CapsuleView
          capsule={capsule}
          best={state.capsules[capsule.id]}
          onDrillDone={(pct) => recordCapsule(capsule.id, pct)}
          onBack={() => setCapsuleId(null)}
        />
      ) : (
        <CapsuleList scores={state.capsules} onOpen={setCapsuleId} />
      ))}

      {tab === 'practice' && (
        <PartPractice attempts={state.attempts} onStart={(part, n) => startSession({ kind: 'practice', part, n })} />
      )}

      {tab === 'test' && (
        <div className="toeic-test-intro">
          <div className="tt-card">
            <h3>Thi thử rút gọn</h3>
            <ul>
              <li><b>~50 câu · 30 phút</b></li>
              <li>Hợp với kiểm tra nhanh giữa lộ trình; điểm ước lượng thang 990 mang tính tham khảo.</li>
            </ul>
            <button className="btn-primary" onClick={() => startSession({ kind: 'test' })}>
              <Icon name="target" size={16} /> Thi rút gọn
            </button>
          </div>
          <div className="tt-card full">
            <h3>FULL TEST — theo cấu trúc đề  2026</h3>
            <button className="btn-primary" onClick={() => startSession({ kind: 'test', full: true })}>
              <Icon name="trophy" size={16} /> Vào FULL TEST
            </button>
            {latestEstimate && (
              <small className="tt-last">Lần gần nhất: <b>{latestEstimate.total}</b>/990 (Nghe {latestEstimate.listening} · Đọc {latestEstimate.reading})</small>
            )}
          </div>
        </div>
      )}

      {tab === 'report' && (
        <SkillReport
          attempts={state.attempts}
          onWeak={(n) => startSession({ kind: 'weak', n })}
          onMiniTest={() => startSession({ kind: 'test' })}
        />
      )}
    </div>
  )
}
