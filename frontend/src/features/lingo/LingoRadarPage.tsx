import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import Spinner from '@/core/components/Spinner'
import { useAppStore } from '@/store/app.store'
import { fetchLingo, type Slang } from '@/core/api/lingo.api'

const FALLBACK: Slang[] = [
  { term: '갓생', read: 'gat-saeng', meaning: 'cuộc sống "đỉnh", sống kỷ luật và năng suất', example: '나 요즘 갓생 살아.', exampleVi: 'Dạo này tớ sống rất kỷ luật.', trend: 98, platform: 'TikTok' },
  { term: '꿀잼', read: 'kkul-jaem', meaning: 'cực kỳ thú vị, vui "mê" (ngọt như mật)', example: '이 영화 진짜 꿀잼이야!', exampleVi: 'Phim này vui cực kỳ luôn!', trend: 95, platform: 'YouTube' },
  { term: '핵인싸', read: 'haek-in-ssa', meaning: 'người cực kỳ hoà đồng, "trùm" giao tiếp', example: '걔는 핵인싸야.', exampleVi: 'Nó là trùm hoà đồng luôn.', trend: 90, platform: 'Instagram' },
  { term: '존맛탱', read: 'jon-mat-taeng', meaning: 'ngon "bá cháy" (JMT)', example: '이거 존맛탱!', exampleVi: 'Món này ngon bá cháy!', trend: 88, platform: 'TikTok' },
]

const FILTERS = ['Tất cả', 'YouTube', 'TikTok', 'Instagram'] as const

export default function LingoRadarPage() {
  const { openLookup } = useAppStore()
  const [f, setF] = useState<(typeof FILTERS)[number]>('Tất cả')
  const [items, setItems] = useState<Slang[]>([])
  const [source, setSource] = useState<'ai' | 'curated'>('curated')
  const [loading, setLoading] = useState(true)

  const load = (refresh = false) => {
    setLoading(true)
    fetchLingo(refresh)
      .then((r) => { setItems(r.items); setSource(r.source) })
      .catch(() => { setItems(FALLBACK); setSource('curated') })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(false) }, [])

  const list = items.filter((s) => f === 'Tất cả' || s.platform === f)
  const speak = (t: string) => { try { const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; speechSynthesis.speak(u) } catch { /* */ } }

  return (
    <div className="lingo">
      <div className="lingo-head">
        <div className="lingo-radar-ic"><Icon name="trending" size={24} /></div>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>Hot Lingo — Trạm quét từ lóng</h1>
          <p className="page-sub" style={{ margin: '4px 0 0' }}>Những từ lóng & cụm "bắt trend" người Hàn đang dùng trên mạng xã hội.</p>
        </div>
        <button className="btn-ghost lingo-refresh" onClick={() => load(true)} disabled={loading}>
          <Icon name="sparkles" size={15} /> Làm mới
        </button>
      </div>

      <div className="lingo-bar">
        <div className="chips">
          {FILTERS.map((x) => (
            <button key={x} className={'chip' + (f === x ? ' on' : '')} onClick={() => setF(x)}>{x}</button>
          ))}
        </div>
        <span className={'lingo-src ' + source}>{source === 'ai' ? 'Cập nhật bằng AI' : 'Danh sách tuyển chọn'}</span>
      </div>

      {loading ? (
        <div className="center-state"><div><Spinner /><p>Đang quét từ lóng đang hot…</p></div></div>
      ) : (
        <div className="lingo-grid">
          {list.map((s) => (
            <div key={s.term} className="lingo-card">
              <div className="lingo-top">
                <span className={'lingo-plat ' + s.platform.toLowerCase()}>{s.platform}</span>
                <span className="lingo-trend"><Icon name="flame" size={12} /> {s.trend}%</span>
              </div>
              <div className="lingo-term">
                <b lang="ko">{s.term}</b>
                <button className="lr-speak sm" onClick={() => speak(s.term)}><Icon name="volume" size={13} /></button>
                <span className="lingo-read">{s.read}</span>
              </div>
              <div className="lingo-mean">{s.meaning}</div>
              {s.example && (
                <div className="lingo-ex">
                  <span lang="ko">{s.example}</span>
                  <em>{s.exampleVi}</em>
                </div>
              )}
              <button className="lingo-lookup" onClick={() => openLookup(s.term)}><Icon name="search" size={13} /> Tra cứu chi tiết</button>
            </div>
          ))}
        </div>
      )}

      <div className="garden-tip" style={{ marginTop: 22 }}>
        <Icon name="bulb" size={16} /> Từ lóng giúp bạn nói chuyện tự nhiên như người bản xứ — nhưng nhớ dùng đúng ngữ cảnh thân mật nhé!
      </div>
    </div>
  )
}
