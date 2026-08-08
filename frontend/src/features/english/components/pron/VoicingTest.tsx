import Icon from '@/core/components/Icon'
import type { PronGroup } from '@/data/englishPronunciation'
import { VOICING_STEPS } from '@/data/pronMethod'
import { CTX, MicButton, ResultLine, useReader } from './reader'

export default function VoicingTest({ group }: { group: PronGroup }) {
  const reader = useReader()
  const list = group.voicing ?? []

  return (
    <div className="vt">
      <div className="vt-intro">
        <b><Icon name="target" size={15} /> Đặt hai ngón tay lên cổ họng</b>
        <p>
          Mỗi cặp dưới đây chỉ khác nhau ở chỗ dây thanh có rung hay không — vị trí lưỡi và cách thoát hơi phải giữ y
          nguyên. Nếu lưỡi đổi chỗ hoặc miệng mở thêm, nhiều thứ đã đổi cùng lúc nên bạn không còn biết âm sai vì đâu.
        </p>
        <ol className="vt-steps">
          {VOICING_STEPS.map((s, k) => <li key={k}>{s}</li>)}
        </ol>
      </div>

      <div className="vt-grid">
        {list.map((v, i) => (
          <div key={i} className="vt-card">
            <div className="vt-pair">
              <span className="vt-badge off">{v.off} không rung</span>
              <Icon name="arrow-right" size={14} />
              <span className="vt-badge on">{v.on} có rung</span>
            </div>
            <div className="vt-side">
              <div className="pron-item-top">
                <b lang={CTX.lang}>{v.offWord}</b>
                <span className="pron-ipa">{v.offIpa}</span>
                <button className="pron-play" onClick={() => CTX.speak(v.offWord, 0.75)} title="Nghe mẫu">
                  <Icon name="volume" size={14} />
                </button>
                <MicButton id={`vo${i}`} target={v.offWord} reader={reader} />
              </div>
              <small>{v.offVi}</small>
              <ResultLine id={`vo${i}`} reader={reader} />
            </div>
            <div className="vt-side on">
              <div className="pron-item-top">
                <b lang={CTX.lang}>{v.onWord}</b>
                <span className="pron-ipa">{v.onIpa}</span>
                <button className="pron-play" onClick={() => CTX.speak(v.onWord, 0.75)} title="Nghe mẫu">
                  <Icon name="volume" size={14} />
                </button>
                <MicButton id={`vn${i}`} target={v.onWord} reader={reader} />
              </div>
              <small>{v.onVi}</small>
              <ResultLine id={`vn${i}`} reader={reader} />
            </div>
          </div>
        ))}
      </div>

      <p className="stb-note">
        Trong lời nói tự nhiên, âm hữu thanh ở cuối từ có thể không rung mạnh suốt cả thời lượng, nhưng nguyên âm đứng
        trước nó thường dài hơn. Vì vậy khi phân biệt hãy nghe cả phần nguyên âm lẫn phụ âm cuối.
      </p>
    </div>
  )
}
