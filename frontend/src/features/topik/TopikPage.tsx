import { useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useTabs } from '@/core/a11y'
import ViContentNote from '../shared/ViContentNote'
import { COUNTS } from '@/data/counts'
import {
  CAPSULE_PASS, TOPIK_BANK, TOPIK_CAPSULES, TOPIK_LISTENING, TOPIK_READING,
} from '@/data/topikCore'
import { useLearnedWords } from '../english/learned'
import { useTopikState } from './state'
import CapsuleView from './components/CapsuleView'
import TopikRunner, { ResultBoard, type RunItem, type RunResult } from './components/TopikRunner'
import WritingLab from './components/WritingLab'

type Tab = 'overview' | 'grammar' | 'practice' | 'test' | 'writing'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Tổng quan', icon: 'map' },
  { id: 'grammar', label: 'Ngữ pháp theo cấp', icon: 'book' },
  { id: 'practice', label: 'Luyện đề', icon: 'target' },
  { id: 'test', label: 'Thi thử', icon: 'trophy' },
  { id: 'writing', label: 'Viết & chấm AI', icon: 'note' },
]
const TAB_IDS = TABS.map((t) => t.id)

const TEST_SECONDS = 25 * 60

function shuffle<T>(a: T[]): T[] {
  const x = [...a]
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j], x[i]]
  }
  return x
}

type Session =
  | { kind: 'reading'; n: number }
  | { kind: 'listening'; n: number }
  | { kind: 'wrong' }
  | { kind: 'test' }

