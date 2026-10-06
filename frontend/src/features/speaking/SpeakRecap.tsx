import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { addCard } from '@/core/api/srs.api'
import { useAppStore } from '@/store/app.store'
import type { SpeakLine } from '@/core/api/speaking.api'
import { phraseUsed } from './recap'

interface Msg { who: 'bot' | 'me'; ko: string; vi: string; feedback?: string }

interface Props {
  msgs: Msg[]
  keyPhrases: SpeakLine[]
  title: string
  lang: string
  speak: (text: string) => void
}

type SaveState = 'saving' | 'saved' | 'error'

export default function SpeakRecap({ msgs, keyPhrases, title, lang, speak }: Props) {
  const { recordEvent, t } = useAppStore()
  const [saved, setSaved] = useState<Record<string, SaveState>>({})

  const mine = msgs.filter((m) => m.who === 'me')
  const corrected = mine.filter((m) => m.feedback)
  const said = mine.map((m) => m.ko).join(' ')
  const used = keyPhrases.filter((p) => phraseUsed(p.ko, said))
  // Câu của bạn diễn có nghĩa tiếng Việt mới đáng lưu thành thẻ; bỏ thông báo hệ thống không có nghĩa
  const botLines = msgs.filter((m) => m.who === 'bot' && m.vi.trim() && m.ko.trim())
  const source = (t('sp.recapSource') + title).slice(0, 80)

  const save = async (items: SpeakLine[]) => {
    const todo = items.filter((it) => !saved[it.ko] || saved[it.ko] === 'error')
    if (!todo.length) return
    setSaved((s) => ({ ...s, ...Object.fromEntries(todo.map((it) => [it.ko, 'saving' as const])) }))
    let ok = 0
    for (const it of todo) {
      try {
        await addCard({ front: it.ko, back: it.vi, source, lang })
        ok += 1
        setSaved((s) => ({ ...s, [it.ko]: 'saved' }))
      } catch {
        setSaved((s) => ({ ...s, [it.ko]: 'error' }))
      }
    }
    if (ok) recordEvent('word', ok, 0, ok)
  }

  const row = (it: SpeakLine, key: string) => {
    const st = saved[it.ko]
    return (
      <div key={key} className="sp-recap-row">
        <button className="sp-phrase-speak" onClick={() => speak(it.ko)} title={t('sp.hear')} aria-label={t('sp.hear')}>
          <Icon name="volume" size={13} />
        </button>
        <div className="sp-recap-text">
          <b lang={lang}>{it.ko}</b>
          <small>{it.vi}</small>
        </div>
        <button
          className={'btn-ghost sm' + (st === 'saved' ? ' ok' : '')}
          disabled={st === 'saving' || st === 'saved'}
          onClick={() => save([it])}
        >
          {st === 'saved' ? <><Icon name="check" size={13} /> {t('sp.recapSaved')}</>
            : st === 'error' ? t('sp.recapRetry')
            : <><Icon name="plus" size={13} /> {t('sp.recapSave')}</>}
        </button>
      </div>
    )
  }

  if (!mine.length) return null

  return (
    <div className="sp-recap">
      {keyPhrases.length > 0 && (
        <section>
          <div className="sp-recap-head">
            <span>{t('sp.recapPhrases', { k: used.length, n: keyPhrases.length })}</span>
            <button className="btn-primary sm" onClick={() => save(keyPhrases)}>
              <Icon name="cards" size={13} /> {t('sp.recapSaveAll')}
            </button>
          </div>
          {keyPhrases.map((p, i) => (
            <div key={i} className={'sp-recap-used' + (used.includes(p) ? ' on' : '')}>
              <Icon name={used.includes(p) ? 'check-circle' : 'minus'} size={13} />
              {row(p, 'k' + i)}
            </div>
          ))}
        </section>
      )}

      {corrected.length > 0 && (
        <section>
          <div className="sp-recap-head"><span>{t('sp.recapFixes', { n: corrected.length })}</span></div>
          {corrected.map((m, i) => (
            <div key={i} className="sp-recap-fix">
              <p lang={lang}>“{m.ko}”</p>
              <small><Icon name="sparkles" size={12} /> {m.feedback}</small>
            </div>
          ))}
        </section>
      )}

      {botLines.length > 0 && (
        <section>
          <div className="sp-recap-head"><span>{t('sp.recapBot')}</span></div>
          {botLines.map((m, i) => row({ ko: m.ko, vi: m.vi }, 'b' + i))}
        </section>
      )}
    </div>
  )
}
