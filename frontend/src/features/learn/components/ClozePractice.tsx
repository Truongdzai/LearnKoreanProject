import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { studyLang } from '@/core/constants/languages'
import type { Lesson } from '@/models/lesson.model'

const REWARD = 2

/** Từ quá phổ biến thì đục lỗ không có giá trị luyện nghe (EN pilot; ngôn ngữ khác lọc theo độ dài). */
const EN_STOP = new Set(['the', 'and', 'that', 'this', 'with', 'for', 'you', 'your', 'are', 'was', 'were', 'have', 'has', 'not', 'but', 'they', 'them', 'his', 'her', 'its', 'our', 'from', 'will', 'can', 'what', 'when', 'where'])

interface ClozeItem {
  segIndex: number
  text: string
  vi: string
  words: string[]
  blankIndex: number
  answer: string
  options: string[]
}

const clean = (w: string) => w.replace(/[.,!?;:"'()«»“”‘’…]/g, '')

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Chọn từ để đục lỗ: dài ≥ 3 ký tự, không phải từ quá phổ biến — ưu tiên từ dài (mang nghĩa). */
function buildItems(lesson: Lesson): ClozeItem[] {
  const vocab = new Set<string>()
  for (const seg of lesson.segments) {
    for (const w of seg.ko.split(/\s+/)) {
      const c = clean(w).toLowerCase()
      if (c.length >= 3 && !EN_STOP.has(c)) vocab.add(c)
    }
  }
  const pool = [...vocab]

  const items: ClozeItem[] = []
  lesson.segments.forEach((seg, segIndex) => {
    const words = seg.ko.split(/\s+/).filter(Boolean)
    if (words.length < 4) return
    const candidates = words
      .map((w, idx) => ({ idx, c: clean(w).toLowerCase() }))
      .filter(({ c }) => c.length >= 3 && !EN_STOP.has(c))
      .sort((a, b) => b.c.length - a.c.length)
      .slice(0, 3)
    if (!candidates.length) return
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    const answer = clean(words[pick.idx])
    if (!answer) return
    const distractors = shuffle(pool.filter((w) => w !== answer.toLowerCase()))
      .sort((a, b) => Math.abs(a.length - answer.length) - Math.abs(b.length - answer.length))
      .slice(0, 3)
    if (distractors.length < 3) return
    items.push({
      segIndex,
      text: seg.ko,
      vi: seg.vi || '',
      words,
      blankIndex: pick.idx,
      answer,
      options: shuffle([answer.toLowerCase(), ...distractors]),
    })
  })
  return items
}

export default function ClozePractice({ lesson }: { lesson: Lesson }) {
  const { recordEvent, learnLang, t } = useAppStore()
  const cfg = studyLang(learnLang)
  const items = useMemo(() => buildItems(lesson), [lesson])
  const [i, setI] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [rewarded, setRewarded] = useState<Set<number>>(new Set())
  const [correct, setCorrect] = useState(0)

  if (!items.length) {
    return <div className="empty"><div className="big">🧩</div>{t('cz.empty')}</div>
  }

  const cur = items[i]
  const done = picked !== null
  const isRight = done && picked === cur.answer.toLowerCase()

  const speak = (rate = 0.9) => {
    try {
      speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(cur.text)
      u.lang = cfg.locale
      u.rate = rate
      speechSynthesis.speak(u)
    } catch { /* unsupported */ }
  }

  const pick = (opt: string) => {
    if (done) return
    setPicked(opt)
    if (opt === cur.answer.toLowerCase()) {
      setCorrect((n) => n + 1)
      if (!rewarded.has(i)) {
        recordEvent('review', 1)
        setRewarded((r) => new Set(r).add(i))
      }
    }
  }

  const go = (idx: number) => {
    if (idx < 0 || idx >= items.length) return
    setI(idx)
    setPicked(null)
  }

  return (
    <div className="dictation cloze">
      <div className="shadow-bar">
        <button className="btn-ghost sm" disabled={i === 0} onClick={() => go(i - 1)}><Icon name="chevron-left" size={15} /> {t('sh.prev')}</button>
        <div className="shadow-prog">
          <span>{t('sh.line', { a: i + 1, b: items.length })}</span>
          <div className="tp-bar"><span style={{ width: ((i + 1) / items.length) * 100 + '%' }} /></div>
          <span className="shadow-passed"><Icon name="check-circle" size={14} /> {t('dict.correct', { n: correct })}</span>
        </div>
        <button className="btn-ghost sm" disabled={i === items.length - 1} onClick={() => go(i + 1)}>{t('sh.next')} <Icon name="arrow-right" size={15} /></button>
      </div>

      <div className="dict-card">
        <div className="dict-label"><Icon name="target" size={15} /> {t('cz.label')}</div>

        <div className="dict-listen">
          <button className="dict-play" onClick={() => speak(0.9)}><Icon name="volume" size={22} /> {t('dict.listen')}</button>
          <button className="btn-ghost" onClick={() => speak(0.6)}><Icon name="volume" size={16} /> {t('sh.slow')}</button>
        </div>

        <p className="cz-sentence" lang={learnLang}>
          {cur.words.map((w, k) =>
            k === cur.blankIndex ? (
              <span key={k} className={'cz-blank' + (done ? (isRight ? ' ok' : ' miss') : '')}>
                {done ? cur.answer : '____'}
              </span>
            ) : (
              <span key={k}>{w} </span>
            ),
          )}
        </p>
        {cur.vi && done && <div className="dict-vi">{cur.vi}</div>}

        <div className="cz-options">
          {cur.options.map((opt) => {
            const cls =
              'cz-opt' +
              (done && opt === cur.answer.toLowerCase() ? ' right' : '') +
              (done && picked === opt && opt !== cur.answer.toLowerCase() ? ' wrong' : '')
            return (
              <button key={opt} className={cls} disabled={done} onClick={() => pick(opt)} lang={learnLang}>
                {opt}
              </button>
            )
          })}
        </div>

        {done && (
          <div className={'dict-score ' + (isRight ? 'good' : 'low')}>
            <b>{isRight ? t('cz.right') : t('cz.wrong', { w: cur.answer })}</b>
            {isRight && rewarded.has(i) && <span className="sr-coin">+{REWARD} XP <Icon name="star" size={13} /></span>}
          </div>
        )}

        <div className="dict-actions">
          {done && i < items.length - 1 && (
            <button className="btn-primary sm" onClick={() => go(i + 1)} autoFocus>
              {t('dict.nextLine')} <Icon name="arrow-right" size={15} />
            </button>
          )}
          {done && i === items.length - 1 && (
            <span className="cz-final">🎉 {t('cz.done', { a: correct, b: items.length })}</span>
          )}
        </div>
      </div>
    </div>
  )
}
