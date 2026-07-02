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
  const { user, setView, learnLang, goal } = useAppStore()
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
        showFlash('Bạn chưa có từ vựng nào để xuất. Hãy thêm từ trước nhé.')
        return
      }
      const rows: ExportRow[] = cards.map((c) => ({
        term: c.front,
        meaning: c.back || '—',
        group: c.source || undefined,
      }))
      const title = 'Từ vựng của tôi'
      if (kind === 'word') exportVocabToWord(title, rows)
      else exportVocabToPdf(title, rows)
    } catch {
      showFlash('Không xuất được lúc này. Vui lòng thử lại.')
    } finally {
      setExporting(false)
    }
  }

  const packs = packsFor(learnLang)

  return (
    <div className="vocab-home">
      <h1 className="page-title"><Icon name="cards" /> Từ vựng</h1>
      <p className="page-sub">Học, ôn tập và quản lý kho từ vựng của bạn{learnLang === 'ko' ? ' theo cấp độ TOPIK' : ''}.</p>

      {flash && <div className="shop-flash" style={{ position: 'static', marginBottom: 12 }}>{flash}</div>}

      <div className="vh-stats">
        <div className="vh-stat">
          <div className="vh-stat-top">Tổng số từ vựng</div>
          <b>{total ?? '—'}</b>
          <p>Chủ đề: theo video, đồ ăn, nhà hàng, khách sạn, du lịch…</p>
          <button className="btn-ghost sm" onClick={() => setView('flashcards')}>Xem lại từ vựng</button>
        </div>
        <div className="vh-stat warn">
          <div className="vh-stat-top">Từ vựng cần ôn tập</div>
          <b>{due ?? '—'}</b>
          <p>Ôn đúng lúc giúp nhớ 50–80% lâu hơn so với học dồn.</p>
          <button className="btn-primary sm" onClick={() => setView('flashcards')}>Ôn ngay</button>
        </div>
      </div>

      <div className="vh-actions">
        <button className="vh-big play" onClick={() => setView('flashcards')}>
          <span className="vh-big-ic"><Icon name="play" size={26} /></span>
          <b>Học từ vựng</b>
          <span className="vh-big-go">Bắt đầu</span>
        </button>
        <button className="vh-big quiz" onClick={() => setView('flashcards')}>
          <span className="vh-big-ic"><Icon name="target" size={26} /></span>
          <b>Kiểm tra</b>
          <span className="vh-big-go">Bắt đầu</span>
        </button>
        <div className="vh-side">
          <button onClick={() => setModal('add')}><Icon name="plus" size={16} /> Thêm từ vựng mới</button>
          <button onClick={() => setModal('topic')}><Icon name="cards" size={16} /> Tạo chủ đề</button>
          <button onClick={() => setModal('import')}><Icon name="upload" size={16} /> Import từ (docx/pdf)</button>
          <button disabled={exporting} onClick={exportVocab('word')}><Icon name="download" size={16} /> Xuất Word</button>
          <button disabled={exporting} onClick={exportVocab('pdf')}><Icon name="copy" size={16} /> Xuất PDF</button>
        </div>
      </div>

      {myTopics.length > 0 && (
        <>
          <div className="section-title"><span className="pin" /> Chủ đề của tôi</div>
          <div className="deck-grid">
            {myTopics.map((t, i) => (
              <button key={t.name} className="deck-card" onClick={() => setView('flashcards')}>
                <span className={'deck-thumb ' + TONES[i % TONES.length]}><Icon name="cards" size={22} /></span>
                <span className="deck-body">
                  <b>{t.name}</b>
                  <span className="deck-meta">{t.count} thẻ · của bạn</span>
                </span>
              </button>
            ))}
            <button className="deck-card deck-add" onClick={() => setModal('topic')}>
              <span className="deck-thumb tone-a"><Icon name="plus" size={22} /></span>
              <span className="deck-body"><b>Tạo chủ đề mới</b><span className="deck-meta">Nhóm từ theo ý bạn</span></span>
            </button>
          </div>
        </>
      )}

      <div className="section-title"><span className="pin" /> Gói từ vựng theo ngữ cảnh</div>
      {packs.length > 0 ? (
        <div className="deck-grid">
          {packs.map((p) => (
            <button key={p.id} className="deck-card" onClick={() => setOpenPack(p)}>
              <span className={'deck-thumb ' + p.tone}><span className="deck-emoji">{p.emoji}</span></span>
              <span className="deck-body">
                <b>{p.name}{goal && p.goal === goal && <span className="deck-goal">🎯 hợp mục tiêu</span>}</b>
                <span className="deck-meta">{(p.words[learnLang] || []).length} từ kèm ví dụ · VyLing tuyển chọn</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty"><div className="big">📦</div>Gói từ vựng ngữ cảnh cho ngôn ngữ này đang được biên soạn — bạn vẫn có thể tự tạo chủ đề và thêm từ ở trên nhé.</div>
      )}

      {modal === 'add' && (
        <AddVocabModal
          topics={myTopics.map((t) => t.name)}
          onClose={() => setModal(null)}
          onAdded={() => { reload(); showFlash('Đã thêm từ mới vào kho của bạn!') }}
        />
      )}
      {modal === 'topic' && (
        <CreateTopicModal
          onClose={() => setModal(null)}
          onCreated={(name, n) => { reload(); showFlash(n ? `Đã tạo "${name}" với ${n} từ!` : `Đã tạo chủ đề "${name}"!`) }}
        />
      )}
      {modal === 'import' && (
        <ImportVocabModal
          title="Import từ vựng"
          topics={myTopics.map((t) => t.name)}
          onClose={() => setModal(null)}
          onImported={(n) => { reload(); showFlash(`Đã import ${n} từ vào kho của bạn!`) }}
        />
      )}
      {openPack && (
        <ContextPackModal
          pack={openPack}
          lang={learnLang}
          onClose={() => setOpenPack(null)}
          onAdded={(n) => { reload(); showFlash(`Đã thêm ${n} từ "${openPack.name}" vào ôn tập — vào Ôn tập để học ngay!`) }}
        />
      )}
    </div>
  )
}
