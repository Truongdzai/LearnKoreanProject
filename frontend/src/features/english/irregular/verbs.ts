import { IRREGULAR_VERBS, type IrregularVerb } from '@/data/english/irregularVerbs'

export type ModeId = 'v2' | 'v3' | 'type'
export type SetId = 'core' | 'more' | 'all'

export const MODES: { id: ModeId; label: string; desc: string }[] = [
  { id: 'v2', label: 'Chọn V2', desc: 'Cho nguyên mẫu, chọn dạng quá khứ đơn (yesterday I …).' },
  { id: 'v3', label: 'Chọn V3', desc: 'Chọn quá khứ phân từ — dùng sau have / has và câu bị động.' },
  { id: 'type', label: 'Tự gõ V2 + V3', desc: 'Không có gợi ý: tự gõ cả hai dạng. Gõ đúng cả hai là "thuộc".' },
]

export const SETS: { id: SetId; label: string; max: 1 | 2 | 3 }[] = [
  { id: 'core', label: 'Hằng ngày', max: 1 },
  { id: 'more', label: '+ Thường gặp', max: 2 },
  { id: 'all', label: 'Tất cả', max: 3 },
]

export const ROUND = 10

export const verbsOf = (set: SetId): IrregularVerb[] => {
  const max = SETS.find((s) => s.id === set)?.max ?? 1
  return IRREGULAR_VERBS.filter((v) => v.level <= max)
}

export const findVerb = (v1: string) => IRREGULAR_VERBS.find((v) => v.v1 === v1)

// Thêm -ed theo luật chính tả của động từ có quy tắc (để làm phương án sai kiểu "cutted", "goed")
export function regular(v1: string): string {
  if (/e$/.test(v1)) return v1 + 'd'
  if (/[^aeiou]y$/.test(v1)) return v1.slice(0, -1) + 'ied'
  if (/(^|[^aeiou]|qu)[aeiou][^aeiouwxy]$/.test(v1)) return v1 + v1.slice(-1) + 'ed'
  return v1 + 'ed'
}

// Dạng -ed có thật với nghĩa khác hoặc vẫn được chấp nhận (quitted, lighted, hanged, lied…) — không đưa làm phương án sai
const NO_REGULAR = new Set([
  'quit', 'bet', 'light', 'hang', 'lie', 'cost', 'wake', 'ring', 'fly', 'tear', 'lead', 'bend', 'pay', 'hide',
  'stick', 'build', 'leave', 'see', 'be', 'sing', 'put', 'dig', 'spell', 'learn', 'burn', 'dream', 'smell', 'show',
])

// Cặp hay nhầm: dạng của động từ kia là phương án sai rất "thật"
const CONFUSE: Record<string, string[]> = {
  buy: ['brought'], bring: ['bought'], fall: ['felt'], feel: ['fell', 'fallen'],
  lie: ['laid', 'lied'], lay: ['lay', 'lain', 'layed'], sit: ['set'], set: ['sat'],
  think: ['thank', 'taught'], teach: ['thought'], lose: ['loose'], find: ['fined', 'founded'],
  be: ['is', 'are', 'being'], go: ['goes'], see: ['sawed'], win: ['wan'],
  begin: ['begon'], drink: ['drinked'], sing: ['singed'], ring: ['ringed'], swim: ['swammed'],
  come: ['comed'], run: ['runned'], become: ['becomed'], read: ['readed', 'red'],
  hear: ['heared', 'herd'], say: ['sayed', 'sed'], pay: ['payd'], make: ['maked'],
  wear: ['weared'], fight: ['fighted', 'faught'], catch: ['catched', 'cought'],
  get: ['getten'], forget: ['forgetten'], meet: ['meeted', 'meat'], fly: ['flied', 'flyed'],
  lead: ['leaded'], hang: ['hanged'], light: ['lought', 'lited'],
  learn: ['learnd', 'leart'], spell: ['spellt', 'spilt'], burn: ['brunt', 'burnd'],
  dream: ['dreampt', 'drempt'], smell: ['smellt', 'smelld'],
  quit: ['quite', 'quiet'], cost: ['casted'], bet: ['betten', 'bat'],
}

