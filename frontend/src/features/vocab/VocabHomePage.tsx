import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { useAuth } from '@/store/auth.store'
import { readGuestDeck, subscribeGuestDeck } from '@/core/guestDeck'
import { fetchAllCards, fetchStats } from '@/core/api/srs.api'
import { exportVocabToWord, exportVocabToPdf, type ExportRow } from '@/core/utils/exportVocab'
import { getTopics } from '@/core/utils/topics'
import { packsFor, type ContextPack } from '@/data/contextPacks'
import type { SrsStats } from '@/models/srs.model'
import AddVocabModal from './AddVocabModal'
import CreateTopicModal from './CreateTopicModal'
import ImportVocabModal from './ImportVocabModal'
import ContextPackModal from './ContextPackModal'

const TONES = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e', 'tone-f']

interface MyTopic { name: string; count: number }

type Modal = null | 'add' | 'topic' | 'import'

const EMPTY_STATS: SrsStats = { total: 0, due: 0, new: 0, learned: 0, reviewed_today: 0 }

export default function VocabHomePage() {
  const { user, setView, learnLang, goal, t } = useAppStore()
  const [exporting, setExporting] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [openPack, setOpenPack] = useState<ContextPack | null>(null)
  const [stats, setStats] = useState<SrsStats | null>(null)
  const [myTopics, setMyTopics] = useState<MyTopic[]>([])
  const [flash, setFlash] = useState('')
  const [query, setQuery] = useState('')
  const { isAuthed, openAuth } = useAuth()
  const guestCount = useSyncExternalStore(subscribeGuestDeck, () => readGuestDeck().length, () => 0)

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2600)
  }

  const reload = useCallback(async () => {
    try {
      const [st, all] = await Promise.all([fetchStats(), fetchAllCards()])
      setStats(st)
      const counts = new Map<string, number>()
      for (const c of all.cards) {
        const src = (c.source || '').trim()
        if (src) counts.set(src, (counts.get(src) || 0) + 1)
      }
      for (const name of getTopics(user.id)) {
        if (!counts.has(name)) counts.set(name, 0)
      }
      setMyTopics([...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count))
    } catch {
      setStats(null)
    }
  }, [user.id])

  useEffect(() => { reload() }, [reload])

  const exportVocab = (kind: 'word' | 'pdf') => async () => {
    setExporting(true)
    try {
      const { cards } = await fetchAllCards()
      if (!cards.length) {
        showFlash(t('vc.exportEmpty'))
        return
      }
      const rows: ExportRow[] = cards.map((c) => ({
        term: c.front,
        meaning: c.back || '—',
        group: c.source || undefined,
      }))
      const title = t('vc.exportTitle')
      if (kind === 'word') exportVocabToWord(title, rows)
      else exportVocabToPdf(title, rows)
    } catch {
      showFlash(t('vc.exportFail'))
    } finally {
      setExporting(false)
    }
  }

  const s = stats ?? EMPTY_STATS
  const hasStats = stats !== null
  const q = query.trim().toLowerCase()

  const allPacks = packsFor(learnLang)
  const packs = useMemo(() => {
    const filtered = q
      ? allPacks.filter((p) => `${p.name} ${p.desc}`.toLowerCase().includes(q))
      : allPacks
    return [...filtered].sort((a, b) => Number(b.goal === goal) - Number(a.goal === goal))
  }, [allPacks, q, goal])

  const topics = useMemo(
    () => (q ? myTopics.filter((tp) => tp.name.toLowerCase().includes(q)) : myTopics),
    [myTopics, q],
  )

  const STAT_CARDS = [
    { key: 'total', ic: 'cards', tone: 'violet', val: s.total, label: t('vc.statTotal') },
    { key: 'due', ic: 'clock', tone: 'amber', val: s.due, label: t('vc.statDue') },
    { key: 'learned', ic: 'check-circle', tone: 'green', val: s.learned, label: t('vc.statLearned') },
    { key: 'today', ic: 'star', tone: 'blue', val: s.reviewed_today, label: t('vc.statToday') },
  ] as const

  return (
    <div className="vocab-home">
      <h1 className="page-title"><Icon name="cards" /> {t('vc.title')}</h1>
      <p className="page-sub">{learnLang === 'ko' ? t('vc.subKo') : t('vc.sub')}</p>

      {flash && <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>{flash}</div>}

      {!isAuthed && guestCount > 0 && (
        <div className="guest-deck-note">
          <Icon name="cards" size={15} />
          <span>{t('vc.guestDeck', { n: guestCount })}</span>
          <button type="button" className="btn-primary sm" onClick={openAuth}>{t('vc.guestDeckCta')}</button>
        </div>
      )}

      <div className="vc-stats">
        {STAT_CARDS.map((c) => (
          <div key={c.key} className={'vc-stat ' + c.tone}>
            <span className="vc-stat-ic"><Icon name={c.ic} size={18} /></span>
            <div>
              <b>{hasStats ? c.val : '—'}</b>
              <span>{c.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="vc-cta">
        <button className="vc-cta-main" onClick={() => setView('flashcards')}>
          <span className="vc-cta-ic"><Icon name="play" size={24} /></span>
          <span className="vc-cta-txt">
            <b>{s.due > 0 ? t('vc.reviewNow') : t('vc.learn')}</b>
            <small>{s.due > 0 ? t('vc.dueHint', { n: s.due }) : t('vc.learnHint')}</small>
          </span>
          <Icon name="arrow-right" size={18} />
        </button>
        <div className="vc-tools">
          <button onClick={() => setModal('add')}><Icon name="plus" size={16} /> {t('vc.add')}</button>
          <button onClick={() => setModal('topic')}><Icon name="cards" size={16} /> {t('vc.topic')}</button>
          <button onClick={() => setModal('import')}><Icon name="upload" size={16} /> {t('vc.import')}</button>
          <button disabled={exporting} onClick={exportVocab('word')}><Icon name="download" size={16} /> {t('vc.exportWord')}</button>
          <button disabled={exporting} onClick={exportVocab('pdf')}><Icon name="copy" size={16} /> {t('vc.exportPdf')}</button>
        </div>
      </div>

      {(myTopics.length > 0 || allPacks.length > 0) && (
        <div className="vc-search">
          <Icon name="search" size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('vc.searchPh')} aria-label={t('vc.searchPh')} />
          {query && <button className="lib-search-x" onClick={() => setQuery('')} aria-label={t('lib.clear')}><Icon name="x" size={14} /></button>}
        </div>
      )}

      {myTopics.length > 0 && (
        <>
          <div className="section-title"><span className="pin" /> {t('vc.myTopics')}</div>
          <div className="deck-grid">
            {topics.map((tp, i) => (
              <button key={tp.name} className="deck-card" onClick={() => setView('flashcards')}>
                <span className={'deck-thumb ' + TONES[i % TONES.length]}><Icon name="cards" size={22} /></span>
                <span className="deck-body">
                  <b>{tp.name}</b>
                  <span className="deck-meta">{t('vc.cardMeta', { n: tp.count })}</span>
                </span>
              </button>
            ))}
            {!q && (
              <button className="deck-card deck-add" onClick={() => setModal('topic')}>
                <span className="deck-thumb tone-a"><Icon name="plus" size={22} /></span>
                <span className="deck-body"><b>{t('vc.newTopic')}</b><span className="deck-meta">{t('vc.newTopicSub')}</span></span>
              </button>
            )}
          </div>
        </>
      )}

      <div className="section-title"><span className="pin" /> {t('vc.packs')}</div>
      {allPacks.length > 0 ? (
        packs.length > 0 ? (
          <div className="deck-grid">
            {packs.map((p) => (
              <button key={p.id} className={'deck-card' + (goal && p.goal === goal ? ' deck-hot' : '')} onClick={() => setOpenPack(p)}>
                <span className={'deck-thumb ' + p.tone}><span className="deck-emoji">{p.emoji}</span></span>
                <span className="deck-body">
                  <b>{p.name}{goal && p.goal === goal && <span className="deck-goal">{t('sp.goalBadge')}</span>}</b>
                  <span className="deck-meta">{t('vc.packMeta', { n: (p.words[learnLang] || []).length })}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty" style={{ marginTop: 8 }}><div className="big">🔍</div>{t('vc.noMatch')}</div>
        )
      ) : (
        <div className="empty"><div className="big">📦</div>{t('vc.packEmpty')}</div>
      )}

      {modal === 'add' && (
        <AddVocabModal
          topics={myTopics.map((tp) => tp.name)}
          onClose={() => setModal(null)}
          onAdded={() => { reload(); showFlash(t('vc.addedFlash')) }}
        />
      )}
      {modal === 'topic' && (
        <CreateTopicModal
          onClose={() => setModal(null)}
          onCreated={(name, n) => { reload(); showFlash(n ? t('vc.topicFlashN', { name, n }) : t('vc.topicFlash', { name })) }}
        />
      )}
      {modal === 'import' && (
        <ImportVocabModal
          title={t('vc.importTitle')}
          topics={myTopics.map((tp) => tp.name)}
          onClose={() => setModal(null)}
          onImported={(n) => { reload(); showFlash(t('vc.importFlash', { n })) }}
        />
      )}
      {openPack && (
        <ContextPackModal
          pack={openPack}
          lang={learnLang}
          onClose={() => setOpenPack(null)}
          onAdded={(n) => { reload(); showFlash(t('vc.packFlash', { n, name: openPack.name })) }}
        />
      )}
    </div>
  )
}
