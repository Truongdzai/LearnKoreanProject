import { KO_ALL_WORDS } from '@/data/koreanCore'
import {
  CLASS_LABEL, ENDINGS, classify, conjugate, drillable, lexicon, mistakes,
  type Conj, type ConjClass, type EndingId, type Lex, type Mistake,
} from './engine'

export const ROUND = 10
export const DEFAULT_ENDINGS: EndingId[] = ['present', 'past', 'formal']

// Kho luyện: động từ / tính từ trong lộ trình mà engine phân loại chắc chắn,
// cộng bảng bất quy tắc của engine để nhóm ㅎ, ㄹ, ㄷ… có đủ từ mà luyện
export const POOL: Lex[] = (() => {
  const seen = new Set<string>()
  const out: Lex[] = []
  for (const w of KO_ALL_WORDS) {
    if ((w.pos !== 'verb' && w.pos !== 'adj') || !w.ko || seen.has(w.ko)) continue
    const lex = classify(w.ko, w.pos, w.vi)
    if (!lex) continue
    seen.add(w.ko)
    out.push(lex)
  }
  for (const lex of lexicon()) {
    if (seen.has(lex.dict)) continue
    seen.add(lex.dict)
    out.push(lex)
  }
  return out
})()

export const CLASSES: ConjClass[] = (Object.keys(CLASS_LABEL) as ConjClass[])
  .filter((c) => c !== 'copula' && POOL.some((l) => l.cls === c))

export interface Item {
  id: string
  lex: Lex
  ending: EndingId
  conj: Conj
  options: string[]
  wrong: Mistake[]
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[k]] = [a[k], a[i]]
  }
  return a
}

// Chọn 3 phương án sai: ưu tiên lỗi hay gặp (level thấp), có chút ngẫu nhiên để không lặp y hệt
function pickWrong(ms: Mistake[]): Mistake[] {
  return ms
    .map((m) => ({ m, r: m.level + Math.random() * 1.5 }))
    .sort((a, b) => a.r - b.r)
    .slice(0, 3)
    .map((x) => x.m)
}

let seq = 0

export function makeItem(lex: Lex, ending: EndingId): Item | null {
  const conj = conjugate(lex, ending)
  if (!conj) return null
  const wrong = pickWrong(mistakes(lex, ending))
  if (wrong.length < 3) return null
  return { id: `c${++seq}`, lex, ending, conj, wrong, options: shuffle([conj.form, ...wrong.map((m) => m.form)]) }
}

export interface RoundOpts {
  endings: EndingId[]
  cls: ConjClass | 'all'
  weak: string[]
  // Chỉ ôn các từ hay sai
  only?: boolean
}

// Từ trong danh sách hay sai được rút gấp ba lần
export function buildRound({ endings, cls, weak, only }: RoundOpts): Item[] {
  const ends = endings.length ? endings : DEFAULT_ENDINGS
  const lexes = POOL.filter((l) => (cls === 'all' || l.cls === cls) && (!only || weak.includes(l.dict)))
  const pairs: { lex: Lex; ending: EndingId; w: number }[] = []
  for (const lex of lexes) {
    for (const e of ends) {
      if (drillable(lex, e)) pairs.push({ lex, ending: e, w: weak.includes(lex.dict) ? 3 : 1 })
    }
  }
  const out: Item[] = []
  const used = new Set<string>()
  let guard = 0
  while (out.length < ROUND && pairs.length && guard++ < 400) {
    const total = pairs.reduce((s, p) => s + p.w, 0)
    let r = Math.random() * total
    let at = 0
    for (; at < pairs.length - 1; at++) { r -= pairs[at].w; if (r <= 0) break }
    const p = pairs[at]
    const key = `${p.lex.dict}|${p.ending}`
    if (used.has(key)) continue
    used.add(key)
    const item = makeItem(p.lex, p.ending)
    if (item) out.push(item)
  }
  return out
}

export function endingLabel(id: EndingId): string {
  return ENDINGS.find((e) => e.id === id)?.label ?? id
}

// Đếm số câu có thể ra với lựa chọn hiện tại (để báo trước khi nhóm quá ít từ)
export function countPairs({ endings, cls, weak, only }: RoundOpts): number {
  const ends = endings.length ? endings : DEFAULT_ENDINGS
  let n = 0
  for (const l of POOL) {
    if ((cls !== 'all' && l.cls !== cls) || (only && !weak.includes(l.dict))) continue
    for (const e of ends) if (drillable(l, e)) n++
  }
  return n
}

