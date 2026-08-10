const clean = (s: string) => s.replace(/[.,!?;:"'`()~…\-]/g, '').replace(/\s+/g, ' ').trim()

export function jamoTokens(text: string): string[] {
  return toJamo(text)
}

function toJamo(text: string): string[] {
  const out: string[] = []
  for (const ch of clean(text).replace(/\s/g, '')) {
    const code = ch.charCodeAt(0) - 0xac00
    if (code >= 0 && code < 11172) {
      out.push('L' + Math.floor(code / 588))
      out.push('V' + Math.floor((code % 588) / 28))
      const tail = code % 28
      if (tail) out.push('T' + tail)
    } else {
      out.push(ch.toLowerCase())
    }
  }
  return out
}

export function scoreBand(n: number): { labelKey: string; tone: 'good' | 'mid' | 'low' } {
  if (n >= 85) return { labelKey: 'band.excellent', tone: 'good' }
  if (n >= 65) return { labelKey: 'band.great', tone: 'good' }
  if (n >= 40) return { labelKey: 'band.ok', tone: 'mid' }
  return { labelKey: 'band.more', tone: 'low' }
}
