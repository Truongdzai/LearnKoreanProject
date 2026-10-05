import { compose, decompose } from '@/core/utils/hangul'
import { romanizeWord } from '@/core/utils/romanize'
import { KO_ALL_WORDS } from '@/data/koreanCore'
import {
  CONFUSABLE, CONSONANTS, HANGUL_LESSONS, TAIL_SOUNDS, VOWELS, tailSoundOf,
} from '@/data/koreanHangul'

export type QKind = 'see' | 'hear' | 'write' | 'tail' | 'tailHear' | 'word' | 'wordHear'

export interface HQuestion {
  id: string
  kind: QKind
  ask: string
  prompt: string
  audio?: string
  options: string[]
  answer: string
  item: string
  hangulOptions: boolean
  explain: string
}

const BASIC_VOWELS = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ']
const IS_CONS = new Set(CONSONANTS.map((c) => c.j))
const IS_VOWEL = new Set(VOWELS.map((v) => v.j))

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[k]] = [a[k], a[i]]
  }
  return a
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Chữ đã học tính tới hết bài `upto` (dùng làm đáp án nhiễu để không đố chữ chưa gặp).
export function knownJamo(upto: number): string[] {
  const out: string[] = []
  HANGUL_LESSONS.slice(0, upto + 1).forEach((l) => {
    if (l.kind === 'vowel' || l.kind === 'consonant') out.push(...l.items)
  })
  return out
}

function distractors(item: string, known: string[], n: number): string[] {
  const sameKind = (j: string) => (IS_CONS.has(item) ? IS_CONS.has(j) : IS_VOWEL.has(j))
  const near = CONFUSABLE.filter((g) => g.includes(item)).flat()
  const pool = [
    ...shuffle(near.filter((j) => j !== item && known.includes(j))),
    ...shuffle(known.filter((j) => j !== item && sameKind(j))),
  ]
  return [...new Set(pool)].slice(0, n)
}

// Âm tiết "mang" chữ cần hỏi: phụ âm thì ghép với một nguyên âm đã biết, nguyên âm
// thì đi sau ㅇ câm (hoặc một phụ âm đã biết cho đỡ nhàm).
function carrier(item: string, known: string[]): (j: string) => string {
  if (IS_CONS.has(item)) {
    const vowels = known.filter((j) => BASIC_VOWELS.includes(j))
    const v = pick(vowels.length ? vowels : ['ㅏ'])
    return (j) => compose(j, v)
  }
  const cons = known.filter((j) => IS_CONS.has(j) && j !== 'ㅇ')
  const c = cons.length && Math.random() < 0.35 ? pick(cons) : 'ㅇ'
  return (j) => compose(c, j)
}

let seq = 0
const qid = () => `q${++seq}`

export function jamoQuestion(item: string, known: string[], kind: 'see' | 'hear' | 'write'): HQuestion {
  const make = carrier(item, known)
  const others = distractors(item, known, 3)
  const syl = make(item)
  const opts = shuffle([item, ...others])
  const rom = (j: string) => romanizeWord(make(j)) || make(j)
  const info = [...CONSONANTS, ...VOWELS].find((x) => x.j === item)
  const explain = `${syl} = ${rom(item)} · ${item} đọc ${info?.vi ?? ''}`
  if (kind === 'see') {
    return {
      id: qid(), kind, item, ask: 'Chữ này đọc là?', prompt: syl, audio: syl,
      options: opts.map(rom), answer: rom(item), hangulOptions: false, explain,
    }
  }
  if (kind === 'write') {
    return {
      id: qid(), kind, item, ask: 'Chữ nào đọc là?', prompt: rom(item), audio: syl,
      options: opts.map(make), answer: syl, hangulOptions: true, explain,
    }
  }
  return {
    id: qid(), kind, item, ask: 'Nghe và chọn đúng chữ', prompt: '', audio: syl,
    options: opts.map(make), answer: syl, hangulOptions: true, explain,
  }
}

function tailSyllable(soundId: string): string {
  const t = TAIL_SOUNDS.find((x) => x.id === soundId)!
  const lead = pick(['ㄱ', 'ㄴ', 'ㄷ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅎ'])
  // ㅎ đứng cuối một mình gần như không gặp ngoài đời, bỏ cho đỡ đánh đố.
  return compose(lead, pick(BASIC_VOWELS), pick(t.letters.filter((l) => l !== 'ㅎ')))
}

