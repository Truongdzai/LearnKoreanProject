import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { speakLang } from '@/core/tts'
import { addCard } from '@/core/api/srs.api'
import { studyLang } from '@/core/constants/languages'
import { sortMisses, type MissBook } from '@/core/missBook'
import { useAppStore } from '@/store/app.store'

const PREVIEW = 12

interface Props {
  book: MissBook
  onDrop: (word: string, lang: string) => void
  onClear: () => void
}

export default function MissBookCard({ book, onDrop, onClear }: Props) {
  const { t, learnLang } = useAppStore()
  const cfg = studyLang(learnLang)
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(0)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const items = useMemo(
    () => sortMisses(book.items.filter((it) => it.lang === learnLang)),
    [book.items, learnLang],
  )
  const shown = open ? items : items.slice(0, PREVIEW)

  const saveAll = async () => {
    if (!items.length || busy) return
    setBusy(true); setErr('')
    try {
      for (const it of items) {
        const back = it.vi ? `${it.ctx} — ${it.vi}` : it.ctx || it.w
        await addCard({ front: it.w, back, source: 'missbook' })
      }
      setSaved(items.length)
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="act-card miss-card">
      <div className="act-card-head">
        <b>{t('miss.title')}</b>
        <span>{t('miss.sub')}</span>
      </div>

      {!items.length ? (
        <p className="skill-empty">{t('miss.empty')}</p>
      ) : (
        <>
          <div className="miss-list">
            {shown.map((it) => (
              <div key={it.lang + '|' + it.w} className={'miss-item ' + it.k}>
                <button className="miss-say" title={it.w} onClick={() => speakLang(it.w, cfg.locale, 0.85)}>
                  <Icon name="volume" size={14} />
                </button>
                <div className="miss-body">
                  <b lang={learnLang}>{it.w}</b>
                  {it.ctx && <span className="miss-ctx" lang={learnLang}>{it.ctx}</span>}
                </div>
                <span className="miss-n">{t('miss.times', { n: it.n })} · {t(it.k === 'speak' ? 'miss.fromSpeak' : 'miss.fromListen')}</span>
                <button className="miss-drop" onClick={() => onDrop(it.w, it.lang)}>
                  <Icon name="check-circle" size={14} /> {t('miss.drop')}
                </button>
              </div>
            ))}
          </div>

          <div className="miss-actions">
            {items.length > PREVIEW && (
              <button className="btn-ghost sm" onClick={() => setOpen((o) => !o)}>
                {open ? t('miss.less') : t('miss.more', { n: items.length - PREVIEW })}
              </button>
            )}
            {saved ? (
              <span className="shadow-savedok"><Icon name="check-circle" size={14} /> {t('miss.savedAll', { n: saved })}</span>
            ) : (
              <button className="btn-primary sm" disabled={busy} onClick={saveAll}>
                <Icon name="cards" size={14} /> {t('miss.saveAll', { n: items.length })}
              </button>
            )}
            <button className="btn-ghost sm" onClick={onClear}><Icon name="trash" size={14} /> {t('miss.clear')}</button>
          </div>
          {err && <div className="shadow-err"><Icon name="x-circle" size={14} /> {err}</div>}
        </>
      )}
    </div>
  )
}
