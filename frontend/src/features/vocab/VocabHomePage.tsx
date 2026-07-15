import { useCallback, useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'
import { fetchAllCards, fetchStats } from '@/core/api/srs.api'
import { exportVocabToWord, exportVocabToPdf, type ExportRow } from '@/core/utils/exportVocab'
import { getTopics } from '@/core/utils/topics'
import { packsFor, type ContextPack } from '@/data/contextPacks'
import AddVocabModal from './AddVocabModal'
import CreateTopicModal from './CreateTopicModal'
import ImportVocabModal from './ImportVocabModal'
import ContextPackModal from './ContextPackModal'

const TONES = ['tone-a', 'tone-b', 'tone-c', 'tone-d', 'tone-e', 'tone-f']

interface MyTopic { name: string; count: number }

type Modal = null | 'add' | 'topic' | 'import'

export default function VocabHomePage() {
  const { user, setView, learnLang, goal, t } = useAppStore()
  const [exporting, setExporting] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [openPack, setOpenPack] = useState<ContextPack | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [due, setDue] = useState<number | null>(null)
  const [myTopics, setMyTopics] = useState<MyTopic[]>([])
  const [flash, setFlash] = useState('')

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 2600)
  }

  const reload = useCallback(async () => {
    try {
      const [stats, all] = await Promise.all([fetchStats(), fetchAllCards()])
      setTotal(stats.total)
      setDue(stats.due)
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
      setTotal(null); setDue(null)
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

  const packs = packsFor(learnLang)

  return (
    <div className="vocab-home">
      <h1 className="page-title"><Icon name="cards" /> {t('vc.title')}</h1>
      <p className="page-sub">{learnLang === 'ko' ? t('vc.subKo') : t('vc.sub')}</p>

      {flash && <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>{flash}</div>}

      <div className="vh-stats">
        <div className="vh-stat">
          <div className="vh-stat-top">{t('vc.statTotal')}</div>
          <b>{total ?? '—'}</b>
          <p>{t('vc.statTotalSub')}</p>
          <button className="btn-ghost sm" onClick={() => setView('flashcards')}>{t('vc.review')}</button>
        </div>
        <div className="vh-stat warn">
          <div className="vh-stat-top">{t('vc.statDue')}</div>
          <b>{due ?? '—'}</b>
          <p>{t('vc.statDueSub')}</p>
          <button className="btn-primary sm" onClick={() => setView('flashcards')}>{t('vc.reviewNow')}</button>
        </div>
      </div>

      <div className="vh-actions">
        <button className="vh-big play" onClick={() => setView('flashcards')}>
          <span className="vh-big-ic"><Icon name="play" size={26} /></span>
          <b>{t('vc.learn')}</b>
          <span className="vh-big-go">{t('vc.start')}</span>
        </button>
        <button className="vh-big quiz" onClick={() => setView('flashcards')}>
          <span className="vh-big-ic"><Icon name="target" size={26} /></span>
          <b>{t('vc.quiz')}</b>
          <span className="vh-big-go">{t('vc.start')}</span>
        </button>
        <div className="vh-side">
          <button onClick={() => setModal('add')}><Icon name="plus" size={16} /> {t('vc.add')}</button>
          <button onClick={() => setModal('topic')}><Icon name="cards" size={16} /> {t('vc.topic')}</button>
          <button onClick={() => setModal('import')}><Icon name="upload" size={16} /> {t('vc.import')}</button>
          <button disabled={exporting} onClick={exportVocab('word')}><Icon name="download" size={16} /> {t('vc.exportWord')}</button>
          <button disabled={exporting} onClick={exportVocab('pdf')}><Icon name="copy" size={16} /> {t('vc.exportPdf')}</button>
        </div>
      </div>

      {myTopics.length > 0 && (
        <>
          <div className="section-title"><span className="pin" /> {t('vc.myTopics')}</div>
          <div className="deck-grid">
            {myTopics.map((tp, i) => (
              <button key={tp.name} className="deck-card" onClick={() => setView('flashcards')}>
                <span className={'deck-thumb ' + TONES[i % TONES.length]}><Icon name="cards" size={22} /></span>
                <span className="deck-body">
                  <b>{tp.name}</b>
                  <span className="deck-meta">{t('vc.cardMeta', { n: tp.count })}</span>
                </span>
              </button>
            ))}
            <button className="deck-card deck-add" onClick={() => setModal('topic')}>
              <span className="deck-thumb tone-a"><Icon name="plus" size={22} /></span>
              <span className="deck-body"><b>{t('vc.newTopic')}</b><span className="deck-meta">{t('vc.newTopicSub')}</span></span>
            </button>
          </div>
        </>
      )}

      <div className="section-title"><span className="pin" /> {t('vc.packs')}</div>
      {packs.length > 0 ? (
        <div className="deck-grid">
          {packs.map((p) => (
            <button key={p.id} className="deck-card" onClick={() => setOpenPack(p)}>
              <span className={'deck-thumb ' + p.tone}><span className="deck-emoji">{p.emoji}</span></span>
              <span className="deck-body">
                <b>{p.name}{goal && p.goal === goal && <span className="deck-goal">{t('sp.goalBadge')}</span>}</b>
                <span className="deck-meta">{t('vc.packMeta', { n: (p.words[learnLang] || []).length })}</span>
              </span>
            </button>
          ))}
        </div>
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
