export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatDate(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  return isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('vi')
}