// Dạng một số từ điển Mỹ vẫn ghi nhận (woke, hid, bit làm V3) — không đưa làm phương án sai cho khỏi gây tranh cãi
const AVOID: Record<string, string[]> = { wake: ['woke'], hide: ['hid'], bite: ['bit'] }

const swapOught = (w: string) =>
  /ought$/.test(w) ? w.replace(/ought$/, 'aught') : /aught$/.test(w) ? w.replace(/aught$/, 'ought') : ''

// Lỗi chính tả hay gặp trước -en: bỏ chữ đôi (written → writen), "choosen" theo choose
function respell(w: string, v1: string): string[] {
  const out: string[] = []
  const m = w.match(/^(.*?)([^aeiou])\2en$/)
  if (m) out.push(m[1] + m[2] + 'en')
  const s = w.match(/^(.*[^aeiou])([aeiou])([^aeiou])en$/)
  if (s && v1.includes(s[2] + s[2])) out.push(s[1] + s[2] + s[2] + s[3] + 'en')
  return out
}

const ing = (v1: string) =>
  v1 === 'be' ? 'being' : /ie$/.test(v1) ? v1.slice(0, -2) + 'ying' : /[^e]e$/.test(v1) ? v1.slice(0, -1) + 'ing'
    : /(^|[^aeiou]|qu)[aeiou][^aeiouwxy]$/.test(v1) ? v1 + v1.slice(-1) + 'ing' : v1 + 'ing'

const enForm = (v1: string) => (/e$/.test(v1) ? v1 + 'n' : v1 + 'en')

// Ngôi thứ ba số ít: lỗi hay gặp khi chưa phân biệt hiện tại với quá khứ
function third(v1: string): string {
  if (v1 === 'be') return 'is'
  if (v1 === 'have') return 'has'
  if (/(s|x|z|ch|sh|o)$/.test(v1)) return v1 + 'es'
  if (/[^aeiou]y$/.test(v1)) return v1.slice(0, -1) + 'ies'
  return v1 + 's'
}

function pool(v: IrregularVerb, kind: 'v2' | 'v3'): string[] {
  const own = kind === 'v2' ? v.v2 : v.v3
  const other = kind === 'v2' ? v.v3 : v.v2
  const answer = own[0]
  const list: string[] = []
  // Thứ tự = độ "thật" của lỗi: dạng còn lại, cặp hay nhầm, thêm -ed, nguyên mẫu, viết sai
  list.push(...other)
  list.push(...(CONFUSE[v.v1] ?? []))
  if (!NO_REGULAR.has(v.v1)) list.push(regular(v.v1))
  list.push(v.v1)
  list.push(swapOught(answer))
  list.push(...respell(answer, v.v1))
  if (kind === 'v3') list.push(enForm(v.v1))
  if (kind === 'v3' && v.group !== 'ABB' && !/ed$/.test(v.v2[0])) list.push(enForm(v.v2[0]))
  if (!/ed$/.test(answer)) list.push(answer.endsWith('e') ? answer + 'd' : answer + 'ed')
  if (!/ed$/.test(v.v2[0])) list.push(regular(v.v2[0]))
  list.push(third(v.v1), enForm(v.v1), ing(v.v1))
  return list
}

// Mọi dạng đúng của động từ này cho câu hỏi đó, không phân biệt hoa thường
export function accepted(v: IrregularVerb, kind: 'v2' | 'v3'): Set<string> {
  return new Set((kind === 'v2' ? v.v2 : v.v3).map((x) => x.toLowerCase()))
}

// Với động từ có dạng -ed hợp lệ, chặn mọi biến thể -ed tự sinh (trừ phương án đã chọn tay trong CONFUSE)
function blocked(v: IrregularVerb): Set<string> {
  if (!NO_REGULAR.has(v.v1)) return new Set()
  const b = v.v1
  return new Set([regular(b), b + 'ed', b + b.slice(-1) + 'ed', regular(v.v2[0])].filter((w) => !(CONFUSE[b] ?? []).includes(w)))
}

