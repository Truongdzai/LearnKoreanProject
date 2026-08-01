import { useCallback, useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { useTabs } from '@/core/a11y'
import ViContentNote from '../shared/ViContentNote'
import { useAppStore } from '@/store/app.store'
import { GRAMMAR_CAPSULES, SKILLS, TOEIC_TARGET, estimateScore, estimateScoreFull } from '@/data/toeicCore'
import { useLearnedWords } from '../english/learned'
import { BANK_SIZE, buildFullTest, buildMiniTest, buildPartRun, buildReviewRun, buildWeakRun, rebuildTest, skillStats, weakestSkills, type RunGroup, type RunResult } from './engine'
import { clearRun, loadRun, saveRun, type RunProgress, type SavedRun } from './testSave'
import { dueWrong, toeicDay, useActivitySince, useToeicState, type TaskCtx } from './state'
import Runner from './components/Runner'
import Roadmap60 from './components/Roadmap60'
import { CapsuleList, CapsuleView } from './components/CapsuleView'
import PartPractice from './components/PartPractice'
import SkillReport from './components/SkillReport'
import WrongBook from './components/WrongBook'
import TestReview from './components/TestReview'

type Tab = 'road' | 'grammar' | 'practice' | 'test' | 'report' | 'wrongbook'

type Session =
  | { kind: 'practice'; part: number; n: number }
  | { kind: 'weak'; n: number }
  | { kind: 'test'; full?: boolean }
  | { kind: 'review'; keys: string[] }

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
  { id: 'wrongbook', label: 'Sổ tay câu sai', icon: 'book' },
  { id: 'report', label: 'Phân tích', icon: 'chart' },
]
const TAB_IDS = TABS.map((t) => t.id)

const MINI_TEST_SECONDS = 30 * 60
const FULL_SECTION_SECONDS = { listening: 45 * 60, reading: 75 * 60 }

