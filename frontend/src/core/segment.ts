const NO_SPACE = new Set(['zh', 'ja'])

const CJK_RE = /[぀-ヿ㐀-䶿一-鿿豈-﫿]/

export function isNoSpaceLang(lang?: string): boolean {
  return !!lang && NO_SPACE.has(lang)
}

export function hasCjk(text: string): boolean {
  return CJK_RE.test(text)
}

type SegmenterLike = { segment: (s: string) => Iterable<{ segment: string; isWordLike?: boolean }> }

const cache = new Map<string, SegmenterLike | null>()

function segmenterFor(lang: string): SegmenterLike | null {
  if (cache.has(lang)) return cache.get(lang) ?? null
  let seg: SegmenterLike | null = null
  try {
    const ctor = (Intl as unknown as { Segmenter?: new (l: string, o: object) => SegmenterLike }).Segmenter
    if (ctor) seg = new ctor(lang, { granularity: 'word' })
  } catch {
    seg = null
  }
  cache.set(lang, seg)
  return seg
}

export interface Token {
  text: string
  word: boolean
}

export function tokenize(text: string, lang?: string): Token[] {
  if (!text) return []

  if (isNoSpaceLang(lang) || (!lang && hasCjk(text))) {
    const seg = segmenterFor(lang || (/[぀-ヿ]/.test(text) ? 'ja' : 'zh'))
    if (seg) {
      return [...seg.segment(text)].map((s) => ({ text: s.segment, word: !!s.isWordLike }))
    }
    return [...text].map((ch) => ({ text: ch, word: CJK_RE.test(ch) }))
  }

  return text.split(/(\s+)/).filter(Boolean).map((t) => ({ text: t, word: !!t.trim() }))
}

export function words(text: string, lang?: string): string[] {
  return tokenize(text, lang).filter((t) => t.word).map((t) => t.text)
}
