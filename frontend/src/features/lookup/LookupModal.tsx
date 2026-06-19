import { useEffect, useState } from 'react'
import Icon from '@/core/components/Icon'
import { useAppStore } from '@/store/app.store'

interface Entry {
  term: string
  hanja?: string
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
}

const DICT: Record<string, Entry> = {
  틈: {
    term: '틈', phon: '/tɯm/', pos: 'Danh từ', level: 'Trung cấp',
    meaning: 'khe hở, khoảng trống, thời gian rảnh',
    explain: 'Từ này dùng để chỉ một khoảng trống giữa hai vật thể, hoặc ám chỉ thời gian rảnh rỗi hiếm hoi giữa các công việc bận rộn.',
    usage: 'Dùng trong cả ngữ cảnh vật lý (khe hở) và trừu tượng (thời gian, cơ hội). Phổ biến trong đời sống hằng ngày.',
    examples: [{ ko: '잠깐 틈을 내서 전화했어요.', vi: 'Tôi tranh thủ chút thời gian để gọi điện.' }, { ko: '문 틈으로 바람이 들어와요.', vi: 'Gió lùa vào qua khe cửa.' }],
    phrases: ['틈을 내다 — tranh thủ thời gian', '틈이 나다 — có thời gian rảnh', '틈새시장 — thị trường ngách'],
    mistakes: 'Đừng nhầm 틈 (khe hở/thời gian rảnh) với 시간 (thời gian nói chung).',
    synonyms: ['겨를 (gần nghĩa)', '간격 (khoảng cách)', '여유 (sự thong thả)'],
  },
  안녕하세요: {
    term: '안녕하세요', phon: '/annjʌŋhasejo/', pos: 'Thán từ / Câu chào', level: 'Sơ cấp (TOPIK 1)',
    meaning: 'xin chào (lịch sự)',
    explain: 'Lời chào lịch sự phổ biến nhất, dùng được mọi lúc trong ngày với người lạ hoặc người lớn tuổi.',
    usage: 'Dạng trang trọng. Với bạn bè thân có thể nói 안녕. Khi gọi điện thường nói 여보세요.',
    examples: [{ ko: '안녕하세요, 만나서 반갑습니다.', vi: 'Xin chào, rất vui được gặp bạn.' }],
    phrases: ['안녕히 가세요 — tạm biệt (người ở lại nói)', '안녕히 계세요 — tạm biệt (người đi nói)'],
    mistakes: 'Không dùng 안녕하세요 khi nghe điện thoại — hãy dùng 여보세요.',
    synonyms: ['안녕 (thân mật)', '반갑습니다 (rất vui được gặp)'],
  },
}

function generic(term: string): Entry {
  return {
    term, phon: '/…/', pos: 'Đang phân tích', level: 'Tự động',
    meaning: `Nghĩa của “${term}” (kết quả AI mẫu).`,
    explain: 'Đây là kết quả minh hoạ. Khi kết nối AI thật, phần này sẽ giải thích chi tiết nghĩa, sắc thái và ngữ cảnh của từ.',
    usage: 'AI sẽ gợi ý cách dùng phù hợp theo từng tình huống giao tiếp.',
    examples: [{ ko: `${term} 예문이 여기에 표시됩니다.`, vi: 'Câu ví dụ sẽ hiển thị ở đây.' }],
    phrases: ['Cụm từ thường gặp sẽ hiển thị ở đây.'],
    mistakes: 'Các lỗi thường gặp khi dùng từ này sẽ được liệt kê.',
    synonyms: ['(từ đồng nghĩa)', '(từ trái nghĩa)'],
  }
}

const LANGS = [
  { code: 'vi', label: 'Việt' },
  { code: 'en', label: 'English' },
  { code: 'ko', label: '한국어' },
]

