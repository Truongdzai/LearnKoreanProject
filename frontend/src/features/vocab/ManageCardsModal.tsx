import { useCallback, useEffect, useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { deleteCard, deleteDeck, fetchAllCards, updateCard } from '@/core/api/srs.api'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { useDialog } from '@/core/a11y'
import type { SrsCard } from '@/models/srs.model'

interface Props {
  defaultTopic?: string
  onClose: () => void
  onChanged: () => void
}

const PAGE = 60

export default function ManageCardsModal({ defaultTopic = '', onClose, onChanged }: Props) {
  const { learnLang, t } = useAppStore()
  const { isAuthed } = useAuth()
  const boxRef = useDialog<HTMLDivElement>(true, onClose)
  const [cards, setCards] = useState<SrsCard[] | null>(null)
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState(defaultTopic)
  const [shown, setShown] = useState(PAGE)
  const [editing, setEditing] = useState<SrsCard | null>(null)
  const [draft, setDraft] = useState({ front: '', back: '', source: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [askDeck, setAskDeck] = useState(false)

  const load = useCallback(async () => {
    setErr('')
    try {
      const { cards: list } = await fetchAllCards()
      setCards(list)
    } catch (e) {
      setCards([])
      setErr((e as Error).message || t('mc.errLoad'))
    }
  }, [t])

  useEffect(() => { load() }, [load])

  const topics = useMemo(() => {
    const by = new Map<string, number>()
    for (const c of cards ?? []) {
      const key = (c.source || '').trim()
      by.set(key, (by.get(key) || 0) + 1)
    }
    return [...by.entries()].sort((a, b) => b[1] - a[1])
  }, [cards])

  const view = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (cards ?? []).filter((c) => {
      if (topic && (c.source || '').trim() !== topic) return false
      if (!q) return true
      return `${c.front} ${c.back}`.toLowerCase().includes(q)
    })
  }, [cards, query, topic])

  useEffect(() => { setShown(PAGE) }, [query, topic])

  const startEdit = (c: SrsCard) => {
    setErr('')
    setEditing(c)
    setDraft({ front: c.front, back: c.back || '', source: c.source || '' })
  }

  const saveEdit = async () => {
    if (!editing || busy) return
    const front = draft.front.trim()
    if (!front) { setErr(t('mc.errEmpty')); return }
    setBusy(true); setErr('')
    try {
      const saved = await updateCard(editing.id, { front, back: draft.back.trim(), source: draft.source.trim() })
      setCards((list) => (list ?? []).map((c) => (c.id === saved.id ? saved : c)))
      setEditing(null)
      onChanged()
    } catch (e) {
      setErr((e as Error).message || t('mc.errSave'))
    } finally {
      setBusy(false)
    }
  }

  const removeOne = async (c: SrsCard) => {
    if (busy) return
    setBusy(true); setErr('')
    try {
      await deleteCard(c)
      setCards((list) => (list ?? []).filter((x) => x.id !== c.id))
      if (editing?.id === c.id) setEditing(null)
      onChanged()
    } catch (e) {
      setErr((e as Error).message || t('mc.errDelete'))
    } finally {
      setBusy(false)
    }
  }

  const removeDeck = async () => {
    if (busy || !isAuthed) return
    setBusy(true); setErr('')
    try {
      await deleteDeck(topic)
      setCards((list) => (list ?? []).filter((c) => (c.source || '').trim() !== topic))
      setAskDeck(false)
      setTopic('')
      onChanged()
    } catch (e) {
      setErr((e as Error).message || t('mc.errDelete'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="vmodal-backdrop" onClick={onClose}>
      <div className="vmodal vmodal-wide" ref={boxRef} role="dialog" aria-modal="true" aria-labelledby="mc-title" onClick={(e) => e.stopPropagation()}>
        <div className="vmodal-head">
          <h3 id="mc-title"><Icon name="cards" size={18} /> {t('mc.title')}</h3>
          <button type="button" className="vmodal-x" onClick={onClose} aria-label={t('a11y.close')}><Icon name="x" size={18} /></button>
        </div>

        <div className="mc-tools">
          <div className="vc-search mc-search">
            <Icon name="search" size={15} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('mc.searchPh')} aria-label={t('mc.searchPh')} />
            {query && <button className="lib-search-x" onClick={() => setQuery('')} aria-label={t('lib.clear')}><Icon name="x" size={13} /></button>}
          </div>
          {topics.length > 0 && (
            <div className="mc-topics">
              <button className={'rv-deck' + (topic === '' ? ' on' : '')} onClick={() => setTopic('')}>
                {t('mc.allTopics')} <b>{(cards ?? []).length}</b>
              </button>
              {topics.map(([key, n]) => (
                <button key={key || 'other'} className={'rv-deck' + (topic === key ? ' on' : '')} onClick={() => setTopic(key)} title={key}>
                  {key || t('rv.deckOther')} <b>{n}</b>
                </button>
              ))}
            </div>
          )}
        </div>

        {topic && isAuthed && (
          askDeck ? (
            <div className="mc-askdeck">
              <span>{t('mc.deckAsk', { name: topic, n: view.length })}</span>
              <button className="btn-primary sm" disabled={busy} onClick={removeDeck}>{t('mc.deckYes')}</button>
              <button className="btn-ghost sm" onClick={() => setAskDeck(false)}>{t('vm.cancel')}</button>
            </div>
          ) : (
            <button className="mc-deckdel" onClick={() => setAskDeck(true)}>
              <Icon name="trash" size={13} /> {t('mc.deckDelete', { name: topic })}
            </button>
          )
        )}

        {err && <div className="vmodal-err">{err}</div>}

        {cards === null ? (
          <div className="mc-loading"><Spinner /> {t('mc.loading')}</div>
        ) : view.length === 0 ? (
          <div className="mc-empty"><Icon name="cards" size={26} /> {t('mc.empty')}</div>
        ) : (
          <>
            <div className="mc-count">{t('mc.count', { n: view.length })}</div>
            <ul className="mc-list">
              {view.slice(0, shown).map((c) => (
                <li key={c.id} className={'mc-row' + (editing?.id === c.id ? ' editing' : '')}>
                  {editing?.id === c.id ? (
                    <div className="mc-edit">
                      <input
                        value={draft.front}
                        onChange={(e) => setDraft({ ...draft, front: e.target.value })}
                        placeholder={t('mc.front')}
                        aria-label={t('mc.front')}
                        maxLength={200}
                        lang={learnLang}
                        autoFocus
                      />
                      <input
                        value={draft.back}
                        onChange={(e) => setDraft({ ...draft, back: e.target.value })}
                        placeholder={t('mc.back')}
                        aria-label={t('mc.back')}
                        maxLength={500}
                      />
                      <input
                        value={draft.source}
                        onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                        placeholder={t('mc.topic')}
                        aria-label={t('mc.topic')}
                        maxLength={80}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit() }}
                      />
                      <div className="mc-editacts">
                        <button className="btn-primary sm" disabled={busy} onClick={saveEdit}>{t('mc.save')}</button>
                        <button className="btn-ghost sm" onClick={() => setEditing(null)}>{t('vm.cancel')}</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mc-text">
                        <b lang={learnLang}>{c.front}</b>
                        <small>{c.back || '—'}</small>
                        {c.source && <span className="mc-tag">{c.source}</span>}
                      </div>
                      <div className="mc-acts">
                        {isAuthed && (
                          <button onClick={() => startEdit(c)} title={t('mc.edit')} aria-label={t('mc.edit')}>
                            <Icon name="tool" size={14} />
                          </button>
                        )}
                        <button className="danger" disabled={busy} onClick={() => removeOne(c)} title={t('mc.delete')} aria-label={t('mc.delete')}>
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {view.length > shown && (
              <button className="btn-ghost sm mc-more" onClick={() => setShown((n) => n + PAGE)}>
                {t('mc.more', { n: view.length - shown })}
              </button>
            )}
          </>
        )}

        <div className="vmodal-foot">
          <button className="btn-ghost" onClick={onClose}>{t('mc.close')}</button>
        </div>
      </div>
    </div>
  )
}
