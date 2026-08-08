import type { CSSProperties } from 'react'

export default function Marquee({ items, speed, reverse }: { items: string[]; speed: number; reverse?: boolean }) {
  const style = { '--mq-dur': `${speed}s` } as CSSProperties
  return (
    <div className={'lp-mq-row' + (reverse ? ' rev' : '')} aria-hidden="true">
      <div className="lp-mq-track" style={style}>
        {[0, 1].map((copy) => (
          <div className="lp-mq-set" key={copy}>
            {items.map((x) => (
              <span className="lp-mq-item" key={x}>{x}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
