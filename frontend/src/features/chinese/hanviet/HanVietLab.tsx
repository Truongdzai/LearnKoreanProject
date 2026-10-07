import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon, { type IconName } from '@/core/components/Icon'
import { chineseVoiceStatus, onVoicesChanged, speakZH } from '@/core/tts'
import { useUrlParam } from '@/core/hooks/useTabParam'
import { useAppStore } from '@/store/app.store'
import HvQuiz from './HvQuiz'
import {
  BY_CHAR, CHARS, DRILL_CHARS, TRANSPARENT, WORDS, WORD_POOL_SIZE, buildRound, canon, hanOf, readWord, ruleStats, searchHv, wordsWith,
  type HvEntry, type ModeId, type ZItem,
} from './hanviet'
import { MASTERY, useHanVietProgress } from './progress'
import './styles.css'

type Pane = 'look' | 'rule' | 'drill'

const PANES: { id: Pane; label: string; icon: IconName }[] = [
  { id: 'look', label: 'Tra chữ', icon: 'search' },
  { id: 'rule', label: 'Quy luật âm', icon: 'chart' },
  { id: 'drill', label: 'Luyện tập', icon: 'target' },
]
const PANE_IDS = PANES.map((p) => p.id) as string[]

const MODES: { id: ModeId; label: string; icon: IconName; desc: string }[] = [
  { id: 'hv', label: 'Chữ → âm', icon: 'letters', desc: 'Nhìn chữ Hán, chọn âm Hán–Việt: 学 → học.' },
  { id: 'char', label: 'Âm → chữ', icon: 'search', desc: 'Cho âm Hán–Việt, tìm đúng chữ trong 4 chữ: quốc → 国.' },
  { id: 'word', label: 'Đọc cả từ', icon: 'book', desc: 'Đọc từ ghép theo Hán–Việt rồi xem nghĩa: 银行 → ngân hàng.' },
]

