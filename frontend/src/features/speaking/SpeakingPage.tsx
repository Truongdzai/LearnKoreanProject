import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'
import { romanizeLine } from '@/core/utils/romanize'

interface Line { ko: string; vi: string }
interface Scenario {
  id: string
  title: string
  emoji: string
  opener: Line
  bot: Line[]
  suggestions: Line[][]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'greet', title: 'Chào hỏi & làm quen', emoji: '👋',
    opener: { ko: '안녕하세요! 만나서 반갑습니다. 이름이 뭐예요?', vi: 'Xin chào! Rất vui được gặp. Bạn tên gì?' },
    bot: [
      { ko: '와, 좋은 이름이네요! 어디에서 왔어요?', vi: 'Ồ, tên hay đấy! Bạn đến từ đâu?' },
      { ko: '베트남이군요! 한국어를 왜 배워요?', vi: 'Việt Nam à! Bạn học tiếng Hàn vì sao?' },
      { ko: '멋져요! 매일 조금씩 연습하면 금방 늘어요. 화이팅!', vi: 'Tuyệt vời! Mỗi ngày luyện một chút là tiến bộ nhanh thôi. Cố lên!' },
    ],
    suggestions: [
      [{ ko: '제 이름은 민수예요.', vi: 'Tên tôi là Minsu.' }, { ko: '저는 흐엉이에요.', vi: 'Tôi là Hương.' }],
      [{ ko: '베트남에서 왔어요.', vi: 'Tôi đến từ Việt Nam.' }],
      [{ ko: 'K-pop을 좋아해서 배워요.', vi: 'Tôi học vì thích K-pop.' }, { ko: '한국 여행을 가고 싶어요.', vi: 'Tôi muốn đi du lịch Hàn Quốc.' }],
    ],
  },
  {
    id: 'cafe', title: 'Gọi món ở quán cà phê', emoji: '☕',
    opener: { ko: '어서 오세요! 무엇을 드릴까요?', vi: 'Mời vào! Bạn muốn dùng gì ạ?' },
    bot: [
      { ko: '따뜻한 거요, 차가운 거요?', vi: 'Bạn muốn nóng hay lạnh ạ?' },
      { ko: '사이즈는 어떻게 하시겠어요?', vi: 'Bạn muốn cỡ nào ạ?' },
      { ko: '네, 잠시만 기다려 주세요. 감사합니다!', vi: 'Vâng, xin đợi một chút. Cảm ơn ạ!' },
    ],
    suggestions: [
      [{ ko: '아메리카노 한 잔 주세요.', vi: 'Cho tôi một ly americano.' }, { ko: '카페라떼 주세요.', vi: 'Cho tôi cà phê latte.' }],
      [{ ko: '차가운 걸로 주세요.', vi: 'Cho tôi loại lạnh.' }, { ko: '따뜻한 걸로요.', vi: 'Loại nóng ạ.' }],
      [{ ko: '큰 사이즈로 주세요.', vi: 'Cho tôi cỡ lớn.' }],
    ],
  },
  {
    id: 'direction', title: 'Hỏi đường', emoji: '🧭',
    opener: { ko: '저기요, 무엇을 찾으세요?', vi: 'Xin lỗi, bạn đang tìm gì vậy?' },
    bot: [
      { ko: '아, 지하철역이요? 이 길로 쭉 가세요.', vi: 'À, ga tàu điện ngầm à? Bạn cứ đi thẳng đường này.' },
      { ko: '걸어서 5분 정도 걸려요.', vi: 'Đi bộ khoảng 5 phút.' },
      { ko: '천만에요! 조심히 가세요.', vi: 'Không có gì! Đi cẩn thận nhé.' },
    ],
    suggestions: [
      [{ ko: '지하철역이 어디예요?', vi: 'Ga tàu điện ngầm ở đâu ạ?' }, { ko: '화장실이 어디예요?', vi: 'Nhà vệ sinh ở đâu ạ?' }],
      [{ ko: '얼마나 걸려요?', vi: 'Mất bao lâu ạ?' }],
      [{ ko: '감사합니다!', vi: 'Cảm ơn ạ!' }],
    ],
  },
]

