import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { koreanVoiceStatus, onVoicesChanged, speakKO } from '@/core/tts'
import { romanizeLine } from '@/core/utils/romanize'
import { useAppStore } from '@/store/app.store'
import KoText from '../numbers/KoText'
import ConjQuiz, { type AnswerMode } from './ConjQuiz'
import { CLASSES, CLASS_RULE, DEFAULT_ENDINGS, POOL, ROUND, buildRound, classExamples, countPairs, findLex, type Item } from './drill'
import { CLASS_LABEL, ENDINGS, ENDING_BY_ID, conjugate, drillable, grammatical, type ConjClass, type EndingId } from './engine'
import { MASTERY, MIN_TRIES, accuracy, useConjProgress } from './progress'
import './styles.css'

type Cls = Exclude<ConjClass, 'copula'>
type Filter = Cls | 'all'

const PREFS = 'vyling.ko.conj.prefs'
const MIN_ROUND = 4

interface Prefs {
  endings: EndingId[]
  mode: AnswerMode
  rom: boolean
}

function readPrefs(): Prefs {
  const base: Prefs = { endings: DEFAULT_ENDINGS, mode: 'choice', rom: false }
  try {
    const r = JSON.parse(localStorage.getItem(PREFS) || '{}') as Partial<Prefs>
    const endings = Array.isArray(r.endings) ? r.endings.filter((e) => e in ENDING_BY_ID) : []
    return {
      endings: endings.length ? endings : base.endings,
      mode: r.mode === 'type' ? 'type' : 'choice',
      rom: r.rom === true,
    }
  } catch {
    return base
  }
}

const POS_LABEL = { verb: 'động từ', adj: 'tính từ', noun: 'danh từ' } as const

