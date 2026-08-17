import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { speakLang } from '@/core/tts'
import { useAppStore } from '@/store/app.store'
import { defineWordRich, fetchEdgeDict, type EdgeDict } from '@/core/api/dict.api'
import { addCard } from '@/core/api/srs.api'
import { romanizeWord } from '@/core/utils/romanize'
import { studyLang } from '@/core/constants/languages'
import { useDialog } from '@/core/a11y'
import type { DictRichResult } from '@/models/dict.model'

interface View {
  term: string
  hanja: string
  phon: string
  pos: string
  level: string
  meaning: string
  explain: string
  usage: string
  examples: { ko: string; vi: string }[]
  phrases: string[]
  mistakes: string
  synonyms: string[]
  ai: boolean
  found: boolean
}

function toView(r: DictRichResult): View {
  const term = r.entries[0]?.term || r.word
  const rich = r.rich
  const dictMeaning = r.entries.map((e) => e.meaning).filter(Boolean).join(' / ')
  return {
    term,
    hanja: r.entries.find((e) => e.hanja)?.hanja || '',
    phon: rich?.phon || (romanizeWord(term) || ''),
    pos: rich?.pos || r.entries[0]?.pos || '',
    level: rich?.level || '',
    meaning: rich?.meaning || dictMeaning,
    explain: rich?.explain || '',
    usage: rich?.usage || '',
    examples: rich?.examples || [],
    phrases: rich?.phrases || [],
    mistakes: rich?.mistakes || '',
    synonyms: rich?.synonyms || [],
    ai: !!rich?.ai,
    found: r.matched !== 'none' || !!rich,
  }
}

