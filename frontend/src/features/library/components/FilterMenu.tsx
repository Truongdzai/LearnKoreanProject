import { useEffect, useRef, useState } from 'react'
import Icon from '@/core/components/Icon'

export interface FilterOption {
  id: string
  label: string
  n?: number
}

export default function FilterMenu({
  label, options, value, onPick,
}: {
  label: string
  options: FilterOption[]
  value: string
  onPick: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (options.length < 2) return null

  const cur = options.find((o) => o.id === value) || options[0]
  const active = value !== options[0].id

  return (
    <div className={'lib-menu' + (active ? ' on' : '') + (open ? ' open' : '')} ref={ref}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-haspopup="listbox">
        <span className="lib-menu-lbl">{label}</span>
        <b>{cur.label}</b>
        <Icon name="chevron-down" size={13} />
      </button>
      {open && (
        <div className="lib-menu-pop" role="listbox" aria-label={label}>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="option"
              aria-selected={o.id === value}
              className={o.id === value ? 'on' : ''}
              onClick={() => { onPick(o.id); setOpen(false) }}
            >
              <span>{o.label}</span>
              {o.n != null && <em>{o.n}</em>}
              {o.id === value && <Icon name="check" size={13} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