export default function ToeicPage() {
  const { recordEvent } = useAppStore()
  const { state, startPlan, toggleTask, recordCapsule, recordAttempt, recordWrong, clearWrong, grantDayReward, latestEstimate } = useToeicState()
  const { learned } = useLearnedWords()
  const { activity, refresh } = useActivitySince(state.start)

  const [tab, setTab] = useState<Tab>('road')
  const [capsuleId, setCapsuleId] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState<SessionResult | null>(null)
  const [saved, setSaved] = useState<SavedRun | null>(loadRun)
  const [resumed, setResumed] = useState<SavedRun | null>(null)
  const [reviewing, setReviewing] = useState(false)

  const ctx: TaskCtx = { state, learned, activity }
  const day = toeicDay(state.start)

  const pickTab = (t: Tab) => { setTab(t); setCapsuleId(null) }
  const tabs = useTabs('toeic', TAB_IDS, tab, pickTab, 'Luyện thi TOEIC')

  const weakList = useMemo(() => {
    const w = weakestSkills(skillStats(state.attempts.map((a) => a.skills)))
    return w.length ? w.map((s) => s.skill) : ['word-form', 'tense', 'l-wh']
  }, [state.attempts])

  const groups: RunGroup[] = useMemo(() => {
    if (!session) return []
    if (session.kind === 'practice') return buildPartRun(session.part, session.n)
    if (session.kind === 'weak') return buildWeakRun(weakList, session.n)
    if (session.kind === 'review') return buildReviewRun(session.keys, session.keys.length)
    if (resumed) return rebuildTest(resumed.ids)
    return session.full ? buildFullTest() : buildMiniTest()
  }, [session, nonce])

  const startSession = (s: Session) => {
    setResult(null)
    setReviewing(false)
    setResumed(null)
    if (s.kind === 'test') { clearRun(); setSaved(null) }
    setNonce((x) => x + 1)
    setSession(s)
  }

  const resumeSaved = () => {
    if (!saved) return
    setResult(null)
    setResumed(saved)
    setNonce((x) => x + 1)
    setSession({ kind: 'test', full: saved.full })
  }

  const dropSaved = () => {
    clearRun()
    setSaved(null)
  }

  const savedInReading = !!saved && Number(saved.ids[saved.gi]?.[1] ?? 0) >= 5
  const savedMinutes = saved
    ? Math.ceil((savedInReading || !saved.full ? saved.remR || saved.remL : saved.remL + saved.remR) / 60)
    : 0

  const persist = useCallback((p: RunProgress) => {
    if (!session || session.kind !== 'test') return
    saveRun({ ...p, full: !!session.full, ids: groups.map((x) => x.id), savedAt: Date.now() })
  }, [session, groups])

  const onFinish = (res: RunResult) => {
    if (!session) return
    const est = session.kind === 'test'
      ? (session.full
        ? estimateScoreFull(res.rawL, res.rawR)
        : estimateScore(res.rawL, res.totalL, res.rawR, res.totalR))
      : undefined
    recordAttempt({
      t: new Date().toISOString(),
      mode: session.kind === 'practice' ? 'practice' : session.kind === 'weak' ? 'weak' : session.kind === 'review' ? 'review' : 'test',
      part: session.kind === 'practice' ? session.part : undefined,
      n: res.total,
      correct: res.correct,
      skills: res.skills,
      est,
    })
    recordWrong(res.wrong.map((w) => ({ key: w.key, part: w.part })), res.rightKeys)
    recordEvent('toeic', 1)
    refresh()
    clearRun()
    setSaved(null)
    setResumed(null)
    setResult({ session, res, est })
    setSession(null)
  }

  if (session) {
    const title = session.kind === 'practice'
      ? `Luyện Part ${session.part} · ${session.n} câu`
      : session.kind === 'weak' ? 'Luyện điểm yếu'
      : session.kind === 'review' ? `Luyện lại câu sai · ${session.keys.length} câu`
      : session.full ? 'FULL TEST · 200 câu · Nghe 45′ + Đọc 75′' : 'Thi thử TOEIC rút gọn'
    return (
      <div className="toeic-page">
        <Runner
          groups={groups}
          mode={session.kind === 'test' ? 'test' : 'practice'}
          title={title}
          timerSec={session.kind === 'test' && !session.full ? MINI_TEST_SECONDS : undefined}
          sectionSec={session.kind === 'test' && session.full ? FULL_SECTION_SECONDS : undefined}
          playOnce={session.kind === 'test' && session.full}
          initial={resumed ?? undefined}
          onPersist={session.kind === 'test' ? persist : undefined}
          onFinish={onFinish}
          onExit={() => { setSession(null); setSaved(loadRun()) }}
        />
      </div>
    )
  }

  if (result && reviewing) {
    return (
      <div className="toeic-page">
        <div className="lesson-head">
          <h2><Icon name="book" /> Ôn lại bài thi</h2>
          <div className="meta">{result.res.correct}/{result.res.total} câu đúng · xem lại từng câu kèm giải thích</div>
        </div>
        <TestReview res={result.res} onBack={() => setReviewing(false)} />
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

          <p className="toeic-wb-note">
            {result.session.kind === 'review'
              ? res.rightKeys.length > 0
                ? `📓 Đã gạch ${res.rightKeys.length} câu khỏi sổ tay câu sai.`
                : '📓 Chưa câu nào được gạch khỏi sổ — cứ luyện lại lần nữa nhé.'
              : res.wrong.length > 0
                ? `📓 ${res.wrong.length} câu sai đã được ghi vào Sổ tay câu sai để luyện lại sau.`
                : '📓 Không có câu nào phải ghi vào sổ tay câu sai.'}
          </p>

          {res.wrong.length > 0 && (
            <div className="toeic-wrong">
              <div className="tr-sec-title">Các câu sai ({res.wrong.length})</div>
              {res.wrong.slice(0, 5).map((w, i) => (
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
              {res.wrong.length > 5 && (
                <button className="btn-ghost sm tw-more" onClick={() => setReviewing(true)}>
                  Xem đủ {res.wrong.length} câu sai + {res.correct} câu đúng trong “Ôn lại từng câu”
                </button>
              )}
            </div>
          )}

          <div className="quiz-done-actions">
            <button className="btn-primary" onClick={() => setReviewing(true)}>
              <Icon name="book" size={15} /> Ôn lại từng câu
            </button>
            <button className="btn-ghost" onClick={() => startSession(result.session)}>
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
  const due = dueWrong(state.wrong)

  return (
    <div className="toeic-page">
      <div className="lesson-head">
        <h2><Icon name="book" /> Luyện thi TOEIC · 60 ngày</h2>
        <div className="meta">
          Mục tiêu {TOEIC_TARGET}+ điểm (Nghe – Đọc)
          {state.start ? ` · Ngày ${day}/60` : ' · Chưa bắt đầu'}
          {latestEstimate ? ` · Ước lượng gần nhất: ${latestEstimate.total} điểm` : ''}
          {state.wrong.length ? ` · 📓 ${state.wrong.length} câu sai chờ ôn` : ''}
          {due.length ? ` · ⏰ ${due.length} câu đến hạn ôn hôm nay` : ''}
        </div>
      </div>

      <ViContentNote />

      <div className="en-tabs" {...tabs.list}>
        {TABS.map((t) => (
          <button key={t.id} {...tabs.tab(t.id)} className={'en-tab' + (tab === t.id ? ' on' : '')} onClick={() => pickTab(t.id)}>
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div {...tabs.panel(tab)}>
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
          onWrongbook={() => setTab('wrongbook')}
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
          {saved && (
            <div className="tt-resume">
              <div>
                <b>⏸️ Bạn có một bài thi đang dở</b>
                <p>
                  {saved.full ? 'FULL TEST 200 câu' : 'Thi thử rút gọn'} · đã làm{' '}
                  {Object.keys(saved.answers).length} câu · còn {savedMinutes} phút
                  {saved.full ? (savedInReading ? ' của phần Đọc' : ' (Nghe + Đọc)') : ''}.
                  Bài tự lưu nên tắt máy hay lỡ tay thoát vẫn không mất.
                </p>
              </div>
              <div className="tt-resume-actions">
                <button className="btn-primary sm" onClick={resumeSaved}>
                  <Icon name="rocket" size={14} /> Tiếp tục bài thi
                </button>
                <button className="btn-ghost sm" onClick={dropSaved}>Bỏ bài này</button>
              </div>
            </div>
          )}
          <div className="tt-card">
            <h3>Thi thử rút gọn</h3>
            <ul>
              <li><b>~50 câu · 30 phút</b></li>
              <li>Hợp với kiểm tra nhanh giữa lộ trình; điểm ước lượng thang 990 mang tính tham khảo.</li>
              <li>Cũng bốc ngẫu nhiên nên làm lại nhiều lần vẫn ra đề mới.</li>
            </ul>
            <button className="btn-primary" onClick={() => startSession({ kind: 'test' })}>
              <Icon name="target" size={16} /> Thi rút gọn
            </button>
          </div>
          <div className="tt-card full">
            <h3>FULL TEST — theo cấu trúc đề 2026</h3>
            <ul>
              <li><b>200 câu · Nghe 45 phút + Đọc 75 phút</b> tính giờ riêng như đề thật, đủ 7 Part đúng tỉ lệ, đánh số liên tục 1–200.</li>
              <li>Audio phát <b>đúng một lần</b> và có câu dẫn như phòng thi; điểm quy đổi bằng bảng neo sát thang ETS.</li>
              <li>Bài <b>tự lưu liên tục</b> — tắt máy giữa chừng vẫn quay lại làm tiếp được.</li>
              <li>Mỗi lượt <b>bốc ngẫu nhiên từ kho {BANK_SIZE} câu</b> nên hầu như không lần nào trùng đề.</li>
            </ul>
            <button className="btn-primary" onClick={() => startSession({ kind: 'test', full: true })}>
              <Icon name="trophy" size={16} /> Vào FULL TEST
            </button>
            {latestEstimate && (
              <small className="tt-last">Lần gần nhất: <b>{latestEstimate.total}</b>/990 (Nghe {latestEstimate.listening} · Đọc {latestEstimate.reading})</small>
            )}
          </div>
        </div>
      )}

      {tab === 'wrongbook' && (
        <WrongBook
          wrong={state.wrong}
          onReview={(keys) => startSession({ kind: 'review', keys })}
          onClear={() => clearWrong()}
        />
      )}

      {tab === 'report' && (
        <SkillReport
          attempts={state.attempts}
          onWeak={(n) => startSession({ kind: 'weak', n })}
          onMiniTest={() => startSession({ kind: 'test' })}
        />
      )}
      </div>
    </div>
  )
}
