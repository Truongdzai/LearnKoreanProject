const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/[\s.,!?…'"“”‘’。，、！？~～-]/g, '')

// Cụm khoá có chỗ trống "~" (vd "저는 ~년 동안 일했습니다"): coi là đã dùng khi mọi đoạn cố định xuất hiện theo đúng thứ tự.
export function phraseUsed(phrase: string, said: string): boolean {
  const parts = phrase.split(/[~～]/).map(norm).filter((p) => p.length >= 2)
  if (!parts.length) return false
  const text = norm(said)
  let from = 0
  for (const p of parts) {
    const at = text.indexOf(p, from)
    if (at < 0) return false
    from = at + p.length
  }
  return true
}
