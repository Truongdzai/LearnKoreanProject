import { isNoSpaceLang, words } from '@/core/segment'
import { isNoiseLine, speakableSegments } from '@/features/learn/segments'
import type { Lesson } from '@/models/lesson.model'

const EN_STOP = new Set([
  'a', 'about', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'back', 'be', 'because', 'been', 'before', 'being', 'but', 'by', 'came', 'can', 'come', 'could',
  'did', 'do', 'does', 'doing', 'done', 'down', 'each', 'even', 'for', 'from', 'get', 'getting',
  'go', 'going', 'gonna', 'good', 'got', 'gotta', 'had', 'has', 'have', 'having', 'he', 'her',
  'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'know',
  'let', 'like', 'll', 'look', 'looking', 'make', 'many', 'may', 'me', 'mean', 'might', 'mine',
  'more', 'most', 'much', 'must', 'my', 'need', 'no', 'not', 'now', 'of', 'off', 'oh', 'ok',
  'okay', 'on', 'one', 'only', 'or', 'other', 'our', 'out', 'over', 'own', 're', 'really',
  'right', 'said', 'say', 'see', 'she', 'should', 'so', 'some', 'something', 'still', 'such',
  'sure', 'take', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
  'thing', 'things', 'think', 'this', 'those', 'though', 'through', 'time', 'to', 'too', 'up',
  'us', 'use', 've', 'very', 'want', 'was', 'way', 'we', 'well', 'were', 'what', 'when', 'where',
  'which', 'while', 'who', 'why', 'will', 'with', 'would', 'yeah', 'yes', 'yet', 'you', 'your',
  'yours', 'aren', 'didn', 'doesn', 'don', 'isn', 'wasn', 'won',
  'arent', 'cant', 'couldnt', 'didnt', 'doesnt', 'dont', 'hadnt', 'hasnt', 'havent', 'hes',
  'id', 'ill', 'im', 'isnt', 'ive', 'lets', 'shes', 'shouldnt', 'thats', 'theres', 'theyll',
  'theyre', 'theyve', 'wasnt', 'weve', 'werent', 'whats', 'wheres', 'whos', 'wont', 'wouldnt',
  'youd', 'youll', 'youre', 'youve', 'wanna',
])

function contentWords(text: string, lang: string): string[] {
  const stop = stopFor(lang)
  const minLen = isNoSpaceLang(lang) ? 2 : 3
  return words(text, lang)
    .map((w) => bare(w, lang))
    .filter((w) => w.length >= minLen && !/\d/.test(w) && !stop.has(w))
}

const KO_STOP = new Set(['저는', '오늘', '정말', '또', '그리고', '하지만', '그런데', '이것', '그것', '저것'])

const CJK_STOP = new Set(['的', '了', '是', '在', '和', '就', '也', '很', '不', '我', '你', '他',
  'です', 'ます', 'した', 'する', 'して', 'こと', 'これ', 'それ', 'ある', 'いる', 'よう'])

function stopFor(lang: string): Set<string> {
  if (isNoSpaceLang(lang)) return CJK_STOP
  if (lang === 'ko') return KO_STOP
  return EN_STOP
}

function bare(w: string, lang: string): string {
  let out = w.toLowerCase().replace(/[.,!?;:"'`()[\]{}~…«»„“”‘’—–]/g, '').trim()
  if (lang === 'ko') out = out.replace(/(을|를|이|가|은|는|에서|에게|에|와|과|도)$/u, '')
  return out
}

export interface NotableWord {
  word: string
  count: number
}

export function notableWords(lesson: Lesson, lang: string, max = 10): NotableWord[] {
  const stop = stopFor(lang)
  const minLen = isNoSpaceLang(lang) ? 2 : 3
  const tally = new Map<string, number>()

  for (const seg of lesson.segments) {
    if (isNoiseLine(seg.ko)) continue
    for (const raw of words(seg.ko, lang)) {
      const w = bare(raw, lang)
      if (w.length < minLen) continue
      if (/\d/.test(w)) continue
      if (stop.has(w)) continue
      tally.set(w, (tally.get(w) ?? 0) + 1)
    }
  }

  return [...tally.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || b.word.length - a.word.length || a.word.localeCompare(b.word))
    .slice(0, max)
}

export function uniqueWordCount(lesson: Lesson, lang: string): number {
  const seen = new Set<string>()
  for (const seg of lesson.segments) {
    if (isNoiseLine(seg.ko)) continue
    for (const raw of words(seg.ko, lang)) {
      const w = bare(raw, lang)
      if (w) seen.add(w)
    }
  }
  return seen.size
}

export interface UsefulPhrase {
  text: string
  vi: string
  count: number
}

export function usefulPhrases(lesson: Lesson, lang: string, max = 5): UsefulPhrase[] {
  const minWords = isNoSpaceLang(lang) ? 2 : 3
  const maxWords = isNoSpaceLang(lang) ? 14 : 9
  const byKey = new Map<string, UsefulPhrase>()

  for (const seg of lesson.segments) {
    if (isNoiseLine(seg.ko)) continue
    const line = seg.ko.trim()
    if (/^[-–—•>]/.test(line)) continue
    const n = words(line, lang).length
    if (n < minWords || n > maxWords) continue
    if (contentWords(line, lang).length < 1) continue
    const key = bare(line, lang).replace(/\s+/g, ' ')
    if (!key) continue
    const hit = byKey.get(key)
    if (hit) {
      hit.count += 1
      if (!hit.vi && seg.vi) hit.vi = seg.vi
      continue
    }
    byKey.set(key, { text: line, vi: (seg.vi || '').trim(), count: 1 })
  }

  return [...byKey.values()]
    .sort((a, b) => b.count - a.count || words(a.text, lang).length - words(b.text, lang).length)
    .slice(0, max)
}

export interface LessonFacts {
  totalLines: number
  spokenLines: number
  noiseLines: number
  uniqueWords: number
  totalWords: number
  seconds: number
  wpm: number
}

export function lessonFacts(lesson: Lesson, lang: string): LessonFacts {
  const spoken = speakableSegments(lesson.segments)
  const totalLines = lesson.segments.length
  let totalWords = 0
  let seconds = 0
  for (const s of spoken) {
    totalWords += words(s.ko, lang).length
    seconds += Math.max(0, s.end - s.start)
  }
  const wpm = seconds > 0 ? Math.round((totalWords / seconds) * 60) : 0
  return {
    totalLines,
    spokenLines: spoken.length,
    noiseLines: totalLines - spoken.length,
    uniqueWords: uniqueWordCount(lesson, lang),
    totalWords,
    seconds: Math.round(seconds),
    wpm,
  }
}

export function clockLabel(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}
