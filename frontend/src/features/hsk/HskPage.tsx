import { useEffect, useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useTabs } from '@/core/a11y'
import { chineseVoiceStatus, onVoicesChanged, VOICE_HELP_ZH } from '@/core/tts'
import ViContentNote from '../shared/ViContentNote'
import { COUNTS } from '@/data/counts'
import { CAPSULE_PASS, HSK_BANK, HSK_CAPSULES, HSK_LISTENING, HSK_READING, HSK_PASS_SCORE } from '@/data/hskCore'
import { useLearnedWords } from '../english/learned'
import { useHskState } from './state'
import HskCapsuleView from './components/HskCapsuleView'
import HskRunner, { ResultBoard, type RunItem, type RunResult } from './components/HskRunner'

type Tab = 'overview' | 'grammar' | 'practice' | 'test'

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'overview', label: 'Tổng quan', icon: 'map' },
  { id: 'grammar', label: 'Ngữ pháp theo cấp', icon: 'book' },
  { id: 'practice', label: 'Luyện đề', icon: 'target' },
  { id: 'test', label: 'Thi thử', icon: 'trophy' },
]
const TAB_IDS = TABS.map((t) => t.id)

const TEST_SECONDS = 20 * 60

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

function VoiceNotice() {
  const [status, setStatus] = useState(chineseVoiceStatus)
  useEffect(() => onVoicesChanged(() => setStatus(chineseVoiceStatus())), [])
  if (status !== 'none') return null
  return (
    <div className="pron-warn">
      <b><Icon name="volume" size={15} /> Máy chưa có giọng đọc tiếng Trung</b>
      <p>Phần 听力 đọc lời thoại bằng giọng máy nên cần cài giọng Trung. Bạn vẫn bấm "Xem lời thoại" để đọc chữ. Cách cài:</p>
      <ul>
        {VOICE_HELP_ZH.map((h) => <li key={h.os}><b>{h.os}:</b> {h.how}</li>)}
      </ul>
    </div>
  )
}

