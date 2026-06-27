import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { useAppStore } from '@/store/app.store'
import { defineWordRich } from '@/core/api/dict.api'
import { addCard } from '@/core/api/srs.api'
import { romanizeWord } from '@/core/utils/romanize'
import { studyLang } from '@/core/constants/languages'
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
  const { lookupOpen, closeLookup, lookupSeed, isAuthed, learnLang, nativeLang } = useAppStore()
  const cfg = studyLang(learnLang)
  const [q, setQ] = useState('')
  const [view, setView] = useState<View | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const run = async (raw: string) => {
    const t = raw.trim()
    if (!t) return
    setLoading(true)
    setError('')
    setView(null)
    setSaved(false)
    try {
      const r = await defineWordRich(t, learnLang, nativeLang)
      setView(toView(r))
    } catch {
      setError('Không kết nối được máy chủ tra cứu. Hãy thử lại sau giây lát.')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookupOpen, lookupSeed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLookup()
    if (lookupOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lookupOpen, closeLookup])

  if (!lookupOpen) return null

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = cfg.locale
      speechSynthesis.speak(u)
    } catch {
      /* not supported */
    }
  }

  const save = async () => {
    if (!view || saved) return
    try {
      await addCard({ front: view.term, back: view.meaning, source: 'Tra cứu từ vựng' })
      setSaved(true)
    } catch {
      setError(isAuthed ? 'Lưu thẻ thất bại, hãy thử lại.' : 'Hãy đăng nhập để lưu vào flashcard.')
    }
  }

  return (
    <div className="lookup-backdrop" onClick={closeLookup}>
      <div className="lookup" onClick={(e) => e.stopPropagation()}>
        <div className="lookup-head">
          <span className="lookup-tab"><Icon name="vyling" size={16} /> Tra cứu từ vựng</span>
          <button className="lookup-close" onClick={closeLookup}><Icon name="x" /></button>
        </div>

        <div className="lookup-bar">
          <Icon name="search" size={16} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run(q)}
            placeholder={`Nhập từ ${cfg.name} cần tra…`}
          />
          <button className="lookup-go" onClick={() => run(q)}><Icon name="sparkles" size={15} /> Tra cứu</button>
        </div>

        {loading ? (
          <div className="lookup-empty"><Spinner /><p>Đang tra cứu “{q.trim()}”…</p></div>
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
            <p>Nhập một từ {cfg.name} rồi nhấn <b>Tra cứu</b>. VyLing phân tích nghĩa, phiên âm, từ loại, cách dùng, ví dụ và lỗi thường gặp{learnLang === 'ko' ? ' (kèm từ điển Hàn–Việt KRDICT)' : ''}.</p>
            <div className="lookup-suggest">
              {cfg.sample.map((k) => <button key={k} onClick={() => { setQ(k); run(k) }}>{k}</button>)}
            </div>
          </div>
        ) : !view.found ? (
          <div className="lookup-empty">
            <Icon name="frown" size={36} />
            <p>Không tìm thấy “<b lang={learnLang}>{view.term}</b>”. Hãy kiểm tra lại chính tả hoặc thử dạng gốc của từ.</p>
            <button className="lr-speak" onClick={() => speak(view.term)} title="Phát âm"><Icon name="volume" size={16} /> Nghe phát âm</button>
          </div>
        ) : (
          <div className="lookup-result">
            <div className="lr-term">
              <span className="lr-word" lang={learnLang}>{view.term}</span>
              {view.hanja && <span className="lr-hanja">{view.hanja}</span>}
              {view.phon && <span className="lr-phon">{view.phon}</span>}
              <button className="lr-speak" onClick={() => speak(view.term)} title="Phát âm"><Icon name="volume" size={16} /></button>
              <span className="lr-source">{learnLang === 'ko' ? (view.ai ? 'KRDICT + AI' : 'Từ điển KRDICT') : 'Phân tích bằng AI'}</span>
            </div>

            {(view.pos || view.level) && (
              <div className="lr-tags">
                {view.pos && <span className="lr-tag pos"><small>Từ loại</small>{view.pos}</span>}
                {view.level && <span className="lr-tag lvl"><small>Level</small>{view.level}</span>}
              </div>
            )}

            <div className="lr-block accent"><div className="lr-label">Nghĩa</div><b lang="vi">{view.meaning}</b></div>
            {view.explain && <div className="lr-block"><div className="lr-label"><Icon name="bulb" size={13} /> Giải thích</div><p>{view.explain}</p></div>}
            {view.usage && <div className="lr-block"><div className="lr-label"><Icon name="note" size={13} /> Cách sử dụng</div><p>{view.usage}</p></div>}

            {view.examples.length > 0 && (
              <div className="lr-block"><div className="lr-label"><Icon name="film" size={13} /> Ví dụ</div>
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
              <div className="lr-block"><div className="lr-label"><Icon name="sparkles" size={13} /> Cụm từ thường gặp</div>
                <ul className="lr-list">{view.phrases.map((p, i) => <li key={i}>{p}</li>)}</ul>
              </div>
            )}

            {view.mistakes && <div className="lr-block warn"><div className="lr-label"><Icon name="x-circle" size={13} /> Lỗi thường gặp</div><p>{view.mistakes}</p></div>}

            {view.synonyms.length > 0 && (
              <div className="lr-block"><div className="lr-label"><Icon name="copy" size={13} /> Đồng nghĩa / liên quan</div>
                <div className="lr-syn">{view.synonyms.map((s, i) => <span key={i}>{s}</span>)}</div>
              </div>
            )}

            {error && <div className="shadow-err"><Icon name="x-circle" size={15} /> {error}</div>}
            <button className="lr-save" onClick={save} disabled={saved}>
              <Icon name={saved ? 'check' : 'plus'} size={15} /> {saved ? 'Đã lưu vào flashcard' : 'Lưu vào flashcard của tôi'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