export default function LookupModal() {
  const { lookupOpen, closeLookup, lookupSeed, isAuthed, learnLang, nativeLang, t, learnLangName } = useAppStore()
  const cfg = studyLang(learnLang)
  const [q, setQ] = useState('')
  const [view, setView] = useState<View | null>(null)
  const [quick, setQuick] = useState<EdgeDict | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const run = async (raw: string) => {
    const term = raw.trim()
    if (!term) return
    setLoading(true)
    setError('')
    setView(null)
    setQuick(null)
    setSaved(false)

    if (learnLang === 'en') {
      void fetchEdgeDict(term).then((d) => { if (d) setQuick(d) })
    }

    try {
      const r = await defineWordRich(term, learnLang, nativeLang)
      setView(toView(r))
    } catch {
      setError(t('lk.errServer'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (lookupOpen) {
      setQ(lookupSeed)
      setView(null)
      setError('')
      setSaved(false)
      if (lookupSeed.trim()) run(lookupSeed)
    }
  }, [lookupOpen, lookupSeed])

  const boxRef = useDialog<HTMLDivElement>(lookupOpen, closeLookup)

  if (!lookupOpen) return null

  const speak = (text: string) => speakLang(text, cfg.locale)

  const save = async () => {
    if (!view || saved) return
    try {
      await addCard({ front: view.term, back: view.meaning, source: 'Tra cứu từ vựng' })
      setSaved(true)
    } catch {
      setError(isAuthed ? t('lk.errSave') : t('lk.errLogin'))
    }
  }

  return (
    <div className="lookup-backdrop" onClick={closeLookup}>
      <div className="lookup" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="lookup-title" onClick={(e) => e.stopPropagation()}>
        <div className="lookup-head">
          <span className="lookup-tab" id="lookup-title"><Icon name="vyling" size={16} /> {t('lk.title')}</span>
          <button type="button" className="lookup-close" onClick={closeLookup} aria-label={t('a11y.close')}><Icon name="x" /></button>
        </div>

        <div className="lookup-bar">
          <Icon name="search" size={16} />
          <input
            data-autofocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run(q)}
            placeholder={t('lk.placeholder', { lang: learnLangName })}
            aria-label={t('lk.placeholder', { lang: learnLangName })}
          />
          <button type="button" className="lookup-go" onClick={() => run(q)}><Icon name="sparkles" size={15} /> {t('lk.go')}</button>
        </div>

        {loading && quick ? (
          <div className="lk-quick">
            <div className="lk-quick-head">
              <b lang="en">{quick.word}</b>
              {quick.ipa && <i>{quick.ipa}</i>}
              {quick.audio && (
                <button
                  type="button"
                  className="lk-quick-play"
                  onClick={() => { void new Audio(quick.audio).play().catch(() => {}) }}
                  aria-label={t('lk.playAudio')}
                >
                  <Icon name="volume" size={15} />
                </button>
              )}
            </div>
            <ul className="lk-quick-senses">
              {quick.senses.map((s, k) => (
                <li key={k}>
                  {s.pos && <em>{s.pos}</em>}
                  <span lang="en">{s.def}</span>
                  {s.ex && <q lang="en">{s.ex}</q>}
                </li>
              ))}
            </ul>
            <p className="lk-quick-wait"><Spinner /> {t('lk.viComing')}</p>
          </div>
        ) : loading ? (
          <div className="lookup-empty"><Spinner /><p>{t('lk.searching', { q: q.trim() })}</p></div>
        ) : error && !view ? (
          <div className="lookup-empty">
            <Icon name="x-circle" size={36} />
            <p>{error}</p>
            <div className="lookup-suggest">
              {cfg.sample.map((k) => <button key={k} onClick={() => { setQ(k); run(k) }}>{k}</button>)}
            </div>
          </div>
        ) : !view ? (
          <div className="lookup-empty">
            <Icon name="vyling" size={40} />
            <p>{t('lk.intro', { lang: learnLangName })}{learnLang === 'ko' ? t('lk.introKr') : ''}.</p>
            <div className="lookup-suggest">
              {cfg.sample.map((k) => <button key={k} onClick={() => { setQ(k); run(k) }}>{k}</button>)}
            </div>
          </div>
        ) : !view.found ? (
          <div className="lookup-empty">
            <Icon name="frown" size={36} />
            <p>{t('lk.notFound', { term: view.term })}</p>
            <button className="lr-speak" onClick={() => speak(view.term)} title={t('lk.speak')}><Icon name="volume" size={16} /> {t('lk.listen')}</button>
          </div>
        ) : (
          <div className="lookup-result">
            <div className="lr-term">
              <span className="lr-word" lang={learnLang}>{view.term}</span>
              {view.hanja && <span className="lr-hanja">{view.hanja}</span>}
              {view.phon && <span className="lr-phon">{view.phon}</span>}
              <button className="lr-speak" onClick={() => speak(view.term)} title={t('lk.speak')}><Icon name="volume" size={16} /></button>
              <span className="lr-source">{learnLang === 'ko' ? (view.ai ? 'KRDICT + AI' : t('lk.srcKrdict')) : t('lk.srcAi')}</span>
            </div>

            {(view.pos || view.level) && (
              <div className="lr-tags">
                {view.pos && <span className="lr-tag pos"><small>{t('lk.pos')}</small>{view.pos}</span>}
                {view.level && <span className="lr-tag lvl"><small>Level</small>{view.level}</span>}
              </div>
            )}

            <div className="lr-block accent"><div className="lr-label">{t('lk.meaning')}</div><b lang="vi">{view.meaning}</b></div>
            {view.explain && <div className="lr-block"><div className="lr-label"><Icon name="bulb" size={13} /> {t('lk.explain')}</div><p>{view.explain}</p></div>}
            {view.usage && <div className="lr-block"><div className="lr-label"><Icon name="note" size={13} /> {t('lk.usage')}</div><p>{view.usage}</p></div>}

            {view.examples.length > 0 && (
              <div className="lr-block"><div className="lr-label"><Icon name="film" size={13} /> {t('lk.examples')}</div>
                {view.examples.map((ex, i) => (
                  <div key={i} className="lr-ex">
                    <span lang={learnLang}>{ex.ko}</span>
                    <button className="lr-speak sm" onClick={() => speak(ex.ko)}><Icon name="volume" size={13} /></button>
                    <em>{ex.vi}</em>
                  </div>
                ))}
              </div>
            )}

            {view.phrases.length > 0 && (
              <div className="lr-block"><div className="lr-label"><Icon name="sparkles" size={13} /> {t('lk.phrases')}</div>
                <ul className="lr-list">{view.phrases.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}

            {view.mistakes && <div className="lr-block warn"><div className="lr-label"><Icon name="x-circle" size={13} /> {t('lk.mistakes')}</div><p>{view.mistakes}</p></div>}

            {view.synonyms.length > 0 && (
              <div className="lr-block"><div className="lr-label"><Icon name="copy" size={13} /> {t('lk.synonyms')}</div>
                <div className="lr-syn">{view.synonyms.map((s, i) => <span key={i}>{s}</span>)}</div>
              </div>
            )}

            {error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {error}</div>}
            <button className="lr-save" onClick={save} disabled={saved}>
              <Icon name={saved ? 'check' : 'plus'} size={15} /> {saved ? t('lk.saved') : t('lk.save')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