export default function HskPage() {
  const { recordEvent } = useAppStore()
  const { state, recordCapsule, markWrong, recordAttempt } = useHskState()
  const { learned } = useLearnedWords('zh')

  const [tab, setTab] = useState<Tab>('overview')
  const [capsuleId, setCapsuleId] = useState<string | null>(null)
  const [levelFilter, setLevelFilter] = useState<0 | 1 | 2>(0)
  const [session, setSession] = useState<Session | null>(null)
  const [nonce, setNonce] = useState(0)
  const [result, setResult] = useState<{ res: RunResult; exam: boolean } | null>(null)

  const passed = HSK_CAPSULES.filter((c) => (state.capsules[c.id] ?? 0) >= CAPSULE_PASS).length
  const lastAttempt = state.attempts[state.attempts.length - 1]

  const pickTab = (t: Tab) => { setTab(t); setCapsuleId(null); setResult(null) }
  const tabs = useTabs('hsk', TAB_IDS, tab, pickTab, 'Luyện thi HSK')

  const items: RunItem[] = useMemo(() => {
    if (!session) return []
    void nonce
    if (session.kind === 'reading') {
      return shuffle(HSK_READING).slice(0, session.n).map((item) => ({ kind: 'read' as const, item }))
    }
    if (session.kind === 'listening') {
      return shuffle(HSK_LISTENING).slice(0, session.n).map((item) => ({ kind: 'listen' as const, item }))
    }
    if (session.kind === 'wrong') {
      const ids = new Set(state.wrong)
      return [
        ...HSK_LISTENING.filter((x) => ids.has(x.id)).map((item) => ({ kind: 'listen' as const, item })),
        ...HSK_READING.filter((x) => ids.has(x.id)).map((item) => ({ kind: 'read' as const, item })),
      ]
    }
    return [
      ...shuffle(HSK_LISTENING).slice(0, 8).map((item) => ({ kind: 'listen' as const, item })),
      ...shuffle(HSK_READING).slice(0, 12).map((item) => ({ kind: 'read' as const, item })),
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
        grade: total >= 160 ? 2 : total >= HSK_PASS_SCORE ? 1 : 0,
      })
    }
    recordEvent('lesson', 1)
    setResult({ res, exam: !!exam })
    setSession(null)
  }

  if (session && items.length > 0 && !result) {
    return (
      <div className="english-page">
        <HskRunner
          key={`${session.kind}-${nonce}`}
          items={items}
          exam={session.kind === 'test'}
          seconds={session.kind === 'test' ? TEST_SECONDS : undefined}
          title={
            session.kind === 'test' ? 'Đề thi thử HSK 1–2 (rút gọn)'
            : session.kind === 'wrong' ? 'Ôn lại câu đã sai'
            : session.kind === 'listening' ? 'Luyện 听力 (Nghe)' : 'Luyện 阅读 (Đọc)'
          }
          onFinish={finish}
          onQuit={() => setSession(null)}
        />
      </div>
    )
  }

  const capsule = capsuleId ? HSK_CAPSULES.find((c) => c.id === capsuleId) : null

  return (
    <div className="english-page">
      <div className="lesson-head">
        <h2><Icon name="trophy" /> Luyện thi HSK</h2>
        <div className="meta">
          Ngân hàng {HSK_BANK.capsules} viên ngữ pháp · {HSK_BANK.listening} câu nghe · {HSK_BANK.reading} câu đọc, phủ HSK 1 và HSK 2. Mọi câu đều bật/tắt được pinyin.
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
            <div className="en-hero-badge"><Icon name="trophy" size={14} /> HSK 1–2 · 汉语水平考试</div>
            <h1>Chinh phục HSK từ con số 0</h1>
            <p>
              HSK 1 gồm <b>听力 20 câu</b> và <b>阅读 20 câu</b>; HSK 2 là <b>听力 35 câu</b> và <b>阅读 25 câu</b>.
              Cả hai cấp đều tính <b>thang 200 điểm</b> và <b>120 điểm là đạt</b>. Đề HSK 1–2 luôn in kèm pinyin,
              nên ở đây bạn cũng bật/tắt pinyin được ngay trong lúc làm bài.
            </p>
            <div className="en-hero-stats">
              <div><b>{passed}</b><span>/ {HSK_BANK.capsules} viên ngữ pháp đạt</span></div>
              <div><b>{learned.size}</b><span>từ tiếng Trung đã thuộc</span></div>
              <div><b>{COUNTS.zhWords}</b><span>từ lõi trong kho</span></div>
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
              <h3>听力 <small>· Nghe</small></h3>
              <p>Dạng hay gặp: nghe rồi xét đúng/sai, chọn câu đáp phù hợp, nghe lấy giờ giấc – con số – giá tiền, đoán nơi chốn và tình huống.</p>
            </div>
            <div className="threec tone-c">
              <div className="threec-ic"><Icon name="book" size={22} /></div>
              <h3>阅读 <small>· Đọc</small></h3>
              <p>Dạng hay gặp: điền từ vào chỗ trống, nối câu hỏi với câu đáp, đọc đoạn ngắn lấy chi tiết, xét đúng/sai, sắp xếp câu.</p>
            </div>
            <div className="threec tone-e">
              <div className="threec-ic"><Icon name="note" size={22} /></div>
              <h3>书写 <small>· Viết (từ HSK 3)</small></h3>
              <p>HSK 1–2 chưa thi viết. Muốn chuẩn bị sớm thì luyện nhớ mặt chữ ở tab "Học từ vựng" của khoá Tiếng Trung 3 tháng.</p>
            </div>
          </div>

          {!!state.attempts.length && (
            <>
              <div className="section-title"><span className="pin" /> Lịch sử thi thử</div>
              <div className="topik-history">
                {state.attempts.slice().reverse().slice(0, 6).map((a, k) => (
                  <div key={k} className="topik-hist">
                    <b>{a.total}</b>
                    <span>听力 {a.listening} · 阅读 {a.reading}</span>
                    <small>{a.at} · {a.grade ? `đạt mốc ${a.grade === 2 ? 'HSK 2' : 'HSK 1'}` : 'chưa đạt 120'}</small>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="en-principle">
            <Icon name="bulb" size={20} />
            <div>
              <b>Ba lỗi khiến người Việt mất điểm oan ở HSK 1–2.</b> Một là quên <b>lượng từ</b> (一书 thay vì 一本书).
              Hai là dùng <b>是 trước tính từ</b> (我是好) vì dịch thẳng từ tiếng Việt. Ba là phủ định sai:
              有 phải là 没有, tính từ phải là 不. Bộ ngữ pháp ở tab bên cạnh xếp đúng theo ba nhóm lỗi này.
            </div>
          </div>
        </div>
      )}

      {!result && tab === 'grammar' && (
        capsule ? (
          <HskCapsuleView
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
                <b>Ngữ pháp ra thi — {passed}/{HSK_CAPSULES.length} viên đạt.</b>
                <p>Mỗi viên gồm 3 điểm mấu chốt, 2 câu ví dụ nghe được và 4 câu luyện. Đạt {CAPSULE_PASS}% là hoàn thành.</p>
              </div>
            </div>
            <div className="lib-filter-row">
              <span className="lib-filter-lbl">Theo cấp</span>
              {([0, 1, 2] as const).map((lv) => (
                <button key={lv} className={'sp-filter' + (levelFilter === lv ? ' on' : '')} onClick={() => setLevelFilter(lv)}>
                  {lv === 0 ? 'Tất cả' : `HSK ${lv}`}
                </button>
              ))}
            </div>
            <div className="capsule-grid">
              {HSK_CAPSULES.filter((c) => !levelFilter || c.level === levelFilter).map((c, i) => {
                const best = state.capsules[c.id]
                const ok = (best ?? 0) >= CAPSULE_PASS
                return (
                  <button key={c.id} className={'capsule-card' + (ok ? ' done' : '')} onClick={() => setCapsuleId(c.id)}>
                    <div className="cap-head">
                      <span className="cap-num">{i + 1}</span>
                      <span className="cap-tag">HSK {c.level} · {c.tag}</span>
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
          <VoiceNotice />
          <div className="capsule-grid">
            <button className="capsule-card" onClick={() => { setNonce((n) => n + 1); setSession({ kind: 'listening', n: 8 }) }}>
              <div className="cap-head"><span className="cap-num">听力</span><span className="cap-tag">Nghe</span></div>
              <b>Luyện nghe 8 câu</b>
              <small>Nghe lại bao nhiêu lần cũng được, có lời thoại kèm pinyin</small>
            </button>
            <button className="capsule-card" onClick={() => { setNonce((n) => n + 1); setSession({ kind: 'reading', n: 12 }) }}>
              <div className="cap-head"><span className="cap-num">阅读</span><span className="cap-tag">Đọc</span></div>
              <b>Luyện đọc 12 câu</b>
              <small>Đủ 6 dạng: điền từ · nối câu · ý chính · chi tiết · đúng sai · sắp xếp</small>
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
              <b>Đề thi thử rút gọn — 20 câu / 20 phút</b>
              <p>
                8 câu 听力 + 12 câu 阅读 theo đúng tỉ lệ đề thật. Trong lúc thi <b>không hiện đáp án</b>;
                nộp bài xong mới ra điểm quy đổi thang 200 và mốc ước lượng ({HSK_PASS_SCORE} điểm là đạt).
              </p>
            </div>
          </div>
          <VoiceNotice />
          <button className="btn-primary lg" onClick={() => { setNonce((n) => n + 1); setSession({ kind: 'test' }) }}>
            <Icon name="play" size={16} /> Bắt đầu thi thử
          </button>
          <p className="topik-note">
            Điểm quy đổi chỉ để ước lượng và theo dõi tiến bộ — đề thật dài gấp 2–3 lần và có phần nhìn tranh chọn đáp án.
          </p>
        </div>
      )}
      </div>
    </div>
  )
}
