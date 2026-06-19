import { useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'

interface Slang {
  term: string
  read: string
  meaning: string
  example: string
  exampleVi: string
  trend: number
  platform: 'YouTube' | 'TikTok' | 'Instagram'
}

const SLANG: Slang[] = [
  { term: '갓생', read: 'gat-saeng', meaning: 'cuộc sống "đỉnh", sống kỷ luật và năng suất', example: '나 요즘 갓생 살아.', exampleVi: 'Dạo này tớ sống rất kỷ luật.', trend: 98, platform: 'TikTok' },
  { term: '꿀잼', read: 'kkul-jaem', meaning: 'cực kỳ thú vị, vui "mê" (ngọt như mật)', example: '이 영화 진짜 꿀잼이야!', exampleVi: 'Phim này vui cực kỳ luôn!', trend: 95, platform: 'YouTube' },
  { term: '핵인싸', read: 'haek-in-ssa', meaning: 'người cực kỳ hoà đồng, "trùm" giao tiếp', example: '걔는 핵인싸야.', exampleVi: 'Nó là trùm hoà đồng luôn.', trend: 90, platform: 'Instagram' },
  { term: '존맛탱', read: 'jon-mat-taeng', meaning: 'ngon "bá cháy" (JMT)', example: '이거 존맛탱!', exampleVi: 'Món này ngon bá cháy!', trend: 88, platform: 'TikTok' },
  { term: '머쓱', read: 'meo-sseuk', meaning: 'ngượng ngùng, quê quê một chút', example: '괜히 머쓱하네.', exampleVi: 'Tự nhiên thấy hơi quê.', trend: 82, platform: 'YouTube' },
  { term: '맞팔', read: 'mat-pal', meaning: 'follow lại nhau (mutual follow)', example: '우리 맞팔해요!', exampleVi: 'Mình follow lại nhau nhé!', trend: 80, platform: 'Instagram' },
  { term: '낄낄', read: 'kkil-kkil', meaning: 'cười khúc khích (hihi/haha)', example: '그 짤 보고 낄낄거렸어.', exampleVi: 'Xem cái ảnh đó mà cười khúc khích.', trend: 76, platform: 'TikTok' },
  { term: '쩐다', read: 'jjeon-da', meaning: 'đỉnh quá, "cháy" quá', example: '와, 진짜 쩐다!', exampleVi: 'Oa, đỉnh thật sự!', trend: 73, platform: 'YouTube' },
]

const FILTERS = ['Tất cả', 'YouTube', 'TikTok', 'Instagram'] as const

export default function LingoRadarPage() {
  const { openLookup } = useAppStore()
  const [f, setF] = useState<(typeof FILTERS)[number]>('Tất cả')
  const list = SLANG.filter((s) => f === 'Tất cả' || s.platform === f)

  const speak = (t: string) => { try { const u = new SpeechSynthesisUtterance(t); u.lang = 'ko-KR'; speechSynthesis.speak(u) } catch { /* */ } }

  return (
    <div className="lingo">
      <div className="lingo-head">
        <div className="lingo-radar-ic"><Icon name="trending" size={24} /></div>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Hot Lingo — Trạm quét từ lóng</h1>
          <p className="page-sub" style={{ margin: '4px 0 0' }}>Những từ lóng & cụm "bắt trend" người Hàn đang dùng tuần này trên mạng xã hội.</p>
        </div>
      </div>

      <div className="chips" style={{ marginBottom: 18 }}>
        {FILTERS.map((x) => (
          <button key={x} className={'chip' + (f === x ? ' on' : '')} onClick={() => setF(x)}>{x}</button>
        ))}
      </div>

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
            <div className="lingo-ex">
              <span lang="ko">{s.example}</span>
              <em>{s.exampleVi}</em>
            </div>
            <button className="lingo-lookup" onClick={() => openLookup(s.term)}><Icon name="search" size={13} /> Tra cứu chi tiết</button>
          </div>
        ))}
      </div>

      <div className="garden-tip" style={{ marginTop: 22 }}>
        <Icon name="bulb" size={16} /> Từ lóng giúp bạn nói chuyện tự nhiên như người bản xứ — nhưng nhớ dùng đúng ngữ cảnh thân mật nhé!
      </div>
    </div>
  )
}