interface Msg { who: 'bot' | 'me'; ko: string; vi: string }

export default function SpeakingPage() {
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [step, setStep] = useState(0)
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const speak = (text: string) => {
    try { const u = new SpeechSynthesisUtterance(text); u.lang = 'ko-KR'; speechSynthesis.speak(u) } catch { /* unsupported */ }
  }

  const start = (s: Scenario) => {
    setScenario(s); setStep(0); setMsgs([{ who: 'bot', ...s.opener }]); setInput('')
    setTimeout(() => speak(s.opener.ko), 250)
  }

  const send = (ko: string, vi = '') => {
    if (!scenario || !ko.trim()) return
    const next = [...msgs, { who: 'me' as const, ko, vi }]
    const reply = scenario.bot[step]
    if (reply) {
      next.push({ who: 'bot', ...reply })
      setStep(step + 1)
      setTimeout(() => speak(reply.ko), 400)
    } else {
      next.push({ who: 'bot', ko: '잘했어요! 정말 자연스러워요. 다시 연습할까요?', vi: 'Giỏi lắm! Rất tự nhiên. Mình luyện lại nhé?' })
    }
    setMsgs(next); setInput('')
  }

  const curSuggestions = scenario && step < scenario.suggestions.length ? scenario.suggestions[step] : []

  if (!scenario) {
    return (
      <div className="speaking">
        <h1 className="page-title"><Icon name="mic" /> Luyện giao tiếp với AI</h1>
        <p className="page-sub">Chọn một tình huống và trò chuyện bằng tiếng Hàn — AI trả lời, đọc to và gợi ý câu cho bạn.</p>
        <div className="scenario-grid">
          {SCENARIOS.map((s) => (
            <button key={s.id} className="scenario-card" onClick={() => start(s)}>
              <span className="scenario-emoji">{s.emoji}</span>
              <b>{s.title}</b>
              <span className="scenario-go">Bắt đầu <Icon name="arrow-right" size={14} /></span>
            </button>
          ))}
        </div>
        <div className="speaking-note">
          <Icon name="bulb" size={16} /> Đây là bản luyện tập theo kịch bản. Khi kết nối AI hội thoại đầy đủ, bạn có thể nói tự do và được chấm phát âm.
        </div>
      </div>
    )
  }

  return (
    <div className="speaking chat-mode">
      <div className="chat-head">
        <button className="btn-ghost sm" onClick={() => setScenario(null)}><Icon name="chevron-left" size={15} /> Đổi tình huống</button>
        <span className="chat-title">{scenario.emoji} {scenario.title}</span>
      </div>

      <div className="chat-box">
        {msgs.map((m, i) => (
          <div key={i} className={'chat-msg ' + m.who}>
            {m.who === 'bot' && <span className="chat-ava"><Icon name="vyling" size={18} /></span>}
            <div className="chat-bubble">
              <div className="chat-ko" lang="ko">
                {m.ko}
                {m.who === 'bot' && <button className="chat-speak" onClick={() => speak(m.ko)}><Icon name="volume" size={13} /></button>}
              </div>
              {m.who === 'bot' && <div className="chat-romaja">{romanizeLine(m.ko)}</div>}
              {m.vi && <div className="chat-vi">{m.vi}</div>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {curSuggestions.length > 0 && (
        <div className="chat-suggest">
          {curSuggestions.map((s, i) => (
            <button key={i} onClick={() => send(s.ko, s.vi)} title={s.vi}><span lang="ko">{s.ko}</span></button>
          ))}
        </div>
      )}

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input)}
          placeholder="Nhập câu trả lời tiếng Hàn…"
        />
        <button className="chat-send" onClick={() => send(input)}><Icon name="send" size={18} /></button>
      </div>
    </div>
  )
}