export function tailQuestion(soundId: string, hear: boolean): HQuestion {
  const t = TAIL_SOUNDS.find((x) => x.id === soundId)!
  if (hear) {
    const others = shuffle(TAIL_SOUNDS.filter((x) => x.id !== soundId)).slice(0, 3)
    const lead = pick(['ㄱ', 'ㅂ', 'ㅅ', 'ㅁ', 'ㅇ'])
    const v = pick(['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ'])
    const syl = (x: typeof t) => compose(lead, v, x.letters[0])
    return {
      id: qid(), kind: 'tailHear', item: soundId, ask: 'Nghe và chọn đúng chữ có patchim', prompt: '', audio: syl(t),
      options: shuffle([t, ...others]).map(syl), answer: syl(t), hangulOptions: true,
      explain: `${syl(t)} kết thúc bằng âm "${t.sound}" — ${t.vi}`,
    }
  }
  const syl = tailSyllable(soundId)
  const letter = decompose(syl)?.tail ?? ''
  const others = shuffle(TAIL_SOUNDS.filter((x) => x.id !== soundId)).slice(0, 3)
  return {
    id: qid(), kind: 'tail', item: soundId, ask: 'Patchim của chữ này đọc ra âm gì?', prompt: syl, audio: syl,
    options: shuffle([t, ...others]).map((x) => x.sound), answer: t.sound, hangulOptions: false,
    explain: `Patchim ${letter} đọc là "${tailSoundOf(letter)?.sound ?? t.sound}" — ${syl} = ${romanizeWord(syl)}`,
  }
}

const READ_WORDS = KO_ALL_WORDS.filter((w) => w.ko && w.romaja && /^[가-힣]{1,4}$/.test(w.ko))

export function wordPool(): typeof READ_WORDS {
  return READ_WORDS
}

export function wordQuestion(hear: boolean, preferLinking = true): HQuestion {
  // Ưu tiên từ có nối âm (patchim + ㅇ) để bài đọc đúng trọng tâm.
  const linking = READ_WORDS.filter((w) => {
    const chars = Array.from(w.ko!)
    return chars.some((ch, i) => decompose(ch)?.tail && decompose(chars[i + 1] ?? '')?.lead === 'ㅇ')
  })
  const w = preferLinking && linking.length && Math.random() < 0.6 ? pick(linking) : pick(READ_WORDS)
  const len = Array.from(w.ko!).length
  const differs = (x: typeof w) => x.ko !== w.ko && x.romaja !== w.romaja
  const sameLen = READ_WORDS.filter((x) => differs(x) && Array.from(x.ko!).length === len)
  const others = shuffle(sameLen.length >= 3 ? sameLen : READ_WORDS.filter(differs)).slice(0, 3)
  const explain = `${w.ko} = ${w.romaja} · ${w.vi}`
  if (hear) {
    return {
      id: qid(), kind: 'wordHear', item: w.ko!, ask: 'Nghe và chọn đúng từ', prompt: '', audio: w.ko,
      options: shuffle([w, ...others]).map((x) => x.ko!), answer: w.ko!, hangulOptions: true, explain,
    }
  }
  return {
    id: qid(), kind: 'word', item: w.ko!, ask: 'Từ này đọc là?', prompt: w.ko!, audio: w.ko,
    options: shuffle([w, ...others]).map((x) => x.romaja!), answer: w.romaja!, hangulOptions: false, explain,
  }
}

// Bài kiểm tra cuối bài học: mỗi chữ của bài xuất hiện ít nhất một lần.
export function lessonQuiz(lessonIdx: number, canHear: boolean, size = 10): HQuestion[] {
  const lesson = HANGUL_LESSONS[lessonIdx]
  if (lesson.kind === 'words') {
    return Array.from({ length: size }, (_, i) => wordQuestion(canHear && i % 3 === 2))
  }
  if (lesson.kind === 'tail') {
    const order = shuffle([...lesson.items, ...shuffle(lesson.items)]).slice(0, size)
    return order.map((id, i) => tailQuestion(id, canHear && i % 3 === 1))
  }
  const known = knownJamo(lessonIdx)
  const items = [...shuffle(lesson.items)]
  while (items.length < size) items.push(pick(lesson.items))
  const kinds: ('see' | 'hear' | 'write')[] = canHear ? ['see', 'hear', 'write'] : ['see', 'write']
  return shuffle(items.slice(0, size)).map((it, i) => jamoQuestion(it, known, kinds[i % kinds.length]))
}

export type Stats = Record<string, [number, number]>

// Luyện tự do: rút chữ theo trọng số — chữ hay sai và ít gặp ra nhiều hơn.
export function practiceRound(pool: string[], stats: Stats, canHear: boolean, size = 10): HQuestion[] {
  const jamo = pool.filter((j) => IS_CONS.has(j) || IS_VOWEL.has(j))
  if (!jamo.length) return []
  const weight = (j: string) => {
    const [right, wrong] = stats[j] ?? [0, 0]
    return 0.4 + (wrong * 2 + 1) / (right + 1)
  }
  const total = jamo.reduce((s, j) => s + weight(j), 0)
  const draw = () => {
    let r = Math.random() * total
    for (const j of jamo) {
      r -= weight(j)
      if (r <= 0) return j
    }
    return jamo[jamo.length - 1]
  }
  const kinds: ('see' | 'hear' | 'write')[] = canHear ? ['see', 'hear', 'write'] : ['see', 'write']
  return Array.from({ length: size }, (_, i) => jamoQuestion(draw(), pool, kinds[i % kinds.length]))
}