export default function TopikPage() {
  const { recordEvent } = useAppStore()
  const { state, recordCapsule, markWrong, recordAttempt } = useTopikState()
  const { learned } = useLearnedWords('ko')

  const [tab, setTab] = useState<Tab>('overview')
  const [capsuleId, setCapsuleId] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useState<0 | 1 | 2>(0)
  const [session, setSession] = useState<Session | null>(null)
  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState<{ res: RunResult; exam: boolean } | null>(null)

  const passed = TOPIK_CAPSULES.filter((c) => (state.capsules[c.id] ?? 0) >= CAPSULE_PASS).length
  const lastAttempt = state.attempts[state.attempts.length - 1]

  const pickTab = (t: Tab) => { setTab(t); setCapsuleId(null); setResult(null) }
  const tabs = useTabs('topik', TAB_IDS, tab, pickTab, 'Luyện thi TOPIK')

  const items: RunItem[] = useMemo(() => {
    if (!session) return []
    void nonce
    if (session.kind === 'reading') {
      return shuffle(TOPIK_READING).slice(0, session.n).map((item) => ({ kind: 'read' as const, item }))
    }
    if (session.kind === 'listening') {
      return shuffle(TOPIK_LISTENING).slice(0, session.n).map((item) => ({ kind: 'listen' as const, item }))
    }
    if (session.kind === 'wrong') {
      const ids = new Set(state.wrong)
      return [
        ...TOPIK_LISTENING.filter((x) => ids.has(x.id)).map((item) => ({ kind: 'listen' as const, item })),
        ...TOPIK_READING.filter((x) => ids.has(x.id)).map((item) => ({ kind: 'read' as const, item })),
      ]
    }
    return [
      ...shuffle(TOPIK_LISTENING).slice(0, 10).map((item) => ({ kind: 'listen' as const, item })),
      ...shuffle(TOPIK_READING).slice(0, 15).map((item) => ({ kind: 'read' as const, item })),
    ]
  }, [session, nonce, state.wrong])

  const finish = (res: RunResult) => {
    const exam = session?.kind === 'test'
    res.wrongIds.forEach((id) => markWrong(id, true))
    items.forEach((it) => { if (!res.wrongIds.includes(it.item.id)) markWrong(it.item.id, false) })
    if (exam) {
      const listening = Math.round((res.listenTotal ? res.listenCorrect / res.listenTotal : 0) * 100)
      const reading = Math.round((res.readTotal ? res.readCorrect / res.readTotal : 0) * 100)
      const total = listening + reading
      recordAttempt({
        at: new Date().toISOString().slice(0, 10),
        listening, reading, total,
        grade: total >= 140 ? 2 : total >= 80 ? 1 : 0,
      })
    }
    recordEvent('lesson', 1)
    setResult({ res, exam: !!exam })
    setSession(null)
  }

  if (session && items.length > 0 && !result) {
    return (
      <div className="english-page">
        <TopikRunner
          key={`${session.kind}-${nonce}`}
          items={items}
          exam={session.kind === 'test'}
          seconds={session.kind === 'test' ? TEST_SECONDS : undefined}
          title={
            session.kind === 'test' ? 'Đề thi thử TOPIK I (rút gọn)'
            : session.kind === 'wrong' ? 'Ôn lại câu đã sai'
            : session.kind === 'listening' ? 'Luyện 듣기 (Nghe)' : 'Luyện 읽기 (Đọc)'
          }
          onFinish={finish}
          onQuit={() => setSession(null)}
        />
      </div>
    )
  }

  const capsule = capsuleId ? TOPIK_CAPSULES.find((c) => c.id === capsuleId) : null

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="trophy" /> Luyện thi TOPIK</h2>
        <div className="meta">
          Ngân hàng {TOPIK_BANK.capsules} viên ngữ pháp · {TOPIK_BANK.listening} câu nghe · {TOPIK_BANK.reading} câu đọc · {TOPIK_BANK.writing} đề viết chấm bằng AI.
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
      {result && (
        <ResultBoard
          res={result.res}
          exam={result.exam}
          onClose={() => setResult(null)}
          onRetry={() => { const s = result.exam ? { kind: 'test' as const } : { kind: 'reading' as const, n: 10 }; setResult(null); setNonce((n) => n + 1); setSession(s) }}
        />
      )}

      {!result && tab === 'overview' && (
        <div className="en-overview">
          <div className="en-hero">
            <div className="en-hero-badge"><Icon name="trophy" size={14} /> TOPIK I · cấp 1–2</div>
            <h1>Chinh phục TOPIK từ nền tảng</h1>
            <p>
              TOPIK I gồm <b>듣기 30 câu / 40 phút</b> và <b>읽기 40 câu / 60 phút</b>, tổng 200 điểm —
              đạt <b>80 điểm</b> là cấp 1, <b>140 điểm</b> là cấp 2. Ở đây bạn học đúng bộ ngữ pháp ra thi,
              luyện từng dạng câu thật rồi thi thử để biết mình đang ở đâu.
            </p>
            <div className="en-hero-stats">
              <div><b>{passed}</b><span>/ {TOPIK_BANK.capsules} viên ngữ pháp đạt</span></div>
              <div><b>{learned.size}</b><span>từ tiếng Hàn đã thuộc</span></div>
              <div><b>{COUNTS.koWords}</b><span>từ lõi trong kho</span></div>
              {lastAttempt && <div><b>{lastAttempt.total}</b><span>điểm thi thử gần nhất /200</span></div>}
            </div>
            <button className="btn-primary lg" onClick={() => setTab('grammar')}>
              <Icon name="play" size={16} /> Bắt đầu với ngữ pháp
            </button>
          </div>

          <div className="section-title"><span className="pin" /> Cấu trúc bài thi</div>
          <div className="threec-grid">
            <div className="threec tone-a">
              <div className="threec-ic"><Icon name="headphones" size={22} /></div>
              <h3>듣기 <small>· Nghe</small></h3>
              <p>TOPIK I: 30 câu / 40 phút. Dạng hay gặp: trả lời câu hỏi ngắn, đoán nơi chốn, nắm chủ đề, nghe lấy chi tiết (giờ, giá, kế hoạch).</p>
            </div>
            <div className="threec tone-c">
              <div className="threec-ic"><Icon name="book" size={22} /></div>
              <h3>읽기 <small>· Đọc</small></h3>
              <p>TOPIK I: 40 câu / 60 phút. Dạng hay gặp: đoán chủ đề, điền trợ từ/từ vựng, đọc hiểu đoạn ngắn, sắp xếp câu, tìm mục đích văn bản.</p>
            </div>
            <div className="threec tone-e">
              <div className="threec-ic"><Icon name="note" size={22} /></div>
              <h3>쓰기 <small>· Viết (TOPIK II)</small></h3>
              <p>Từ TOPIK II mới có phần viết: câu 51–52 điền câu, 53 viết đoạn 200–300 chữ, 54 luận 600–700 chữ. Ở tab "Viết &amp; chấm AI" bạn tập trước.</p>
            </div>
          </div>

          {!!state.attempts.length && (
            <>
              <div className="section-title"><span className="pin" /> Lịch sử thi thử</div>
              <div className="topik-history">
                {state.attempts.slice().reverse().slice(0, 6).map((a, k) => (
                  <div key={k} className="topik-hist">
                    <b>{a.total}</b>
                    <span>듣기 {a.listening} · 읽기 {a.reading}</span>
                    <small>{a.at} · {a.grade ? `${a.grade}급` : 'chưa đạt cấp'}</small>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="en-principle">
            <Icon name="bulb" size={20} />
            <div>
              <b>Điểm khác giữa TOPIK và cách học thông thường.</b> Đề TOPIK không hỏi "từ này nghĩa gì" mà hỏi
              bạn có <b>dùng đúng trợ từ và đuôi câu</b> trong ngữ cảnh hay không. Vì vậy hãy học ngữ pháp theo viên,
              rồi luyện ngay dạng câu tương ứng — đó là thứ tự các tab ở trên.
            </div>
          </div>
        </div>
      )}

      {!result && tab === 'grammar' && (
        capsule ? (
          <CapsuleView
            capsule={capsule}
            best={state.capsules[capsule.id]}
            onDone={(pct) => { if (recordCapsule(capsule.id, pct)) recordEvent('lesson', 1) }}
            onBack={() => setCapsuleId(null)}
          />
        ) : (
          <div>
            <div className="grammar-intro">
              <Icon name="book" size={20} />
              <div>
                <b>Ngữ pháp ra thi — {passed}/{TOPIK_CAPSULES.length} viên đạt.</b>
                <p>Mỗi viên gồm 3 điểm mấu chốt, ví dụ nghe được và bài luyện ngắn. Đạt {CAPSULE_PASS}% là hoàn thành.</p>
              </div>
            </div>
            <div className="lib-filter-row">
              <span className="lib-filter-lbl">Theo cấp</span>
              {([0, 1, 2] as const).map((lv) => (
                <button key={lv} className={'sp-filter' + (levelFilter === lv ? ' on' : '')} onClick={() => setLevelFilter(lv)}>
                  {lv === 0 ? 'Tất cả' : `Cấp ${lv}`}
                </button>
              ))}
            </div>
            <div className="capsule-grid">
              {TOPIK_CAPSULES.filter((c) => !levelFilter || c.level === levelFilter).map((c, i) => {
                const best = state.capsules[c.id]
                const ok = (best ?? 0) >= CAPSULE_PASS
                return (
                  <button key={c.id} className={'capsule-card' + (ok ? ' done' : '')} onClick={() => setCapsuleId(c.id)}>
                    <div className="cap-head">
                      <span className="cap-num">{i + 1}</span>
                      <span className="cap-tag">Cấp {c.level} · {c.tag}</span>
                      {ok && <Icon name="check-circle" size={15} />}
                    </div>
                    <b>{c.title}</b>
                    <small>{best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'}</small>
                  </button>
                )
              })}
            </div>
          </div>
        )
      )}

      {!result && tab === 'practice' && (
        <div className="topik-practice">
          <div className="grammar-intro">
            <Icon name="target" size={20} />
            <div>
              <b>Luyện từng dạng câu thật</b>
              <p>Làm xong mỗi câu là thấy ngay đáp án và lời giải. Câu nào sai sẽ tự vào kho "ôn lại câu sai".</p>
            </div>
          </div>
          <div className="capsule-grid">
            <button className="capsule-card" onClick={() => { setNonce((n) => n + 1); setSession({ kind: 'listening', n: 8 }) }}>
              <div className="cap-head"><span className="cap-num">듣기</span><span className="cap-tag">Nghe</span></div>
              <b>Luyện nghe 8 câu</b>
              <small>Lời thoại thu sẵn giọng người Hàn, nghe lại bao nhiêu lần cũng được, có transcript</small>
            </button>
            <button className="capsule-card" onClick={() => { setNonce((n) => n + 1); setSession({ kind: 'reading', n: 12 }) }}>
              <div className="cap-head"><span className="cap-num">읽기</span><span className="cap-tag">Đọc</span></div>
              <b>Luyện đọc 12 câu</b>
              <small>Đủ 5 dạng: chủ đề · điền từ · đọc hiểu · sắp xếp · mục đích</small>
            </button>
            <button className="capsule-card" disabled={!state.wrong.length} onClick={() => { setNonce((n) => n + 1); setSession({ kind: 'wrong' }) }}>
              <div className="cap-head"><span className="cap-num">📓</span><span className="cap-tag">Sổ tay</span></div>
              <b>Ôn lại câu đã sai ({state.wrong.length})</b>
              <small>{state.wrong.length ? 'Làm đúng thì câu sẽ được gạch khỏi sổ' : 'Chưa có câu sai nào'}</small>
            </button>
          </div>
        </div>
      )}

      {!result && tab === 'test' && (
        <div className="topik-test-intro">
          <div className="grammar-intro">
            <Icon name="trophy" size={20} />
            <div>
              <b>Đề thi thử rút gọn — 25 câu / 25 phút</b>
              <p>
                10 câu 듣기 + 15 câu 읽기 theo đúng tỉ lệ đề thật. Trong lúc thi <b>không hiện đáp án</b>;
                nộp bài xong mới ra điểm quy đổi thang 200 và cấp ước lượng.
              </p>
            </div>
          </div>
          <button className="btn-primary lg" onClick={() => { setNonce((n) => n + 1); setSession({ kind: 'test' }) }}>
            <Icon name="play" size={16} /> Bắt đầu thi thử
          </button>
          <p className="topik-note">
            Điểm quy đổi chỉ để ước lượng và theo dõi tiến bộ — đề thật dài gấp 4 lần và có nhiều dạng hơn.
          </p>
        </div>
      )}

      {!result && tab === 'writing' && <WritingLab />}
      </div>
    </div>
  )
}