export default function LookupModal() {
  const { lookupOpen, closeLookup, lookupSeed } = useAppStore()
  const [q, setQ] = useState('')
  const [lang, setLang] = useState('vi')
  const [entry, setEntry] = useState<Entry | null>(null)

  useEffect(() => {
    if (lookupOpen) {
      setQ(lookupSeed)
      setEntry(lookupSeed ? DICT[lookupSeed.trim()] || generic(lookupSeed.trim()) : null)
    }
  }, [lookupOpen, lookupSeed])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLookup()
    if (lookupOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lookupOpen, closeLookup])

  if (!lookupOpen) return null

  const search = () => {
    const t = q.trim()
    if (!t) return
    setEntry(DICT[t] || generic(t))
  }

  const speak = (text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'ko-KR'
      speechSynthesis.speak(u)
    } catch {
      /* not supported */
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
            onKeyDown={(e) => e.key === 'Enter' && search()}
            placeholder="Nhập từ tiếng Hàn cần tra…"
          />
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="lookup-lang">
            {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <button className="lookup-go" onClick={search}><Icon name="sparkles" size={15} /> Tra cứu</button>
        </div>

        {!entry ? (
          <div className="lookup-empty">
            <Icon name="vyling" size={40} />
            <p>Nhập một từ tiếng Hàn rồi nhấn <b>Tra cứu</b>. VyLing sẽ phân tích nghĩa, phiên âm, từ loại, cấp độ TOPIK, cách dùng, ví dụ và lỗi thường gặp.</p>
            <div className="lookup-suggest">
              {Object.keys(DICT).map((k) => (
                <button key={k} onClick={() => { setQ(k); setEntry(DICT[k]) }}>{k}</button>
              ))}
            </div>
          </div>
        ) : (
          <div className="lookup-result">
            <div className="lr-term">
              <span className="lr-word" lang="ko">{entry.term}</span>
              {entry.hanja && <span className="lr-hanja">{entry.hanja}</span>}
              <span className="lr-phon">{entry.phon}</span>
              <button className="lr-speak" onClick={() => speak(entry.term)} title="Phát âm"><Icon name="volume" size={16} /></button>
            </div>

            <div className="lr-tags">
              <span className="lr-tag pos"><small>Từ loại</small>{entry.pos}</span>
              <span className="lr-tag lvl"><small>Level</small>{entry.level}</span>
            </div>

            <div className="lr-block accent"><div className="lr-label">Nghĩa</div><b lang={lang === 'ko' ? 'ko' : 'vi'}>{entry.meaning}</b></div>
            <div className="lr-block"><div className="lr-label"><Icon name="bulb" size={13} /> Giải thích</div><p>{entry.explain}</p></div>
            <div className="lr-block"><div className="lr-label"><Icon name="note" size={13} /> Cách sử dụng</div><p>{entry.usage}</p></div>

            <div className="lr-block"><div className="lr-label"><Icon name="film" size={13} /> Ví dụ</div>
              {entry.examples.map((ex, i) => (
                <div key={i} className="lr-ex">
                  <span lang="ko">{ex.ko}</span>
                  <button className="lr-speak sm" onClick={() => speak(ex.ko)}><Icon name="volume" size={13} /></button>
                  <em>{ex.vi}</em>
                </div>
              ))}
            </div>

            <div className="lr-block"><div className="lr-label"><Icon name="sparkles" size={13} /> Cụm từ thường gặp</div>
              <ul className="lr-list">{entry.phrases.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>

            <div className="lr-block warn"><div className="lr-label"><Icon name="x-circle" size={13} /> Lỗi thường gặp</div><p>{entry.mistakes}</p></div>

            <div className="lr-block"><div className="lr-label"><Icon name="copy" size={13} /> Đồng nghĩa / khác nghĩa</div>
              <div className="lr-syn">{entry.synonyms.map((s, i) => <span key={i}>{s}</span>)}</div>
            </div>

            <button className="lr-save"><Icon name="plus" size={15} /> Lưu vào flashcard của tôi</button>
          </div>
        )}
      </div>
    </div>
  )
}