export const CLASS_RULE: Record<Exclude<ConjClass, 'copula'>, { rule: string; show: EndingId[]; ex: string[] }> = {
  regular: {
    rule: 'Gốc giữ nguyên, chỉ ghép đuôi. Nguyên âm cuối của gốc là ㅏ/ㅗ thì + 아, còn lại + 어; hai nguyên âm gặp nhau thì rút gọn.',
    show: ['present', 'past', 'formal'],
    ex: ['가다', '보다', '마시다', '먹다'],
  },
  hada: {
    rule: '하 + 여 luôn thành 해: 해요, 했어요, 해서. Các đuôi khác ghép thẳng vào 하.',
    show: ['present', 'past', 'formal'],
    ex: ['공부하다', '말하다', '좋아하다'],
  },
  b: {
    rule: 'Gốc tận cùng ㅂ gặp nguyên âm thì ㅂ → 우 (돕다, 곱다 → 오). Gặp phụ âm thì giữ ㅂ. 입다, 잡다, 좁다 viết giống nhưng là từ quy tắc.',
    show: ['present', 'if', 'formal'],
    ex: ['덥다', '어렵다', '돕다', '입다'],
  },
  d: {
    rule: 'Gốc tận cùng ㄷ gặp nguyên âm thì ㄷ → ㄹ. Gặp phụ âm thì giữ ㄷ. 받다, 닫다, 믿다 là từ quy tắc.',
    show: ['present', 'if', 'formal'],
    ex: ['듣다', '걷다', '받다'],
  },
  s: {
    rule: 'Gốc tận cùng ㅅ gặp nguyên âm thì ㅅ rơi nhưng không rút gọn: 나아요 chứ không phải 나요. 웃다, 씻다, 벗다 là từ quy tắc.',
    show: ['present', 'if', 'formal'],
    ex: ['낫다', '짓다', '웃다'],
  },
  reu: {
    rule: '르 gặp 아/어 thì ㅡ rơi và thêm một ㄹ vào âm tiết trước: 몰라요, 불러요. Đuôi bắt đầu bằng phụ âm thì giữ nguyên.',
    show: ['present', 'past', 'if'],
    ex: ['모르다', '부르다', '빠르다'],
  },
  eu: {
    rule: 'Gốc tận cùng ㅡ gặp 아/어 thì ㅡ rơi. Chọn 아 hay 어 theo âm tiết đứng trước ㅡ; gốc chỉ một âm tiết thì luôn là 어.',
    show: ['present', 'past', 'formal'],
    ex: ['바쁘다', '예쁘다', '크다'],
  },
  l: {
    rule: 'ㄹ rơi trước ㄴ, ㅂ, ㅅ (삽니다, 사세요, 사는). Đuôi có 으 thì bỏ 으: 살면, không phải 살으면. Gặp 아/어 thì bình thường.',
    show: ['present', 'formal', 'honor'],
    ex: ['살다', '만들다', '알다'],
  },
  h: {
    rule: 'ㅎ rơi và nguyên âm thành ㅐ: 그래요, 빨개요 (하얗다 → 하얘요). Trước 으 cũng rơi cả ㅎ lẫn 으: 그러면. Đuôi phụ âm giữ ㅎ. 좋다, 놓다 là từ quy tắc.',
    show: ['present', 'if', 'formal'],
    ex: ['그렇다', '빨갛다', '하얗다'],
  },
  exist: {
    rule: '있다, 없다 và từ ghép (재미있다, 맛없다) chia quy tắc, nhưng định ngữ luôn dùng 는 như động từ: 있는, 재미있는.',
    show: ['present', 'formal', 'mod'],
    ex: ['있다', '없다', '재미있다'],
  },
}

export interface Example {
  dict: string
  vi: string
  // Từ viết giống nhóm này nhưng chia quy tắc, đặt cạnh để so sánh
  contrast: boolean
  forms: { ending: EndingId; form: string }[]
}

// Ví dụ trên thẻ quy tắc: ưu tiên từ đã chọn, thiếu thì lấy thêm từ kho
export function classExamples(cls: Exclude<ConjClass, 'copula'>, n = 3): Example[] {
  const { show, ex } = CLASS_RULE[cls]
  const picked = ex.flatMap((d) => POOL.filter((l) => l.dict === d))
  const rest = POOL.filter((l) => l.cls === cls && !ex.includes(l.dict))
  return [...picked, ...rest].slice(0, Math.max(n, picked.length)).map((l) => ({
    dict: l.dict,
    vi: l.vi,
    contrast: l.cls !== cls,
    forms: show.flatMap((e) => {
      const c = drillable(l, e) ? conjugate(l, e) : null
      return c ? [{ ending: e, form: c.form }] : []
    }),
  }))
}

export function findLex(dict: string): Lex | undefined {
  const d = dict.trim()
  return POOL.find((l) => l.dict === d) ?? POOL.find((l) => l.dict === d + '다')
}
