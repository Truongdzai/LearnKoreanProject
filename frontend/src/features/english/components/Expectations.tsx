import { useState } from 'react'
import Icon from '@/core/components/Icon'

export interface ExpectationSpec {
  hours: string
  daily: string
  words: number
  can: string[]
  cannot: string[]
  next: string
}

export default function Expectations({ spec, lang }: { spec: ExpectationSpec; lang: 'ko' | 'en' }) {
  const [open, setOpen] = useState(false)
  const name = lang === 'ko' ? 'tiếng Hàn' : 'tiếng Anh'

  return (
    <div className={'expect' + (open ? ' open' : '')}>
      <button className="expect-head" onClick={() => setOpen((v) => !v)}>
        <span className="expect-ic"><Icon name="target" size={17} /></span>
        <span className="expect-title">
          <b>Sau 90 ngày bạn sẽ ở đâu?</b>
          <span>
            {spec.daily} · tổng {spec.hours} · {spec.words.toLocaleString('vi-VN')} từ lõi —
            đủ để giao tiếp sinh tồn, <b>chưa phải là giỏi {name}</b>. Bấm để xem cụ thể.
          </span>
        </span>
        <Icon name={open ? 'chevron-down' : 'chevron-left'} size={16} />
      </button>

      {open && (
        <div className="expect-body">
          <div className="expect-col can">
            <b><Icon name="check" size={14} /> Làm được</b>
            <ul>{spec.can.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div className="expect-col cannot">
            <b><Icon name="x" size={14} /> Chưa làm được</b>
            <ul>{spec.cannot.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <p className="expect-next"><Icon name="rocket" size={14} /> {spec.next}</p>
        </div>
      )}
    </div>
  )
}