export function distractors(v: IrregularVerb, kind: 'v2' | 'v3', n = 3): string[] {
  const ok = accepted(v, kind)
  const block = blocked(v)
  if (kind === 'v3') for (const w of AVOID[v.v1] ?? []) block.add(w)
  const out: string[] = []
  for (const c of pool(v, kind)) {
    const w = c.trim().toLowerCase()
    if (!w || ok.has(w) || block.has(w) || out.includes(w) || /\s/.test(w)) continue
    out.push(w)
  }
  // Giữ 2 lỗi "thật" nhất, chọn ngẫu nhiên phần còn lại để mỗi lượt khác nhau một chút
  const head = out.slice(0, 2)
  const tail = shuffle(out.slice(2))
  return [...head, ...tail].slice(0, n)
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface Question {
  verb: IrregularVerb
  kind: 'v2' | 'v3'
  answer: string
  options: string[]
}

export function makeQuestion(v: IrregularVerb, kind: 'v2' | 'v3'): Question {
  const answer = (kind === 'v2' ? v.v2 : v.v3)[0]
  return { verb: v, kind, answer, options: shuffle([answer, ...distractors(v, kind)]) }
}

// Chọn động từ cho một lượt: ưu tiên từ vừa sai, rồi từ chưa thuộc, rồi ngẫu nhiên
export function pickVerbs(set: SetId, weak: string[], known: string[], n = ROUND): IrregularVerb[] {
  const all = verbsOf(set)
  const weakSet = new Set(weak.map((w) => w.slice(w.indexOf(':') + 1)))
  const knownSet = new Set(known)
  const w = shuffle(all.filter((v) => weakSet.has(v.v1))).slice(0, Math.ceil(n / 2))
  const fresh = shuffle(all.filter((v) => !weakSet.has(v.v1) && !knownSet.has(v.v1)))
  const rest = shuffle(all.filter((v) => !weakSet.has(v.v1) && knownSet.has(v.v1)))
  return shuffle([...w, ...fresh, ...rest].slice(0, n))
}

// Nhận dạng gõ: bỏ khoảng trắng, chấp nhận "was/were" hay "learned, learnt" nếu mọi phần đều đúng
export function judgeTyped(v: IrregularVerb, kind: 'v2' | 'v3', typed: string): boolean {
  const ok = accepted(v, kind)
  const parts = typed.toLowerCase().replace(/[’']/g, '').split(/\s*(?:\/|,|\bor\b)\s*/).map((p) => p.trim()).filter(Boolean)
  return parts.length > 0 && parts.every((p) => ok.has(p))
}

export const formsLine = (v: IrregularVerb) => `${v.v1} – ${v.v2.join(' / ')} – ${v.v3.join(' / ')}`

// Những phương án sai là từ có thật: nói rõ nó là gì để khỏi nhớ nhầm
const REAL: Record<string, string> = {
  lied: 'lied là quá khứ của lie nghĩa "nói dối" (có quy tắc). lie "nằm" thì là lie – lay – lain.',
  hanged: 'hanged chỉ dùng với nghĩa "treo cổ"; treo đồ vật là hang – hung – hung.',
  singed: 'singed là quá khứ của singe (làm cháy sém).',
  ringed: 'ringed là của ring nghĩa "bao quanh"; chuông reo là ring – rang – rung.',
  flied: 'flied chỉ dùng trong bóng chày; bay là fly – flew – flown.',
  sawed: 'sawed là quá khứ của saw (cưa).',
  founded: 'founded là quá khứ của found (thành lập).',
  fined: 'fined là quá khứ của fine (phạt tiền).',
  leaded: 'leaded là "có pha chì" (leaded petrol); dẫn dắt là lead – led – led.',
  loose: 'loose là tính từ "lỏng" — khác lose – lost – lost (mất).',
  thank: 'thank là "cảm ơn".',
  herd: 'herd là "bầy, đàn" — đọc giống heard nhưng viết khác.',
  meat: 'meat là "thịt".',
  red: 'red là "màu đỏ" — đọc giống read ở dạng quá khứ (V2, V3), nhưng vẫn viết là read.',
  spilt: 'spilt là quá khứ của spill (làm đổ).',
  felled: 'felled là quá khứ của fell (đốn cây).',
  quite: 'quite là "khá, hoàn toàn" — dễ nhầm chính tả với quit.',
  quiet: 'quiet là "yên lặng".',
  is: 'is là hiện tại (he / she / it is).',
  are: 'are là hiện tại (you / we / they are).',
  brunt: 'brunt là danh từ (gánh nặng, mũi nhọn) — không phải dạng của burn.',
  lighten: 'lighten là động từ khác: làm sáng lên, làm nhẹ đi.',
  leaven: 'leaven là "men (làm bánh)".',
  haven: 'haven là "nơi trú ẩn".',
  waken: 'waken là một động từ riêng (= wake up), có quy tắc: wakened.',
  bat: 'bat là "con dơi / cây gậy".',
  wan: 'wan là tính từ "xanh xao".',
  lien: 'lien là thuật ngữ pháp lý (quyền cầm giữ).',
  sated: 'sated là quá khứ của sate (làm thỏa mãn).',
  meted: 'meted là quá khứ của mete (phân phát).',
  ranged: 'ranged là quá khứ của range (dao động trong khoảng).',
}

// Khoảng cách sửa chữ (để nhận ra lỗi chính tả kiểu baught, choosen, writen)
function edits(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
  }
  return d[a.length][b.length]
}

const formOf = (w: string, skip: IrregularVerb) =>
  IRREGULAR_VERBS.find((x) => x !== skip && (x.v1 === w || x.v2.includes(w) || x.v3.includes(w)))

// Giải thích vì sao một dạng là sai cho câu hỏi V2 / V3
export function explain(v: IrregularVerb, kind: 'v2' | 'v3', raw: string): string {
  const w = raw.trim().toLowerCase()
  if (!w || accepted(v, kind).has(w)) return ''
  if (kind === 'v2' && v.v3.includes(w) && w === v.v1) return `${w} là nguyên mẫu và cũng là V3 (have ${w}) — quá khứ đơn phải là ${v.v2[0]}.`
  if (kind === 'v2' && v.v3.includes(w)) return `${w} là V3 (quá khứ phân từ) — đi sau have / has hoặc trong câu bị động, không đứng một mình để kể chuyện đã qua.`
  if (kind === 'v3' && v.v2.includes(w)) return `${w} là V2 (quá khứ đơn). Sau have / has phải dùng V3.`
  if (w === v.v1) {
    const also = formOf(w, v)
    return also ? `${w} là nguyên mẫu (V1) — và cũng là một dạng của ${also.v1} (${also.vi}): ${formsLine(also)}.` : `${w} là nguyên mẫu (V1).`
  }
  if (REAL[w]) return REAL[w]
  if (w === third(v.v1)) return `${w} là hiện tại đơn ngôi thứ ba (he / she / it ${w}).`
  if (w === ing(v.v1)) return `${w} là dạng -ing (đang làm).`
  const other = formOf(w, v)
  if (other) return `${w} là dạng của ${other.v1} (${other.vi}): ${formsLine(other)}.`
  const ok = [...accepted(v, kind)]
  const [near, d] = ok.map((a) => [a, edits(a, w)] as const).sort((x, y) => x[1] - y[1])[0]
  // Dạng -ed tự thêm vào V1 / V2 / V3 (feeded, wented, broughted)
  const edForms = new Set([regular(v.v1), v.v1 + 'ed', regular(v.v2[0]), v.v2[0] + 'ed', v.v2[0] + 'd', v.v3[0] + 'ed'])
  if (edForms.has(w) || (/ed$/.test(w) && !ok.some((a) => /ed$/.test(a)))) return `${v.v1} là động từ bất quy tắc — không thêm -ed.`
  if (/en$/.test(w) && kind === 'v2') return `Quá khứ đơn không có đuôi -en — V2 của ${v.v1} là ${v.v2[0]}.`
  if (/en$/.test(w) && d > 1) return `Không có dạng "${w}" — V3 của ${v.v1} là ${ok.join(' / ')}.`
  if (d === 1 || (d === 2 && w.length >= 4 && w[0] === near[0])) return `Sai chính tả — viết đúng là ${near}.`
  return `Không có dạng "${w}".`
}

// Từ viết giống nhau nhưng đọc khác: đưa máy đọc cách viết theo âm để khỏi đọc sai
const SAY: Record<string, string> = { read: 'reed, red, red', lead: 'leed, led, led', tear: 'tare, tore, torn' }

// Đọc ba dạng liền nhau cho máy đọc: "go, went, gone"
export const sayForms = (v: IrregularVerb) => SAY[v.v1] ?? `${v.v1}, ${v.v2[0]}, ${v.v3[0]}`
