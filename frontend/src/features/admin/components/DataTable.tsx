import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Icon from '@/core/components/Icon'

export type SortDir = 'asc' | 'desc'

export interface SortState {
  k: string
  dir: SortDir
}

export interface Col<T> {
  k: string
  label: string
  sortable?: boolean
  align?: 'right' | 'center'
  wide?: boolean
  head?: ReactNode
  render: (row: T) => ReactNode
  sortVal?: (row: T) => string | number
}

interface Props<T> {
  cols: Col<T>[]
  rows: T[]
  rowKey: (row: T) => string
  sort?: SortState
  onSort?: (k: string) => void
  rowClass?: (row: T) => string
  empty?: string
  maxHeight?: number
}

export function useSort<T>(rows: T[], cols: Col<T>[], initK = '', initDir: SortDir = 'desc') {
  const [sort, setSort] = useState<SortState>({ k: initK, dir: initDir })

  const toggle = (k: string) =>
    setSort((s) => (s.k === k ? { k, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { k, dir: 'asc' }))

  const sorted = useMemo(() => {
    const col = cols.find((c) => c.k === sort.k)
    if (!col?.sortVal) return rows
    const val = col.sortVal
    const out = rows.slice()
    out.sort((a, b) => {
      const x = val(a)
      const y = val(b)
      const c =
        typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x).localeCompare(String(y), 'vi', { numeric: true })
      return sort.dir === 'asc' ? c : -c
    })
    return out
  }, [rows, cols, sort])

  return { sort, toggle, sorted }
}

export function paginate<T>(rows: T[], page: number, size: number) {
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const cur = Math.min(Math.max(1, page), pageCount)
  return { pageCount, cur, slice: rows.slice((cur - 1) * size, cur * size) }
}

export default function DataTable<T>({
  cols, rows, rowKey, sort, onSort, rowClass, empty = 'Không có dữ liệu.', maxHeight = 460,
}: Props<T>) {
  return (
    <div className="adm-tablewrap" style={{ maxHeight }}>
      <table className="adm-table">
        <thead>
          <tr>
            {cols.map((c) => {
              const on = sort?.k === c.k
              const cls = [c.align === 'right' ? 'ta-r' : c.align === 'center' ? 'ta-c' : '', c.wide ? 'wide' : '']
                .filter(Boolean).join(' ')
              if (!c.sortable || !onSort) {
                return <th key={c.k} className={cls}>{c.head ?? c.label}</th>
              }
              return (
                <th key={c.k} className={cls + (on ? ' on' : '')} aria-sort={on ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button type="button" onClick={() => onSort(c.k)} title={`Sắp xếp theo ${c.label}`}>
                    {c.head ?? c.label}
                    <Icon name={on && sort!.dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={13} />
                  </button>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className={rowClass?.(r) || ''}>
              {cols.map((c) => (
                <td key={c.k} className={[c.align === 'right' ? 'ta-r' : c.align === 'center' ? 'ta-c' : '', c.wide ? 'wide' : ''].filter(Boolean).join(' ')}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr className="adm-tr-empty"><td colSpan={cols.length}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Pager({
  page, pageCount, total, unit, onPage,
}: { page: number; pageCount: number; total: number; unit: string; onPage: (p: number) => void }) {
  return (
    <div className="adm-pager">
      <span>{total.toLocaleString('vi')} {unit} · Trang {page}/{pageCount}</span>
      <div className="adm-pager-btns">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <Icon name="chevron-left" size={14} /> Trước
        </button>
        <button type="button" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
          Sau <Icon name="chevron-left" size={14} className="adm-flip" />
        </button>
      </div>
    </div>
  )
}
