import { useMemo, useState } from 'react'
import Icon from '@/core/components/Icon'
import { DIMS, PACKS, packById, type ActiveChunk, type Dim } from '@/data/englishActive'
import { useMastery } from './mastery'
import Drill from './Drill'

type Source = 'due' | 'pack' | 'weak'

const SIZES = [5, 10, 20]

export default function Gym() {
  const { state, dueList, queueFor, recOf, stats } = useMastery()
  const [source, setSource] = useState<Source>(() => (stats.due > 0 ? 'due' : 'pack'))
  const [packId, setPackId] = useState(state.goal)
  const [dim, setDim] = useState<Dim | 'auto'>('auto')
  const [size, setSize] = useState(10)
  const [run, setRun] = useState(0)

  const queue: ActiveChunk[] = useMemo(() => {
    if (source === 'pack') return queueFor(packId, size)
    if (source === 'due') return dueList().slice(0, size)
    const pool = (packById(packId)?.chunks ?? [])
      .filter((c) => recOf(c.id).seen > 0)
      .sort((a, b) => recOf(a.id).lv - recOf(b.id).lv)
    return pool.slice(0, size)
  }, [source, packId, size, run, dueList, queueFor, recOf])

  const pack = packById(packId) ?? PACKS[0]

  return (
    <div className="ac-gym">
      <div className="ac-lib-intro">
        <Icon name="clock" size={16} />
        <div>
          <b>Đích ở đây không phải nhớ nhiều hơn mà là nhớ ra nhanh hơn</b>
          <span>
            Mỗi câu đều bấm giờ. Dưới 2,5 giây là đã bật ra được; trên 5 giây nghĩa là cụm đó
            vẫn đang nằm ở vòng ngoài, gặp người thật sẽ không kịp dùng.
            Tốc độ trung bình hiện tại của bạn: <b>{stats.medianMs ? (stats.medianMs / 1000).toFixed(1) + 's' : 'chưa đo'}</b>.
          </span>
        </div>
      </div>

      <div className="ac-gymcfg">
        <div className="ac-cfg">
          <label>Lấy cụm từ</label>
          <div className="ac-chips">
            <button className={'ac-chip' + (source === 'due' ? ' on' : '')} onClick={() => setSource('due')}>
              Tới hạn ôn <em>{stats.due}</em>
            </button>
            <button className={'ac-chip' + (source === 'pack' ? ' on' : '')} onClick={() => setSource('pack')}>
              Theo gói
            </button>
            <button className={'ac-chip' + (source === 'weak' ? ' on' : '')} onClick={() => setSource('weak')}>
              Yếu nhất
            </button>
          </div>
        </div>

        {source !== 'due' && (
          <div className="ac-cfg">
            <label>Gói</label>
            <select value={packId} onChange={(e) => setPackId(e.target.value)}>
              {PACKS.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.cefr}</option>)}
            </select>
          </div>
        )}

        <div className="ac-cfg">
          <label>Chiều kiểm tra</label>
          <div className="ac-chips">
            <button className={'ac-chip' + (dim === 'auto' ? ' on' : '')} onClick={() => setDim('auto')}>
              Tự chọn chiều yếu
            </button>
            {DIMS.map((d) => (
              <button key={d.id} className={'ac-chip' + (dim === d.id ? ' on' : '')} onClick={() => setDim(d.id)}>
                <Icon name={d.icon} size={12} /> {d.name}
              </button>
            ))}
          </div>
        </div>

        <div className="ac-cfg">
          <label>Số câu</label>
          <div className="ac-chips">
            {SIZES.map((n) => (
              <button key={n} className={'ac-chip' + (size === n ? ' on' : '')} onClick={() => setSize(n)}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <Drill
        key={`gym-${source}-${packId}-${dim}-${size}-${run}`}
        queue={queue}
        forceDim={dim === 'auto' ? undefined : dim}
        heading={source === 'due' ? 'Ôn tới hạn' : source === 'weak' ? `Yếu nhất · ${pack.name}` : `Gói ${pack.name}`}
        onFinish={() => setRun((r) => r + 1)}
      />
    </div>
  )
}
