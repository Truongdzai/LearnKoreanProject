const PUNCT = /[.,!?;:"'`()[\]{}~…«»„“”‘’—–\-]/g

export function normWord(w: string): string {
  return (w || '').toLowerCase().replace(/’/g, "'").replace(PUNCT, '').trim()
}

export function splitWords(line: string, lang: string): string[] {
  const text = (line || '').trim()
  if (!text) return []
  if (lang === 'zh' || lang === 'ja') {
    const seg = (Intl as unknown as { Segmenter?: new (l: string, o: object) => { segment: (s: string) => Iterable<{ segment: string; isWordLike?: boolean }> } }).Segmenter
    if (seg) {
      const it = new seg(lang, { granularity: 'word' })
      return Array.from(it.segment(text)).filter((p) => p.isWordLike).map((p) => p.segment)
    }
    return Array.from(text.replace(/\s/g, ''))
  }
  return text.split(/\s+/).filter(Boolean)
}