export default function ConjugationLab() {
  const { recordEvent } = useAppStore()
  const { state, finishRound } = useConjProgress()
  const [canHear, setCanHear] = useState(() => koreanVoiceStatus() === 'ready')
  const [prefs, setPrefs] = useState<Prefs>(readPrefs)
  const [cls, setCls] = useState<Filter>('all')
  const [quiz, setQuiz] = useState<{ items: Item[]; only: boolean; title: string } | null>(null)
  const practiceRef = useRef<HTMLElement>(null)

  useEffect(() => onVoicesChanged(() => setCanHear(koreanVoiceStatus() === 'ready')), [])

  const savePrefs = (p: Partial<Prefs>) => {
    setPrefs((cur) => {
      const next = { ...cur, ...p }
      try { localStorage.setItem(PREFS, JSON.stringify(next)) } catch {  }
      return next
    })
  }

  const toggleEnding = (id: EndingId) => {
    const has = prefs.endings.includes(id)
    if (has && prefs.endings.length === 1) return
    savePrefs({ endings: has ? prefs.endings.filter((e) => e !== id) : ENDINGS.map((e) => e.id).filter((e) => e === id || prefs.endings.includes(e)) })
  }

  const available = countPairs({ endings: prefs.endings, cls, weak: state.weak })
  const weakAvail = countPairs({ endings: prefs.endings, cls: 'all', weak: state.weak, only: true })

  const start = (opts: { cls?: Filter; only?: boolean } = {}) => {
    const c = opts.cls ?? cls
    const only = !!opts.only
    const items = buildRound({ endings: prefs.endings, cls: c, weak: state.weak, only })
    if (items.length < MIN_ROUND) return
    if (opts.cls) setCls(opts.cls)
    const title = only ? 'Ôn từ hay sai' : c === 'all' ? 'Chia đuôi' : CLASS_LABEL[c]
    setQuiz({ items, only, title })
  }

  const back = () => {
    setQuiz(null)
    window.setTimeout(() => practiceRef.current?.scrollIntoView({ block: 'start' }), 0)
  }

  const onFinish = useCallback((answers: Parameters<typeof finishRound>[0]) => {
    recordEvent('review', 1, 0, 0, 'ko')
    const fresh = finishRound(answers)
    if (fresh > 0) recordEvent('grammar', fresh, 0, 0, 'ko')
  }, [finishRound, recordEvent])

  const romToggle = (
    <label className="hg-toggle kc-rom-toggle">
      <input type="checkbox" checked={prefs.rom} onChange={(e) => savePrefs({ rom: e.target.checked })} />
      Hiện phiên âm Latin
    </label>
  )

  if (quiz) {
    return (
      <div className="kc-lab">
        {romToggle}
        <ConjQuiz
          key={quiz.items[0].id}
          items={quiz.items}
          title={quiz.title}
          mode={prefs.mode}
          canHear={canHear}
          showRom={prefs.rom}
          onFinish={onFinish}
          onAgain={() => {
            const items = buildRound({ endings: prefs.endings, cls, weak: state.weak, only: quiz.only })
            if (items.length >= MIN_ROUND) setQuiz({ ...quiz, items })
            else back()
          }}
          onBack={back}
        />
      </div>
    )
  }

  const mastered = state.mastered.length

  return (
    <div className="kc-lab">
      <div className="grammar-intro">
        <Icon name="tool" size={20} />
        <div>
          <b>Chia đuôi động từ & tính từ</b>
          <p>
            <KoText text="Từ điển chỉ cho dạng gốc (먹다, 덥다) nhưng câu nói thật luôn dùng dạng đã chia (먹어요, 더워요). Chỗ người Việt hay vấp là các nhóm bất quy tắc: 덥다 thành 더워요 mà 입다 vẫn là 입어요. Mỗi câu sai đều có lời giải thích vì sao sai." />
          </p>
          <div className="hg-stats">
            <span><b>{mastered}</b>/{ENDINGS.length} đuôi đã vững</span>
            <span><b>{state.rounds}</b> lượt đã luyện</span>
            <span><b>{POOL.length}</b> động từ, tính từ trong kho</span>
            {state.weak.length > 0 && <span><b>{state.weak.length}</b> từ cần ôn lại</span>}
          </div>
          <div className="hg-actions">
            <button className="btn-ghost sm" onClick={() => practiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Icon name="target" size={14} /> Vào luyện ngay
            </button>
          </div>
        </div>
      </div>

      <Lookup canHear={canHear} showRom={prefs.rom} />

      <details className="kc-details">
        <summary><Icon name="book" size={15} /> {ENDINGS.length} đuôi và cách ghép</summary>
        <div className="kc-endings">
          {ENDINGS.map((e) => (
            <div key={e.id} className="kc-ending">
              <b>{e.label}</b>
              <span className="kc-short" lang="ko">{e.short}</span>
              <p><KoText text={e.desc} /></p>
            </div>
          ))}
        </div>
      </details>

      <section className="kc-classes" aria-labelledby="kc-classes-h">
        <div className="section-title" id="kc-classes-h"><span className="pin" /> Các nhóm chia</div>
        <div className="kc-class-grid">
          {CLASSES.filter((c): c is Cls => c !== 'copula').map((c) => (
            <ClassCard key={c} cls={c} canHear={canHear} onDrill={() => start({ cls: c })} />
          ))}
        </div>
      </section>

      <section className="kc-practice" ref={practiceRef} aria-labelledby="kc-practice-h">
        <div className="kc-practice-head">
          <div className="section-title" id="kc-practice-h"><span className="pin" /> Luyện tập</div>
          {romToggle}
        </div>

        <div className="kc-setup">
          <div className="kc-field">
            <span className="hg-group-title">Đuôi cần chia</span>
            <div className="kc-chips">
              {ENDINGS.map((e) => {
                const acc = accuracy(state.stats[e.id])
                const on = prefs.endings.includes(e.id)
                return (
                  <button
                    key={e.id}
                    type="button"
                    className={'chip kc-chip' + (on ? ' on' : '') + (state.mastered.includes(e.id) ? ' done' : '')}
                    aria-pressed={on}
                    title={e.desc}
                    onClick={() => toggleEnding(e.id)}
                  >
                    {e.label}
                    {acc != null && <small>{acc}%</small>}
                  </button>
                )
              })}
            </div>
            <div className="kc-quick">
              <button type="button" className="btn-ghost sm" onClick={() => savePrefs({ endings: DEFAULT_ENDINGS })}>3 đuôi cơ bản</button>
              <button type="button" className="btn-ghost sm" onClick={() => savePrefs({ endings: ENDINGS.map((e) => e.id) })}>Tất cả</button>
            </div>
          </div>

          <div className="kc-field">
            <span className="hg-group-title">Nhóm từ</span>
            <div className="kc-chips">
              {(['all', ...CLASSES.filter((c) => c !== 'copula')] as Filter[]).map((c) => (
                <button key={c} type="button" className={'chip kc-chip' + (cls === c ? ' on' : '')} aria-pressed={cls === c} onClick={() => setCls(c)}>
                  {c === 'all' ? 'Tất cả' : CLASS_LABEL[c]}
                  <small>{c === 'all' ? POOL.length : POOL.filter((l) => l.cls === c).length}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="kc-field">
            <span className="hg-group-title">Cách trả lời</span>
            <div className="vl-modes" role="radiogroup" aria-label="Cách trả lời">
              {([['choice', 'Chọn 1 trong 4', 'cards'], ['type', 'Tự gõ tiếng Hàn', 'keyboard']] as const).map(([id, label, icon]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={prefs.mode === id}
                  className={'vl-mode' + (prefs.mode === id ? ' on' : '')}
                  onClick={() => savePrefs({ mode: id })}
                >
                  <Icon name={icon} size={14} /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hg-actions kc-go">
            <button className="btn-primary" disabled={available < MIN_ROUND} onClick={() => start()}>
              <Icon name="play" size={15} /> Bắt đầu {Math.min(ROUND, available)} câu
            </button>
            {state.weak.length >= 3 && weakAvail >= MIN_ROUND && (
              <button className="btn-ghost" onClick={() => start({ only: true })}>
                <Icon name="refresh" size={15} /> Ôn {state.weak.length} từ hay sai
              </button>
            )}
          </div>
          {available < MIN_ROUND && (
            <p className="hg-note">
              Nhóm {cls === 'all' ? '' : CLASS_LABEL[cls]} chỉ có {available} dạng với các đuôi đang chọn — thêm đuôi hoặc chọn nhóm khác.
            </p>
          )}
          <p className="hg-note">
            Một đuôi được tính là vững khi đúng từ {MASTERY}% trở lên sau ít nhất {MIN_TRIES} câu. Từ bạn chia sai sẽ được hỏi lại
            nhiều hơn ở các lượt sau.
          </p>
        </div>
      </section>
    </div>
  )
}

function ClassCard({ cls, canHear, onDrill }: { cls: Cls; canHear: boolean; onDrill: () => void }) {
  const info = CLASS_RULE[cls]
  const examples = useMemo(() => classExamples(cls), [cls])
  return (
    <article className="kc-class">
      <h3 className="kc-class-h">{CLASS_LABEL[cls]}</h3>
      <p className="kc-class-rule"><KoText text={info.rule} /></p>
      <ul className="kc-examples">
        {examples.map((ex) => (
          <li key={ex.dict} className={ex.contrast ? 'contrast' : undefined}>
            <span className="kc-ex-dict">
              <span lang="ko">{ex.dict}</span>
              <small>{ex.contrast ? 'quy tắc · ' : ''}{ex.vi}</small>
            </span>
            <span className="kc-ex-forms">
              {ex.forms.map((f) => (
                <button
                  key={f.ending}
                  type="button"
                  className={'kc-form' + (canHear ? ' on' : '')}
                  title={ENDING_BY_ID[f.ending].label}
                  onClick={canHear ? () => speakKO(f.form, 0.8) : undefined}
                  tabIndex={canHear ? 0 : -1}
                >
                  <span lang="ko">{f.form}</span>
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-ghost sm kc-class-go" onClick={onDrill}>
        <Icon name="target" size={14} /> Luyện nhóm này
      </button>
    </article>
  )
}

const SAMPLES = ['듣다', '덥다', '모르다', '살다', '하얗다']

function Lookup({ canHear, showRom }: { canHear: boolean; showRom: boolean }) {
  const [text, setText] = useState('듣다')
  const lex = findLex(text)
  const rows = useMemo(() => {
    if (!lex) return []
    return ENDINGS.map((e) => {
      const ok = drillable(lex, e.id)
      const c = ok ? conjugate(lex, e.id) : null
      const why = !c ? (grammatical(lex, e.id) ? 'Ít dùng với từ này' : e.verbOnly ? 'Chỉ dùng với động từ' : 'Không dùng') : ''
      return { e, c, why }
    })
  }, [lex])

  return (
    <section className="kc-lookup" aria-labelledby="kc-lookup-h">
      <div className="section-title" id="kc-lookup-h"><span className="pin" /> Tra bảng chia</div>
      <div className="kc-lookup-bar">
        <input
          className="hg-input kc-lookup-input"
          lang="ko"
          list="kc-words"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Gõ dạng từ điển, ví dụ 먹다"
          aria-label="Động từ hoặc tính từ cần tra"
        />
        <datalist id="kc-words">
          {POOL.map((l) => <option key={l.dict} value={l.dict}>{l.vi}</option>)}
        </datalist>
        <div className="kc-samples">
          {SAMPLES.map((s) => (
            <button key={s} type="button" className={'chip kc-chip' + (lex?.dict === s ? ' on' : '')} onClick={() => setText(s)}>
              <span lang="ko">{s}</span>
            </button>
          ))}
        </div>
      </div>

      {!lex ? (
        <p className="hg-note">
          {text.trim() ? 'Từ này chưa có trong kho của trang. Thử dạng từ điển kết thúc bằng 다, ví dụ 가다, 먹다, 덥다.' : 'Gõ một động từ hoặc tính từ để xem đủ 13 dạng chia.'}
        </p>
      ) : (
        <>
          <p className="kc-lookup-meta">
            <b lang="ko">{lex.dict}</b> · {lex.vi} · {POS_LABEL[lex.pos]} · <span className="kc-tag">{CLASS_LABEL[lex.cls]}</span>
          </p>
          <div className="kn-table-wrap">
            <table className="kn-table kc-table">
              <thead>
                <tr><th scope="col">Đuôi</th><th scope="col">Dạng chia</th><th scope="col">Vì sao</th></tr>
              </thead>
              <tbody>
                {rows.map(({ e, c, why }) => (
                  <tr key={e.id} className={c ? undefined : 'off'}>
                    <td>
                      <b className="kc-row-label">{e.label}</b>
                      <small lang="ko">{e.short}</small>
                    </td>
                    <td>
                      {c ? (
                        <button
                          type="button"
                          className={'kc-form big' + (canHear ? ' on' : '')}
                          onClick={canHear ? () => speakKO(c.form, 0.8) : undefined}
                          tabIndex={canHear ? 0 : -1}
                        >
                          <span lang="ko">{c.form}</span>
                          {showRom && <small>{romanizeLine(c.form)}</small>}
                        </button>
                      ) : <span className="kc-none">—</span>}
                    </td>
                    <td className="kc-why">
                      {c ? <KoText text={c.rule} /> : why}
                      {c?.note && <em><KoText text={c.note} /></em>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