export default function HanVietLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useHanVietProgress()
  const [paneRaw, setPane] = useUrlParam('pane', null, (v) => PANE_IDS.includes(v))
  const pane = (paneRaw ?? 'look') as Pane
  const [canHear, setCanHear] = useState(() => chineseVoiceStatus() === 'ready')
  const [quiz, setQuiz] = useState<{ mode: ModeId; items: ZItem[] } | null>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(chineseVoiceStatus() === 'ready')), [])

  const onFinish = useCallback((pct: number) => {
    if (!quiz) return
    recordEvent('review', 1, 0, 0, 'zh')
    finishRound(quiz.mode, pct)
  }, [quiz, finishRound, recordEvent])

  return (
    <div className="hg-lab zv-lab">
      <div className="grammar-intro">
        <Icon name="globe" size={20} />
        <div>
          <b>Cầu Hán–Việt — dùng vốn từ sẵn có để nhớ chữ Hán</b>
          <p>
            Rất nhiều từ tiếng Việt là từ Hán–Việt: học sinh, ngân hàng, điện ảnh… Mỗi chữ Hán có âm Hán–Việt cố định,
            nên biết <span lang="zh">学</span> đọc là "học" thì gặp <span lang="zh">学生</span>, <span lang="zh">大学</span>,{' '}
            <span lang="zh">学习</span> là đoán ngay ra nghĩa. Âm Hán–Việt và pinyin còn tương ứng theo quy luật, giúp đoán cả
            cách đọc.
          </p>
          <div className="hg-stats">
            <span><b>{CHARS.length}</b> chữ trong lộ trình có âm Hán–Việt</span>
            <span><b>{TRANSPARENT.length}</b> từ đọc lên là hiểu</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
          </div>
        </div>
      </div>

      <div className="vl-modes hg-panes" role="tablist" aria-label="Cầu Hán–Việt">
        {PANES.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={pane === p.id}
            className={'vl-mode' + (pane === p.id ? ' on' : '')}
            onClick={() => { setQuiz(null); setPane(p.id === 'look' ? null : p.id) }}
          >
            <Icon name={p.icon} size={14} /> {p.label}
          </button>
        ))}
      </div>

      {pane === 'look' && <Lookup canHear={canHear} />}
      {pane === 'rule' && <Rules canHear={canHear} />}
      {pane === 'drill' && (quiz ? (
        <HvQuiz
          key={quiz.items[0].id}
          items={quiz.items}
          title={MODES.find((m) => m.id === quiz.mode)!.label}
          canHear={canHear}
          onFinish={onFinish}
          onAgain={() => setQuiz({ ...quiz, items: buildRound(quiz.mode) })}
          onBack={() => setQuiz(null)}
        />
      ) : (
        <div className="hg-practice-pick zv-modes">
          {MODES.map((m) => {
            const best = state.best[m.id]
            return (
              <button
                key={m.id}
                className={'hg-pool zv-mode' + ((best ?? 0) >= MASTERY ? ' done' : '')}
                onClick={() => setQuiz({ mode: m.id, items: buildRound(m.id) })}
              >
                <Icon name={m.icon} size={18} />
                <b>{m.label}</b>
                <span><ZhInline text={m.desc} /></span>
                <small className="zv-mode-best">
                  {best != null ? `Tốt nhất: ${best}%` : 'Chưa luyện'} · 10 câu · kho {m.id === 'word' ? `${WORD_POOL_SIZE} từ` : `${DRILL_CHARS.length} chữ`}
                </small>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ZhInline({ text }: { text: string }) {
  const parts = text.split(/(\p{Script=Han}+)/u)
  return <>{parts.map((p, i) => (i % 2 ? <span key={i} lang="zh">{p}</span> : p))}</>
}

// ── Tra chữ ──

const SORTED = [...CHARS].sort((a, b) => canon(a.hv[0]).localeCompare(canon(b.hv[0]), 'vi'))

function Lookup({ canHear }: { canHear: boolean }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState<string | null>(null)
  const query = q.trim()
  const han = hanOf(query)

  const results = useMemo<HvEntry[]>(() => {
    if (!query) return []
    if (han.length) return han.flatMap((c) => (BY_CHAR.has(c) ? [BY_CHAR.get(c)!] : []))
    return searchHv(query)
  }, [query, han.join('')])

  const shown = sel ? BY_CHAR.get(sel) : undefined
  const meaning = han.length > 1 ? WORDS.find((w) => w.zh === han.join(''))?.vi : undefined

  return (
    <div className="zv-look">
      <div className="zv-search">
        <Icon name="search" size={16} />
        <input
          className="zv-input"
          value={q}
          onChange={(e) => { setQ(e.target.value); setSel(null) }}
          placeholder="Gõ âm Hán–Việt (học, quốc, hoc) hoặc dán chữ Hán (学生)"
          aria-label="Tra âm Hán–Việt hoặc chữ Hán"
        />
      </div>

      {query && (
        results.length ? (
          <div className="zv-results">
            {results.map((e) => <CharCard key={e.c} e={e} canHear={canHear} />)}
            {han.length > 1 && results.length === han.length && (
              <p className="zv-reading">
                Đọc Hán–Việt: <b>{readWord(han.join(''))}</b>
                {meaning && <> — {meaning}</>}
              </p>
            )}
          </div>
        ) : (
          <p className="hg-note">
            {han.length ? 'Chữ này chưa có trong lộ trình 3 tháng.' : `Chưa có chữ nào đọc "${query}" trong ${CHARS.length} chữ của lộ trình.`}
          </p>
        )
      )}

      {!query && (
        <>
          <section className="zv-section" aria-labelledby="zv-trans-h">
            <div className="section-title" id="zv-trans-h"><span className="pin" /> {TRANSPARENT.length} từ đọc lên là hiểu</div>
            <div className="zv-trans">
              {TRANSPARENT.map(({ w, hv }) => (
                <button
                  key={w.zh}
                  type="button"
                  className={'zv-trans-item' + (canHear ? ' on' : '')}
                  onClick={canHear ? () => speakZH(w.zh, 0.8) : undefined}
                  tabIndex={canHear ? 0 : -1}
                >
                  <span lang="zh" className="zv-trans-zh">{w.zh}</span>
                  <span className="zv-trans-py">{w.pinyin}</span>
                  <b>{hv}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="zv-section" aria-labelledby="zv-all-h">
            <div className="section-title" id="zv-all-h"><span className="pin" /> Cả {CHARS.length} chữ, xếp theo âm Hán–Việt</div>
            <p className="hg-note">Bấm một chữ để xem pinyin, các từ có chữ đó và nghe đọc.</p>
            {shown && <CharCard e={shown} canHear={canHear} onClose={() => setSel(null)} />}
            <div className="zv-grid">
              {SORTED.map((e) => (
                <button
                  key={e.c}
                  type="button"
                  className={'zv-cell' + (sel === e.c ? ' on' : '')}
                  aria-pressed={sel === e.c}
                  onClick={() => setSel(sel === e.c ? null : e.c)}
                >
                  <span lang="zh">{e.c}</span>
                  <small>{e.hv[0]}</small>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function CharCard({ e, canHear, onClose }: { e: HvEntry; canHear: boolean; onClose?: () => void }) {
  const words = wordsWith(e.c, 5)
  return (
    <article className="zv-card">
      <div className="zv-card-top">
        <button
          type="button"
          className={'zv-big' + (canHear ? ' on' : '')}
          lang="zh"
          onClick={canHear ? () => speakZH(e.c, 0.8) : undefined}
          aria-label={canHear ? `Nghe ${e.c}` : undefined}
          tabIndex={canHear ? 0 : -1}
        >
          {e.c}
        </button>
        <div className="zv-card-info">
          <b className="zv-hv">{e.hv.join(' · ')}</b>
          <span className="zv-py">{e.py}</span>
          {e.note && <p><ZhInline text={e.note} /></p>}
        </div>
        {onClose && (
          <button type="button" className="zv-icon-btn zv-close" onClick={onClose} aria-label="Đóng">
            <Icon name="x" size={14} />
          </button>
        )}
      </div>
      {words.length > 0 && (
        <ul className="zv-words">
          {words.map((w) => (
            <li key={w.zh}>
              <button
                type="button"
                className={'zv-word' + (canHear ? ' on' : '')}
                onClick={canHear ? () => speakZH(w.zh, 0.8) : undefined}
                tabIndex={canHear ? 0 : -1}
              >
                <span lang="zh">{w.zh}</span>
                <span className="zv-word-py">{w.pinyin}</span>
                <span className="zv-word-hv">{readWord(w.zh) ?? hanOf(w.zh).map((c) => BY_CHAR.get(c)?.hv[0] ?? '?').join(' ')}</span>
                <span className="zv-word-vi">{w.vi}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

// ── Quy luật âm ──

function Rules({ canHear }: { canHear: boolean }) {
  const stats = useMemo(() => ruleStats(), [])
  return (
    <div className="zv-rules">
      <p className="hg-note">
        Âm Hán–Việt và pinyin cùng đi ra từ tiếng Hán đời Đường nên tương ứng theo quy luật. Tỉ lệ dưới mỗi thẻ được tính
        thật trên {CHARS.length} chữ của lộ trình — biết quy luật là đoán được pinyin của chữ đã biết âm Hán–Việt, và ngược lại.
      </p>
      <div className="zv-rule-grid">
        {stats.map(({ rule, hits, misses }) => {
          const total = hits.length + misses.length
          if (!total) return null
          return (
            <article key={rule.id} className="zv-rule">
              <div className="zv-rule-head">
                <h3>{rule.title}</h3>
                <span className="zv-rate">{hits.length}/{total} chữ</span>
              </div>
              <p><ZhInline text={rule.desc} /></p>
              <div className="zv-chips">
                {hits.slice(0, 8).map((e) => (
                  <button
                    key={e.c}
                    type="button"
                    className={'zv-chip' + (canHear ? ' on' : '')}
                    onClick={canHear ? () => speakZH(e.c, 0.8) : undefined}
                    tabIndex={canHear ? 0 : -1}
                  >
                    <span lang="zh">{e.c}</span>
                    <small>{e.py} · {e.hv[0]}</small>
                  </button>
                ))}
              </div>
              {misses.length > 0 && (
                <p className="zv-miss">
                  Ngoại lệ: {misses.slice(0, 4).map((e) => (
                    <span key={e.c}><span lang="zh">{e.c}</span> {e.py} = {e.hv[0]}</span>
                  ))}
                </p>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
