import { compose, decompose } from '@/core/utils/hangul'

// Bộ chia đuôi động từ / tính từ tiếng Hàn. Nhóm bất quy tắc luôn tra bảng theo dạng từ điển,
// không đoán theo chính tả: 입다 và 덥다 viết giống nhau nhưng chia khác nhau.

export type Pos = 'verb' | 'adj' | 'noun'
export type ConjClass = 'regular' | 'hada' | 'b' | 'd' | 's' | 'reu' | 'eu' | 'l' | 'h' | 'exist' | 'copula'
export type EndingId =
  | 'present' | 'past' | 'formal' | 'future' | 'want' | 'honor' | 'honorPast'
  | 'neg' | 'seo' | 'if' | 'can' | 'mod' | 'modPast'

export interface Lex {
  dict: string
  pos: Pos
  cls: ConjClass
  vi: string
  noun?: string
  wa?: boolean
  skip?: EndingId[]
}

export interface Conj {
  form: string
  alts: string[]
  rule: string
  note?: string
}

export interface Mistake {
  form: string
  why: string
  level: number
}

export interface EndingMeta {
  id: EndingId
  label: string
  short: string
  desc: string
  verbOnly?: boolean
}

export const ENDINGS: EndingMeta[] = [
  { id: 'present', label: 'Hiện tại', short: '-아요/어요', desc: 'Đuôi lịch sự dùng hằng ngày. Nguyên âm cuối của gốc là ㅏ/ㅗ thì + 아요, còn lại + 어요; 하다 → 해요.' },
  { id: 'past', label: 'Quá khứ', short: '-았어요/었어요', desc: 'Lấy dạng 아/어 của gốc (như ở thì hiện tại) rồi thêm ㅆ어요.' },
  { id: 'formal', label: 'Trang trọng', short: '-(스)ㅂ니다', desc: 'Dùng khi phát biểu, đọc tin, nói với khách. Gốc có patchim + 습니다, không patchim + ㅂ니다.' },
  { id: 'future', label: 'Tương lai', short: '-(으)ㄹ 거예요', desc: 'Dự định hoặc phỏng đoán. Gốc có patchim + 을 거예요, không patchim + ㄹ 거예요.' },
  { id: 'want', label: 'Muốn', short: '-고 싶어요', desc: 'Muốn làm gì (chỉ với động từ). Gốc giữ nguyên + 고 싶어요, kể cả từ bất quy tắc.', verbOnly: true },
  { id: 'honor', label: 'Kính ngữ', short: '-(으)세요', desc: 'Nói về người trên hoặc đề nghị lịch sự. Gốc có patchim + 으세요, không patchim + 세요.' },
  { id: 'honorPast', label: 'Kính ngữ quá khứ', short: '-(으)셨어요', desc: 'Kính ngữ ở thì quá khứ. Gốc có patchim + 으셨어요, không patchim + 셨어요.' },
  { id: 'neg', label: 'Phủ định', short: '-지 않아요', desc: 'Không làm, không như vậy. Gốc giữ nguyên + 지 않아요.' },
  { id: 'seo', label: 'Vì… nên / rồi', short: '-아서/어서', desc: 'Nối nguyên nhân hoặc hai việc nối tiếp. Dạng 아/어 + 서, không gắn với 았/었.' },
  { id: 'if', label: 'Nếu', short: '-(으)면', desc: 'Điều kiện. Gốc có patchim + 으면, không patchim hoặc tận cùng ㄹ + 면.' },
  { id: 'can', label: 'Có thể', short: '-(으)ㄹ 수 있어요', desc: 'Có thể, biết làm (động từ). Gốc có patchim + 을 수 있어요, không patchim + ㄹ 수 있어요.', verbOnly: true },
  { id: 'mod', label: 'Định ngữ hiện tại', short: 'V-는 · A-(으)ㄴ', desc: 'Bổ nghĩa cho danh từ đứng sau. Động từ + 는, tính từ + (으)ㄴ, 있다/없다 + 는.' },
  { id: 'modPast', label: 'Định ngữ quá khứ', short: 'V-(으)ㄴ', desc: 'Việc đã làm, bổ nghĩa cho danh từ (chỉ động từ). Gốc có patchim + 은, không patchim + ㄴ.', verbOnly: true },
]

export const ENDING_BY_ID = Object.fromEntries(ENDINGS.map((e) => [e.id, e])) as Record<EndingId, EndingMeta>

export const CLASS_LABEL: Record<ConjClass, string> = {
  regular: 'Quy tắc',
  hada: '하다',
  b: 'ㅂ bất quy tắc',
  d: 'ㄷ bất quy tắc',
  s: 'ㅅ bất quy tắc',
  reu: '르 bất quy tắc',
  eu: 'ㅡ rơi',
  l: 'ㄹ rơi',
  h: 'ㅎ bất quy tắc',
  exist: '있다 / 없다',
  copula: 'Danh từ + 이다',
}

// Cờ: T = thường nói về đồ vật (bỏ kính ngữ), V = không do chủ ý (bỏ -고 싶어요), M = bỏ định ngữ,
// P = bỏ định ngữ quá khứ, N = bỏ -지 않아요, C = bỏ -(으)ㄹ 수 있어요, F = bỏ tương lai, I = bỏ -(으)면,
// W = ㅂ → 오 (돕다, 곱다).
type Row = [string, 'verb' | 'adj', ConjClass, string, string?]

const TABLE: Row[] = [
  ['덥다', 'adj', 'b', 'Nóng (thời tiết)'],
  ['춥다', 'adj', 'b', 'Lạnh (thời tiết)'],
  ['쉽다', 'adj', 'b', 'Dễ', 'T'],
  ['어렵다', 'adj', 'b', 'Khó', 'T'],
  ['맵다', 'adj', 'b', 'Cay', 'T'],
  ['귀엽다', 'adj', 'b', 'Dễ thương'],
  ['가깝다', 'adj', 'b', 'Gần', 'T'],
  ['무겁다', 'adj', 'b', 'Nặng', 'T'],
  ['가볍다', 'adj', 'b', 'Nhẹ', 'T'],
  ['고맙다', 'adj', 'b', 'Biết ơn', 'TNFI'],
  ['반갑다', 'adj', 'b', 'Vui vì được gặp', 'TNFI'],
  ['아름답다', 'adj', 'b', 'Đẹp'],
  ['즐겁다', 'adj', 'b', 'Vui vẻ'],
  ['시끄럽다', 'adj', 'b', 'Ồn ào', 'T'],
  ['더럽다', 'adj', 'b', 'Bẩn', 'T'],
  ['새롭다', 'adj', 'b', 'Mới mẻ', 'T'],
  ['무섭다', 'adj', 'b', 'Sợ, đáng sợ'],
  ['그립다', 'adj', 'b', 'Nhớ nhung', 'T'],
  ['부끄럽다', 'adj', 'b', 'Ngượng, xấu hổ'],
  ['외롭다', 'adj', 'b', 'Cô đơn'],
  ['부럽다', 'adj', 'b', 'Ghen tị, thấy đáng ao ước', 'T'],
  ['자랑스럽다', 'adj', 'b', 'Tự hào', 'T'],
  ['뜨겁다', 'adj', 'b', 'Nóng (khi chạm vào)', 'T'],
  ['차갑다', 'adj', 'b', 'Lạnh (khi chạm vào)', 'T'],
  ['싱겁다', 'adj', 'b', 'Nhạt', 'T'],
  ['눕다', 'verb', 'b', 'Nằm'],
  ['줍다', 'verb', 'b', 'Nhặt lên'],
  ['굽다', 'verb', 'b', 'Nướng'],
  ['돕다', 'verb', 'b', 'Giúp', 'W'],
  ['곱다', 'adj', 'b', 'Đẹp, dịu dàng', 'W'],
  ['입다', 'verb', 'regular', 'Mặc'],
  ['잡다', 'verb', 'regular', 'Nắm, bắt'],
  ['좁다', 'adj', 'regular', 'Hẹp', 'T'],
  ['씹다', 'verb', 'regular', 'Nhai'],
  ['갈아입다', 'verb', 'regular', 'Thay quần áo'],

  ['듣다', 'verb', 'd', 'Nghe'],
  ['걷다', 'verb', 'd', 'Đi bộ'],
  ['묻다', 'verb', 'd', 'Hỏi'],
  ['싣다', 'verb', 'd', 'Chất (hàng) lên'],
  ['받다', 'verb', 'regular', 'Nhận'],
  ['닫다', 'verb', 'regular', 'Đóng'],
  ['믿다', 'verb', 'regular', 'Tin'],
  ['얻다', 'verb', 'regular', 'Có được, nhận được'],

  ['낫다', 'verb', 's', 'Khỏi (bệnh)', 'M'],
  ['짓다', 'verb', 's', 'Xây, đặt (tên)'],
  ['붓다', 'verb', 's', 'Rót; sưng'],
  ['젓다', 'verb', 's', 'Khuấy'],
  ['웃다', 'verb', 'regular', 'Cười'],
  ['씻다', 'verb', 'regular', 'Rửa'],
  ['벗다', 'verb', 'regular', 'Cởi'],

  ['모르다', 'verb', 'reu', 'Không biết', 'VNP'],
  ['부르다', 'verb', 'reu', 'Gọi; hát'],
  ['빠르다', 'adj', 'reu', 'Nhanh', 'T'],
  ['다르다', 'adj', 'reu', 'Khác', 'T'],
  ['고르다', 'verb', 'reu', 'Chọn'],
  ['자르다', 'verb', 'reu', 'Cắt'],
  ['흐르다', 'verb', 'reu', 'Chảy', 'VT'],
  ['마르다', 'verb', 'reu', 'Khô; gầy đi', 'VTM'],
  ['오르다', 'verb', 'reu', 'Leo lên; tăng'],
  ['기르다', 'verb', 'reu', 'Nuôi; để (tóc)'],
  ['게으르다', 'adj', 'reu', 'Lười biếng', 'T'],
  ['배부르다', 'adj', 'reu', 'No bụng'],
  ['목마르다', 'adj', 'reu', 'Khát nước'],
  ['서두르다', 'verb', 'reu', 'Vội vàng', 'V'],
  ['따르다', 'verb', 'eu', 'Đi theo; rót'],
  ['치르다', 'verb', 'eu', 'Trả (tiền); dự (thi)'],

  ['쓰다', 'verb', 'eu', 'Viết; dùng'],
  ['크다', 'adj', 'eu', 'To, lớn'],
  ['바쁘다', 'adj', 'eu', 'Bận'],
  ['예쁘다', 'adj', 'eu', 'Xinh, đẹp'],
  ['아프다', 'adj', 'eu', 'Đau, ốm'],
  ['기쁘다', 'adj', 'eu', 'Vui mừng'],
  ['슬프다', 'adj', 'eu', 'Buồn'],
  ['배고프다', 'adj', 'eu', 'Đói bụng'],
  ['나쁘다', 'adj', 'eu', 'Xấu, tệ', 'T'],
  ['끄다', 'verb', 'eu', 'Tắt'],
  ['뜨다', 'verb', 'eu', 'Mở (mắt); nổi lên'],
  ['모으다', 'verb', 'eu', 'Gom, tích góp'],

  ['살다', 'verb', 'l', 'Sống'],
  ['만들다', 'verb', 'l', 'Làm, chế tạo'],
  ['알다', 'verb', 'l', 'Biết', 'NP'],
  ['놀다', 'verb', 'l', 'Chơi'],
  ['열다', 'verb', 'l', 'Mở'],
  ['팔다', 'verb', 'l', 'Bán'],
  ['길다', 'adj', 'l', 'Dài', 'T'],
  ['멀다', 'adj', 'l', 'Xa', 'T'],
  ['울다', 'verb', 'l', 'Khóc'],
  ['걸다', 'verb', 'l', 'Treo; gọi (điện)'],
  ['달다', 'adj', 'l', 'Ngọt', 'T'],
  ['힘들다', 'adj', 'l', 'Vất vả, mệt'],
  ['썰다', 'verb', 'l', 'Thái, cắt lát'],

  ['그렇다', 'adj', 'h', 'Như vậy'],
  ['어떻다', 'adj', 'h', 'Thế nào'],
  ['이렇다', 'adj', 'h', 'Như thế này', 'T'],
  ['저렇다', 'adj', 'h', 'Như thế kia', 'T'],
  ['빨갛다', 'adj', 'h', 'Đỏ', 'T'],
  ['노랗다', 'adj', 'h', 'Vàng', 'T'],
  ['파랗다', 'adj', 'h', 'Xanh dương', 'T'],
  ['하얗다', 'adj', 'h', 'Trắng', 'T'],
  ['까맣다', 'adj', 'h', 'Đen', 'T'],
  ['좋다', 'adj', 'regular', 'Tốt; thích'],
  ['놓다', 'verb', 'regular', 'Đặt, để'],
  ['넣다', 'verb', 'regular', 'Cho vào'],
  ['낳다', 'verb', 'regular', 'Sinh (con)'],

  ['있다', 'verb', 'exist', 'Có; ở', 'VNCPT'],
  ['없다', 'adj', 'exist', 'Không có', 'N'],
]

// Cờ cho từ quy tắc trong lộ trình (không cần tra bảng nhóm).
const FLAGS: Record<string, string> = {
  화나다: 'V', 놀라다: 'V', 신나다: 'VCT', 설레다: 'VCT', 다치다: 'V', 지다: 'V', 잃어버리다: 'V',
  끝나다: 'VT', 익다: 'VT', 상하다: 'VT', 졸리다: 'M', 늦다: 'MT', 긴장하다: 'V', 실망하다: 'V',
  후회하다: 'V', 걱정하다: 'V', 싫어하다: 'V', 돌아가다: 'T',
  같다: 'T', 많다: 'T', 적다: 'T', 비싸다: 'T', 싸다: 'T', 느리다: 'T', 짧다: 'T', 밝다: 'T', 짜다: 'T',
  시다: 'T', 미안하다: 'T', 따뜻하다: 'T', 시원하다: 'T', 신선하다: 'T', 고소하다: 'T', 느끼하다: 'T',
  위험하다: 'T', 안전하다: 'T', 멋있다: 'N', 맛있다: 'TN', 재미있다: 'TN', 재미없다: 'TN', 맛없다: 'TN',
}

// 어떻다 là từ để hỏi: chỉ giữ những dạng hay gặp (어때요, 어땠어요, 어떠세요, 어떤).
const SKIP_EXTRA: Record<string, EndingId[]> = {
  어떻다: ['formal', 'future', 'neg', 'seo', 'if'],
}

// Không chia: kính ngữ có sẵn (드시다…), từ hai nghĩa khác cách chia, 이다 ghép chưa kiểm.
const BLOCK = new Set([
  '드시다', '계시다', '주무시다', '잡수시다', '웃기다', '다행이다', '푸다', '이르다', '푸르다', '누르다', '노르다',
])
const ALLOW_IDA = new Set(['끓이다', '보이다', '먹이다'])

function flagsToSkip(flags: string): EndingId[] {
  const out: EndingId[] = []
  if (flags.includes('T')) out.push('honor', 'honorPast')
  if (flags.includes('V')) out.push('want')
  if (flags.includes('M')) out.push('mod', 'modPast')
  if (flags.includes('P')) out.push('modPast')
  if (flags.includes('N')) out.push('neg')
  if (flags.includes('C')) out.push('can')
  if (flags.includes('F')) out.push('future')
  if (flags.includes('I')) out.push('if')
  return [...new Set(out)]
}

function fromRow([dict, pos, cls, vi, flags = '']: Row): Lex {
  const skip = [...flagsToSkip(flags), ...(SKIP_EXTRA[dict] ?? [])]
  return { dict, pos, cls, vi, ...(flags.includes('W') ? { wa: true } : {}), ...(skip.length ? { skip } : {}) }
}

const LEXICON: Lex[] = TABLE.map(fromRow)
const LEX_BY_DICT = new Map(LEXICON.map((l) => [l.dict, l]))

export function lexicon(): Lex[] {
  return LEXICON
}

// ── Hangul helpers ──

const BRIGHT = new Set(['ㅏ', 'ㅑ', 'ㅗ'])
const SAFE_VOWELS = new Set(['ㅏ', 'ㅓ', 'ㅕ', 'ㅐ', 'ㅔ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅚ', 'ㅟ', 'ㅢ'])
const RISKY_TAILS = new Set(['ㅂ', 'ㄷ', 'ㅅ', 'ㅎ', 'ㄹ'])
const TEXT_RE = /^[가-힣]+( [가-힣]+)*$/

const last = (s: string) => s.slice(-1)
const parts = (s: string) => decompose(last(s)) ?? { lead: '', vowel: '', tail: '' }

function setLast(s: string, lead: string, vowel: string, tail = ''): string {
  return s.slice(0, -1) + compose(lead, vowel, tail)
}

function withTail(s: string, tail: string): string {
  const p = parts(s)
  return setLast(s, p.lead, p.vowel, tail)
}

const dropTail = (s: string) => withTail(s, '')

export function stemOf(dict: string): string {
  return dict.endsWith('다') ? dict.slice(0, -1) : dict
}

export function hasBatchim(s: string): boolean {
  return parts(s).tail !== ''
}

export function isBright(stem: string): boolean {
  return BRIGHT.has(parts(stem).vowel)
}

export const squash = (s: string) => s.replace(/\s+/g, '')

// ── Phân loại ──

export function classify(dict: string, pos?: string, vi?: string): Lex | null {
  if (BLOCK.has(dict) || !/^[가-힣]{2,}$/.test(dict) || !dict.endsWith('다')) return null
  const known = LEX_BY_DICT.get(dict)
  if (known) return vi ? { ...known, vi } : known
  if (pos !== 'verb' && pos !== 'adj') return null
  const skip = flagsToSkip(FLAGS[dict] ?? '')
  const base = { dict, pos: pos as Pos, vi: vi ?? '', ...(skip.length ? { skip } : {}) }
  if (dict.endsWith('하다')) return { ...base, cls: 'hada' }
  if (dict.endsWith('있다') || dict.endsWith('없다')) {
    return { ...base, cls: 'exist', skip: [...new Set([...(base.skip ?? []), 'want', 'neg', 'can', 'modPast'] as EndingId[])] }
  }
  if (dict.endsWith('이다') && !ALLOW_IDA.has(dict)) return null
  const p = parts(stemOf(dict))
  if (p.tail) return RISKY_TAILS.has(p.tail) ? null : { ...base, cls: 'regular' }
  return SAFE_VOWELS.has(p.vowel) ? { ...base, cls: 'regular' } : null
}

export function copula(noun: string, vi: string): Lex {
  return { dict: noun + '이다', pos: 'noun', cls: 'copula', vi, noun }
}

// ── Dạng 아/어 (gốc của -아요, -았어요, -아서) ──

interface AForm {
  inf: string
  alts: string[]
  why: string
}

function harmonyWhy(vowel: string): string {
  return BRIGHT.has(vowel) ? `nguyên âm cuối ${vowel} (ㅏ/ㅗ) → 아` : `nguyên âm cuối ${vowel} (không phải ㅏ/ㅗ) → 어`
}

function vowelInf(stem: string): AForm | null {
  const p = parts(stem)
  const syl = last(stem)
  switch (p.vowel) {
    case 'ㅏ': return { inf: stem, alts: [], why: `${syl} + 아: hai ㅏ gộp làm một` }
    case 'ㅓ': return { inf: stem, alts: [], why: `${syl} + 어: hai ㅓ gộp làm một` }
    case 'ㅕ': return { inf: stem, alts: [], why: `${syl} + 어: ㅕ nuốt luôn 어` }
    case 'ㅐ': return { inf: stem, alts: [stem + '어'], why: `${syl} + 어: ㅐ nuốt 어` }
    case 'ㅔ': return { inf: stem, alts: [stem + '어'], why: `${syl} + 어: ㅔ nuốt 어` }
    case 'ㅗ': return {
      inf: setLast(stem, p.lead, 'ㅘ'),
      alts: p.lead === 'ㅇ' ? [] : [stem + '아'],
      why: `${syl} + 아: ㅗ + ㅏ → ㅘ`,
    }
    case 'ㅜ': return { inf: setLast(stem, p.lead, 'ㅝ'), alts: [stem + '어'], why: `${syl} + 어: ㅜ + ㅓ → ㅝ` }
    case 'ㅣ': return { inf: setLast(stem, p.lead, 'ㅕ'), alts: [stem + '어'], why: `${syl} + 어: ㅣ + ㅓ → ㅕ` }
    case 'ㅚ': return { inf: setLast(stem, p.lead, 'ㅙ'), alts: [stem + '어'], why: `${syl} + 어: ㅚ + ㅓ → ㅙ` }
    case 'ㅟ': return { inf: stem + '어', alts: [], why: `${syl} + 어: ㅟ không rút gọn` }
    case 'ㅢ': return { inf: stem + '어', alts: [], why: `${syl} + 어: ㅢ không rút gọn` }
    default: return null
  }
}

// flip = cố tình đảo hoà âm (dùng để sinh lỗi sai).
function aForm(stem: string, cls: ConjClass, wa = false, flip = false): AForm | null {
  const p = parts(stem)
  const ah = (v: string) => (BRIGHT.has(v) !== flip ? '아' : '어')
  switch (cls) {
    case 'hada':
      if (last(stem) !== '하' || flip) return null
      return { inf: stem.slice(0, -1) + '해', alts: [], why: '하다 luôn thành 해' }
    case 'regular':
    case 'exist':
    case 'l':
      if (p.tail) {
        const pre = cls === 'l' ? 'Gốc tận cùng ㄹ: trước 아/어 vẫn giữ ㄹ; ' : ''
        return { inf: stem + ah(p.vowel), alts: [], why: pre + harmonyWhy(p.vowel) }
      }
      return flip ? null : vowelInf(stem)
    case 'b': {
      if (p.tail !== 'ㅂ') return null
      const o = wa !== flip
      return {
        inf: setLast(stem, p.lead, p.vowel) + (o ? '와' : '워'),
        alts: [],
        why: wa ? 'ㅂ bất quy tắc (돕다, 곱다): ㅂ → 오, 오 + 아 → 와' : 'ㅂ bất quy tắc: ㅂ → 우, 우 + 어 → 워',
      }
    }
    case 'd':
      if (p.tail !== 'ㄷ') return null
      return { inf: withTail(stem, 'ㄹ') + ah(p.vowel), alts: [], why: 'ㄷ bất quy tắc: ㄷ → ㄹ trước nguyên âm' }
    case 's':
      if (p.tail !== 'ㅅ') return null
      return { inf: setLast(stem, p.lead, p.vowel) + ah(p.vowel), alts: [], why: 'ㅅ bất quy tắc: bỏ ㅅ nhưng không rút gọn nguyên âm' }
    case 'reu': {
      if (last(stem) !== '르' || stem.length < 2) return null
      const prev = stem.slice(0, -1)
      const pv = parts(prev)
      if (pv.tail) return null
      return {
        inf: withTail(prev, 'ㄹ') + (ah(pv.vowel) === '아' ? '라' : '러'),
        alts: [],
        why: '르 bất quy tắc: ㅡ rơi, ㄹ dồn lên âm tiết trước → ㄹ라/ㄹ러',
      }
    }
    case 'eu': {
      if (p.vowel !== 'ㅡ' || p.tail) return null
      if (stem.length === 1) {
        if (flip) return null
        return { inf: setLast(stem, p.lead, 'ㅓ'), alts: [], why: 'ㅡ rơi trước 아/어; gốc một âm tiết → 어' }
      }
      const pv = parts(stem.slice(0, -1)).vowel
      const a = ah(pv)
      const lead = last(stem) === '르' ? '따르다, 치르다 chỉ rơi ㅡ (không thêm ㄹ); ' : ''
      return {
        inf: setLast(stem, p.lead, a === '아' ? 'ㅏ' : 'ㅓ'),
        alts: [],
        why: `${lead}ㅡ rơi trước 아/어; âm tiết trước có ${pv} → ${BRIGHT.has(pv) ? '아' : '어'}`,
      }
    }
    case 'h': {
      if (p.tail !== 'ㅎ' || flip) return null
      if (p.vowel === 'ㅑ') return { inf: setLast(stem, p.lead, 'ㅒ'), alts: [], why: 'ㅎ bất quy tắc: bỏ ㅎ, ㅑ + 아 → ㅒ' }
      if (p.vowel === 'ㅏ' || p.vowel === 'ㅓ') {
        return { inf: setLast(stem, p.lead, 'ㅐ'), alts: [], why: 'ㅎ bất quy tắc: bỏ ㅎ, ㅏ/ㅓ + 아/어 → ㅐ' }
      }
      return null
    }
    default:
      return null
  }
}

// ── Gốc trước đuôi -(으) ──

interface Soft {
  base: string
  eu: boolean
  l?: boolean
}

function soft(stem: string, cls: ConjClass): Soft | null {
  const p = parts(stem)
  switch (cls) {
    case 'regular':
    case 'exist':
      return { base: stem, eu: !!p.tail }
    case 'hada':
    case 'reu':
    case 'eu':
      return { base: stem, eu: false }
    case 'l':
      return p.tail === 'ㄹ' ? { base: stem, eu: false, l: true } : null
    case 'b':
      return p.tail === 'ㅂ' ? { base: setLast(stem, p.lead, p.vowel) + '우', eu: false } : null
    case 'd':
      return p.tail === 'ㄷ' ? { base: withTail(stem, 'ㄹ'), eu: true } : null
    case 's':
      return p.tail === 'ㅅ' ? { base: setLast(stem, p.lead, p.vowel), eu: true } : null
    case 'h':
      return p.tail === 'ㅎ' ? { base: setLast(stem, p.lead, p.vowel), eu: false } : null
    default:
      return null
  }
}

function softWhy(cls: ConjClass, stem: string, kind: 'l' | 'n' | 'syl' | 'myeon'): string {
  switch (cls) {
    case 'regular':
    case 'exist':
      return hasBatchim(stem) ? 'Gốc có patchim → thêm 으' : 'Gốc không patchim → không thêm 으'
    case 'hada':
    case 'reu':
    case 'eu':
      return 'Gốc không patchim → không thêm 으'
    case 'b': return 'ㅂ bất quy tắc: ㅂ → 우 (thay cho 으)'
    case 'd': return 'ㄷ bất quy tắc: ㄷ → ㄹ rồi thêm 으'
    case 's': return 'ㅅ bất quy tắc: bỏ ㅅ nhưng vẫn giữ 으'
    case 'h': return 'ㅎ bất quy tắc: bỏ ㅎ và không thêm 으'
    case 'l':
      if (kind === 'l') return 'Gốc tận cùng ㄹ: không thêm 으, dùng luôn ㄹ có sẵn'
      if (kind === 'myeon') return 'Gốc tận cùng ㄹ: không thêm 으'
      return 'Gốc tận cùng ㄹ: ㄹ rơi trước ㄴ, ㅂ, ㅅ'
    default:
      return ''
  }
}

// Gắn -(으)ㄹ, -(으)ㄴ hoặc một âm tiết (면, 세요, 셨어요) vào gốc.
function attach(s: Soft, kind: 'l' | 'n' | 'syl', syl = ''): string {
  if (s.l) {
    if (kind === 'l') return s.base
    if (kind === 'n') return withTail(s.base, 'ㄴ')
    return (syl === '면' ? s.base : dropTail(s.base)) + syl
  }
  if (s.eu) return s.base + (kind === 'l' ? '을' : kind === 'n' ? '은' : '으' + syl)
  if (kind === 'syl') return s.base + syl
  if (hasBatchim(s.base)) return ''
  return withTail(s.base, kind === 'l' ? 'ㄹ' : 'ㄴ')
}

function shownSoft(s: Soft, kind: 'l' | 'n' | 'syl', syl: string): string {
  if (s.l) {
    if (kind === 'l') return s.base
    if (kind === 'syl' && syl === '면') return `${s.base} + 면`
    return `${dropTail(s.base)} + ${kind === 'n' ? 'ㄴ' : syl}`
  }
  if (s.eu) return `${s.base} + ${kind === 'l' ? '을' : kind === 'n' ? '은' : '으' + syl}`
  return `${s.base} + ${kind === 'l' ? 'ㄹ' : kind === 'n' ? 'ㄴ' : syl}`
}

const SOFT_ENDINGS: Partial<Record<EndingId, { kind: 'l' | 'n' | 'syl'; syl: string; after: string }>> = {
  future: { kind: 'l', syl: '', after: ' 거예요' },
  can: { kind: 'l', syl: '', after: ' 수 있어요' },
  honor: { kind: 'syl', syl: '세요', after: '' },
  honorPast: { kind: 'syl', syl: '셨어요', after: '' },
  if: { kind: 'syl', syl: '면', after: '' },
  mod: { kind: 'n', syl: '', after: '' },
  modPast: { kind: 'n', syl: '', after: '' },
}

// Kính ngữ bằng từ riêng.
const HONOR_WORD: Record<string, { base: string; alt?: string; note: string }> = {
  먹다: { base: '드시', alt: '잡수시', note: '먹다 có từ kính ngữ riêng là 드시다 (rất trang trọng: 잡수시다).' },
  자다: { base: '주무시', note: '자다 có từ kính ngữ riêng là 주무시다.' },
  있다: { base: '계시', alt: '있으시', note: 'Người "ở, có mặt" dùng 계시다; "có (cái gì)" thì dùng 있으세요.' },
}
const HONOR_ALT: Record<string, { alt: string; note: string }> = {
  마시다: { alt: '드시', note: 'Lịch sự hơn: 드세요 (드시다).' },
  말하다: { alt: '말씀하시', note: 'Lịch sự hơn: 말씀하세요.' },
}

const ALT_EXTRA: Record<string, string[]> = {
  '놓다|present': ['놔요'],
  '놓다|past': ['놨어요'],
  '놓다|seo': ['놔서'],
}

export function grammatical(lex: Lex, ending: EndingId): boolean {
  if (lex.cls === 'copula') return ['present', 'past', 'formal', 'future', 'if', 'honor', 'mod'].includes(ending)
  if (ENDING_BY_ID[ending].verbOnly && lex.pos !== 'verb') return false
  return true
}

export function drillable(lex: Lex, ending: EndingId): boolean {
  if (!grammatical(lex, ending) || lex.skip?.includes(ending)) return false
  if (lex.cls === 'copula') return ['present', 'past', 'formal', 'future', 'if'].includes(ending)
  return conjugate(lex, ending) != null
}

function copulaForm(noun: string, ending: EndingId): Conj | null {
  const b = hasBatchim(noun)
  const pick = (withB: string, noB: string) => (b ? withB : noB)
  switch (ending) {
    case 'present':
      return {
        form: noun + pick('이에요', '예요'),
        alts: b ? [] : [noun + '이에요'],
        rule: b ? `Danh từ có patchim → + 이에요: ${noun} + 이에요` : `Danh từ không patchim → + 예요: ${noun} + 예요`,
      }
    case 'past':
      return {
        form: noun + pick('이었어요', '였어요'),
        alts: b ? [] : [noun + '이었어요'],
        rule: b ? `Danh từ có patchim → + 이었어요: ${noun} + 이었어요` : `Danh từ không patchim → + 였어요 (이었 rút thành 였)`,
      }
    case 'formal':
      return { form: noun + '입니다', alts: [], rule: `Danh từ + 입니다, có hay không patchim đều vậy: ${noun} + 입니다` }
    case 'future':
      return { form: noun + '일 거예요', alts: [], rule: `이다 không patchim → + ㄹ 거예요: ${noun} + 일 거예요` }
    case 'if':
      return {
        form: noun + pick('이면', '면'),
        alts: b ? [] : [noun + '이면'],
        rule: b ? `Danh từ có patchim → + 이면` : `Danh từ không patchim → + 면 (이 thường bỏ)`,
      }
    case 'honor':
      return {
        form: noun + pick('이세요', '세요'),
        alts: b ? [] : [noun + '이세요'],
        rule: b ? 'Danh từ có patchim → + 이세요' : 'Danh từ không patchim → + 세요',
      }
    case 'mod':
      return { form: noun + '인', alts: [], rule: `이다 + ㄴ → 인: ${noun}인 + danh từ` }
    default:
      return null
  }
}

export function conjugate(lex: Lex, ending: EndingId): Conj | null {
  if (!grammatical(lex, ending)) return null
  if (lex.cls === 'copula') return lex.noun ? copulaForm(lex.noun, ending) : null
  const stem = stemOf(lex.dict)
  if (!stem || !/^[가-힣]+$/.test(stem)) return null
  const extra = ALT_EXTRA[`${lex.dict}|${ending}`] ?? []

  if (ending === 'present' || ending === 'past' || ending === 'seo') {
    const a = aForm(stem, lex.cls, lex.wa)
    if (!a) return null
    const end = (inf: string) => (ending === 'present' ? inf + '요' : ending === 'past' ? withTail(inf, 'ㅆ') + '어요' : inf + '서')
    const shown = ending === 'present' ? '요' : ending === 'past' ? 'ㅆ어요' : '서'
    return {
      form: end(a.inf),
      alts: [...a.alts.map(end), ...extra],
      rule: `${a.why}: ${a.inf} + ${shown}`,
      ...(a.alts.length || extra.length ? { note: `Cũng đúng: ${[...a.alts.map(end), ...extra].join(', ')} (ít dùng hơn khi nói).` } : {}),
    }
  }

  if (ending === 'formal') {
    if (lex.cls === 'l') {
      if (!hasBatchim(stem)) return null
      return { form: withTail(stem, 'ㅂ') + '니다', alts: [], rule: `Gốc tận cùng ㄹ: ㄹ rơi trước ㅂ: ${dropTail(stem)} + ㅂ니다` }
    }
    if (hasBatchim(stem)) {
      const irr = ['b', 'd', 's', 'h'].includes(lex.cls) ? 'Trước phụ âm, gốc bất quy tắc giữ nguyên; ' : ''
      return { form: stem + '습니다', alts: [], rule: `${irr}gốc có patchim → + 습니다: ${stem} + 습니다` }
    }
    return { form: withTail(stem, 'ㅂ') + '니다', alts: [], rule: `Gốc không patchim → ㅂ làm patchim: ${stem} + ㅂ니다` }
  }

  if (ending === 'want' || ending === 'neg') {
    const tailText = ending === 'want' ? '고 싶어요' : '지 않아요'
    const irr = ['b', 'd', 's', 'h', 'l'].includes(lex.cls) ? 'Trước phụ âm, gốc giữ nguyên (không biến đổi bất quy tắc)' : 'Gốc giữ nguyên'
    return { form: `${stem}${tailText}`, alts: [], rule: `${irr}: ${stem} + ${tailText}` }
  }

  if (ending === 'mod' && (lex.pos === 'verb' || lex.cls === 'exist')) {
    if (lex.cls === 'l') return { form: dropTail(stem) + '는', alts: [], rule: `Động từ + 는; ㄹ rơi trước ㄴ: ${dropTail(stem)} + 는` }
    const who = lex.cls === 'exist' ? '있다/없다 dùng 는 như động từ' : 'Động từ ở hiện tại: gốc + 는'
    return { form: stem + '는', alts: [], rule: `${who}: ${stem} + 는` }
  }

  // Các đuôi -(으): tương lai, kính ngữ, nếu, có thể, định ngữ (tính từ / quá khứ).
  const honor = ending === 'honor' || ending === 'honorPast'
  if (honor && HONOR_WORD[lex.dict]) {
    const h = HONOR_WORD[lex.dict]
    const syl = ending === 'honor' ? '세요' : '셨어요'
    const make = (b: string) => b.slice(0, -1) + syl
    return {
      form: make(h.base),
      alts: h.alt ? [make(h.alt)] : [],
      rule: `${lex.dict} dùng từ kính ngữ riêng ${h.base}다: ${h.base.slice(0, -1)} + ${syl}`,
      note: h.note,
    }
  }
  const s = soft(stem, lex.cls)
  if (!s) return null
  const spec = SOFT_ENDINGS[ending]
  if (!spec) return null
  const core = attach(s, spec.kind, spec.syl)
  if (!core) return null
  const form = core + spec.after
  const prefix = ending === 'mod' ? 'Tính từ + (으)ㄴ. ' : ending === 'modPast' ? 'Động từ quá khứ + (으)ㄴ. ' : ''
  const kindKey = spec.kind === 'syl' && spec.syl === '면' ? 'myeon' : spec.kind
  const out: Conj = {
    form,
    alts: [],
    rule: `${prefix}${softWhy(lex.cls, stem, kindKey)}: ${shownSoft(s, spec.kind, spec.syl)}${spec.after}`,
  }
  const ha = honor ? HONOR_ALT[lex.dict] : undefined
  if (ha) {
    out.alts = [ha.alt.slice(0, -1) + (ending === 'honor' ? '세요' : '셨어요')]
    out.note = ha.note
  }
  return out
}


// ── Viết theo cách đọc (lỗi chính tả hay gặp) ──

const TAIL_SPLIT: Record<string, [string, string]> = {
  'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ'],
}
const NASAL: Record<string, string> = {
  'ㄱ': 'ㅇ', 'ㄲ': 'ㅇ', 'ㅋ': 'ㅇ', 'ㄺ': 'ㅇ', 'ㄳ': 'ㅇ',
  'ㄷ': 'ㄴ', 'ㅅ': 'ㄴ', 'ㅆ': 'ㄴ', 'ㅈ': 'ㄴ', 'ㅊ': 'ㄴ', 'ㅌ': 'ㄴ',
  'ㅂ': 'ㅁ', 'ㅍ': 'ㅁ', 'ㅄ': 'ㅁ',
}
const LEADS_OK = new Set(['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ'])

export function spellAsSaid(text: string): string {
  return text.split(' ').map((word) => {
    const syl = Array.from(word).map((ch) => decompose(ch))
    if (syl.some((p) => !p)) return word
    const ps = syl as { lead: string; vowel: string; tail: string }[]
    for (let i = 0; i < ps.length - 1; i++) {
      const a = ps[i]
      const b = ps[i + 1]
      if (!a.tail) continue
      if (b.lead === 'ㅇ') {
        if (a.tail === 'ㅇ') continue
        if (a.tail === 'ㅎ') { a.tail = ''; continue }
        const split = TAIL_SPLIT[a.tail]
        if (split) {
          if (split[1] === 'ㅎ') { a.tail = ''; b.lead = split[0] } else { a.tail = split[0]; b.lead = split[1] }
        } else if (LEADS_OK.has(a.tail)) {
          b.lead = a.tail
          a.tail = ''
        }
      } else if ((b.lead === 'ㄴ' || b.lead === 'ㅁ') && NASAL[a.tail]) {
        a.tail = NASAL[a.tail]
      }
    }
    return ps.map((p) => compose(p.lead, p.vowel, p.tail)).join('')
  }).join(' ')
}

// ── Lỗi sai có hệ thống (làm đáp án nhiễu và giải thích khi gõ sai) ──

const TRAP_OF: Record<string, ConjClass> = { 'ㅂ': 'b', 'ㄷ': 'd', 'ㅅ': 's', 'ㅎ': 'h' }

export function isTrap(lex: Lex): boolean {
  const stem = stemOf(lex.dict)
  if (lex.cls === 'regular') return !!TRAP_OF[parts(stem).tail] && LEX_BY_DICT.has(lex.dict)
  return lex.cls === 'eu' && last(stem) === '르'
}

export function mistakes(lex: Lex, ending: EndingId): Mistake[] {
  const right = conjugate(lex, ending)
  if (!right) return []
  const ok = new Set([right.form, ...right.alts].map(squash))
  const out: Mistake[] = []
  const add = (form: string | null | undefined, why: string, level: number) => {
    if (!form || !TEXT_RE.test(form)) return
    const k = squash(form)
    if (ok.has(k) || out.some((m) => squash(m.form) === k)) return
    out.push({ form, why, level })
  }
  if (lex.cls === 'copula') copulaMistakes(lex.noun ?? '', ending, right.form, add)
  else wordMistakes(lex, ending, right.form, add)
  add(spellAsSaid(right.form), 'Viết theo cách đọc — chữ viết vẫn giữ nguyên gốc', 2)
  // Dự phòng: dạng đúng của một đuôi khác.
  for (const e of ENDINGS) {
    if (e.id === ending) continue
    const c = conjugate(lex, e.id)
    if (c && c.form.includes(' ') === right.form.includes(' ')) add(c.form, `Đây là đuôi ${e.label.toLowerCase()} ${e.short}`, 3)
  }
  return out
}

type Add = (form: string | null | undefined, why: string, level: number) => void

function wordMistakes(lex: Lex, ending: EndingId, answer: string, add: Add) {
  const stem = stemOf(lex.dict)
  const p = parts(stem)
  const cls = lex.cls
  const label = CLASS_LABEL[cls]
  const trap = cls === 'regular' && LEX_BY_DICT.has(lex.dict) ? TRAP_OF[p.tail] : undefined
  const a = aForm(stem, cls, lex.wa)
  const regularized = `${lex.dict} thuộc nhóm ${label}, không chia như từ quy tắc`
  const keepTrap = `${lex.dict} là từ quy tắc: giữ nguyên ${p.tail}`

  if (ending === 'present' || ending === 'past' || ending === 'seo') {
    const end = (inf?: string | null) => {
      if (!inf) return null
      return ending === 'present' ? inf + '요' : ending === 'past' ? withTail(inf, 'ㅆ') + '어요' : inf + '서'
    }
    const naive = (s: string) => s + (isBright(s) ? '아' : '어')
    if (['b', 'd', 's', 'h'].includes(cls)) add(end(naive(stem)), regularized, 0)
    if (cls === 'reu') {
      add(end(aForm(stem, 'eu')?.inf), '르 bất quy tắc: ngoài rơi ㅡ còn phải thêm ㄹ vào âm tiết trước', 0)
      add(end(stem + '어'), '르 bất quy tắc: ㅡ phải rơi và thêm ㄹ', 1)
    }
    if (cls === 'eu') {
      add(end(stem + '어'), 'ㅡ phải rơi trước 아/어', 0)
      if (last(stem) === '르') add(end(aForm(stem, 'reu')?.inf), `${lex.dict} chỉ rơi ㅡ, không thêm ㄹ như 르 bất quy tắc`, 0)
    }
    if (cls === 's') add(end(vowelInf(setLast(stem, p.lead, p.vowel))?.inf), 'Bỏ ㅅ rồi thì không rút gọn nguyên âm nữa', 0)
    if (cls === 'b') {
      add(end(aForm(stem, 'b', !lex.wa)?.inf), lex.wa ? '돕다, 곱다 thành 와 (오 + 아), không phải 워' : 'Chỉ 돕다, 곱다 mới thành 와; còn lại thành 워', 0)
    }
    if (cls === 'h' && a) {
      const q = parts(a.inf)
      const wrongV = q.vowel === 'ㅒ' ? 'ㅐ' : 'ㅔ'
      add(end(setLast(a.inf, q.lead, wrongV)), q.vowel === 'ㅒ' ? 'ㅑ + 아 → ㅒ (하얘요), không phải ㅐ' : 'ㅎ bất quy tắc ra ㅐ, không phải ㅔ', 0)
    }
    if (trap) add(end(aForm(stem, trap)?.inf), keepTrap, 0)
    const flip = aForm(stem, cls, lex.wa, true)
    if (flip && cls !== 'b') {
      const pv = parts(stem.slice(0, -1)).vowel
      add(end(flip.inf), cls === 'reu' || cls === 'eu'
        ? `Sai hoà âm: âm tiết trước có ${pv} → ${BRIGHT.has(pv) ? '아' : '어'}`
        : `Sai hoà âm: ${harmonyWhy(p.vowel)}`, 1)
    }
    if (!p.tail && cls === 'regular') {
      if (['ㅏ', 'ㅓ', 'ㅕ'].includes(p.vowel)) add(end(stem + (p.vowel === 'ㅏ' ? '아' : '어')), 'Hai nguyên âm giống nhau phải gộp làm một', 1)
      if (last(stem) === '오') add(end(stem + '아'), '오 + 아 bắt buộc rút thành 와', 1)
    }
    if (cls === 'hada') add(end(stem + '아'), '하다 không + 아 — 하 luôn thành 해', 1)
    if (!p.tail || cls === 'hada') add(end(stem), 'Thiếu bước 아/어: gốc phải biến đổi trước khi + 요', 1)
    if (ending === 'past') {
      const chars = Array.from(answer)
      const k = chars.findIndex((ch) => decompose(ch)?.tail === 'ㅆ')
      if (k >= 0) {
        const q = decompose(chars[k])!
        chars[k] = compose(q.lead, q.vowel, 'ㅅ')
        add(chars.join(''), 'Quá khứ viết với ㅆ (았/었), không phải ㅅ', 2)
      }
    }
    if (ending === 'seo' && a) add(withTail(a.inf, 'ㅆ') + '어서', '-아서/어서 không đi với quá khứ 았/었', 1)
    return
  }

  if (ending === 'formal') {
    if (cls === 'l') {
      add(stem + '습니다', 'ㄹ rơi trước ㅂ rồi + ㅂ니다', 0)
      add(stem + '읍니다', 'ㄹ rơi trước ㅂ rồi + ㅂ니다 (-읍니다 là cách viết cũ)', 1)
      add(dropTail(stem) + '습니다', 'Bỏ ㄹ rồi thì gốc không còn patchim → + ㅂ니다', 1)
    } else if (p.tail) {
      add(stem + '읍니다', '-읍니다 là cách viết cũ; nay viết -습니다', 1)
    } else {
      add(stem + '습니다', 'Gốc không patchim → + ㅂ니다', 1)
    }
    if (cls === 'd') add(withTail(stem, 'ㄹ') + '습니다', 'Trước phụ âm, ㄷ giữ nguyên', 0)
    if (cls === 'b') add(withTail(setLast(stem, p.lead, p.vowel) + '우', 'ㅂ') + '니다', 'Trước phụ âm, ㅂ giữ nguyên', 0)
    if (cls === 's') add(withTail(setLast(stem, p.lead, p.vowel), 'ㅂ') + '니다', 'Trước phụ âm, ㅅ giữ nguyên', 0)
    if (cls === 'h') add(withTail(setLast(stem, p.lead, p.vowel), 'ㅂ') + '니다', 'Trước phụ âm, ㅎ giữ nguyên', 0)
    if (a && !hasBatchim(a.inf)) add(withTail(a.inf, 'ㅂ') + '니다', 'Đuôi trang trọng gắn vào gốc, không gắn vào dạng 아/어', 1)
    return
  }

  if (ending === 'want' || ending === 'neg') {
    const t = ending === 'want' ? '고 싶어요' : '지 않아요'
    const keep = `Trước -${t[0]}, gốc giữ nguyên`
    if (cls === 'd') add(withTail(stem, 'ㄹ') + t, `${keep}: ㄷ chỉ đổi thành ㄹ trước nguyên âm`, 0)
    if (cls === 'b') add(setLast(stem, p.lead, p.vowel) + '우' + t, `${keep}: ㅂ chỉ đổi trước nguyên âm`, 0)
    if (cls === 's') add(setLast(stem, p.lead, p.vowel) + t, `${keep}: ㅅ chỉ rơi trước nguyên âm`, 0)
    if (cls === 'h') add(setLast(stem, p.lead, p.vowel) + t, `${keep}: ㅎ vẫn còn`, 0)
    if (cls === 'l') add(dropTail(stem) + t, 'ㄹ chỉ rơi trước ㄴ, ㅂ, ㅅ — trước ㄱ, ㅈ vẫn giữ', 0)
    if (a) add(a.inf + t, `-${t[0]} gắn thẳng vào gốc, không gắn vào dạng 아/어`, 1)
    if (p.tail && cls !== 'l') add(stem + '으' + t, `-${t[0]} gắn thẳng vào gốc, không thêm 으`, 1)
    if (ending === 'want') {
      add(stem + '고 싶아요', '싶다 + 어요 → 싶어요 (ㅣ đi với 어)', 1)
      add(stem + '고 십어요', 'Viết 싶 (patchim ㅍ), không phải 십', 2)
    } else {
      add(stem + '지 않어요', '않다 có nguyên âm ㅏ → 않아요', 1)
      add(stem + '지 안아요', 'Viết 않아요 (patchim ㄶ), không phải 안아요', 2)
    }
    return
  }

  if (ending === 'mod' && (lex.pos === 'verb' || cls === 'exist')) {
    if (cls === 'l') {
      add(stem + '는', 'ㄹ phải rơi trước ㄴ', 0)
      add(stem + '으는', 'ㄹ phải rơi trước ㄴ, và -는 không có 으', 1)
    }
    if (cls === 'd') add(withTail(stem, 'ㄹ') + '는', 'Trước ㄴ, ㄷ giữ nguyên', 0)
    if (cls === 'b') add(setLast(stem, p.lead, p.vowel) + '우는', 'Trước ㄴ, ㅂ giữ nguyên', 0)
    if (cls === 's') add(setLast(stem, p.lead, p.vowel) + '는', 'Trước ㄴ, ㅅ giữ nguyên', 0)
    if (p.tail && cls !== 'l') add(stem + '으는', '-는 gắn thẳng vào gốc, không thêm 으', 1)
    if (lex.pos === 'verb') add(conjugate(lex, 'modPast')?.form, 'Đây là định ngữ quá khứ; hiện tại của động từ dùng -는', 1)
    if (cls === 'exist') add(attach({ base: stem, eu: true }, 'n'), '있다/없다 dùng -는, không dùng -(으)ㄴ', 1)
    return
  }

  // Đuôi -(으)
  const spec = SOFT_ENDINGS[ending]
  if (!spec) return
  const make = (s: Soft | null) => {
    if (!s) return null
    const c = attach(s, spec.kind, spec.syl)
    return c ? c + spec.after : null
  }
  const honor = ending === 'honor' || ending === 'honorPast'
  if (honor && HONOR_WORD[lex.dict]) {
    const h = HONOR_WORD[lex.dict]
    const syl = ending === 'honor' ? '세요' : '셨어요'
    add(h.base + syl, `${h.base}다 đã là kính ngữ — không thêm 시 lần nữa`, 0)
    if (p.tail) add(stem + syl, `Gốc có patchim cần 으; nhưng ${lex.dict} dùng từ kính ngữ riêng ${h.base}다`, 1)
    else add(stem + '으' + syl, `Gốc không patchim không thêm 으; nhưng ${lex.dict} dùng từ kính ngữ riêng ${h.base}다`, 1)
    if (a) add(a.inf + syl, `Kính ngữ không gắn vào dạng 아/어; ${lex.dict} dùng ${h.base}다`, 1)
    add(answer.replace(/세요$/, '새요').replace(/셨어요$/, '셧어요'), ending === 'honor' ? 'Viết 세요 (ㅔ), không phải 새요' : 'Viết 셨 (ㅆ), không phải 셧', 2)
    return
  }
  const s = soft(stem, cls)
  if (!s) return
  if (cls !== 'l') add(make({ ...s, eu: !s.eu }), s.eu ? 'Gốc có patchim → phải thêm 으' : 'Gốc không patchim → không thêm 으', cls === 'regular' || cls === 'hada' ? 1 : 0)
  if (cls === 'l') {
    add(make({ base: stem, eu: true }), 'Gốc tận cùng ㄹ không thêm 으', 0)
    if (honor) add(stem + spec.syl, 'ㄹ phải rơi trước ㅅ', 0)
  }
  if (['b', 'd', 's', 'h'].includes(cls)) add(make({ base: stem, eu: true }), regularized, 0)
  if (cls === 'd') add(make({ base: withTail(stem, 'ㄹ'), eu: false }), 'ㄷ → ㄹ rồi vẫn phải thêm 으', 0)
  if (cls === 's') add(make({ base: setLast(stem, p.lead, p.vowel), eu: false }), 'Bỏ ㅅ nhưng vẫn giữ 으, không rút gọn', 0)
  if (cls === 'h') add(make({ base: setLast(stem, p.lead, p.vowel), eu: true }), 'ㅎ bất quy tắc bỏ luôn cả 으', 0)
  if (trap) add(make(soft(stem, trap)), keepTrap, 0)
  if (a && spec.kind === 'syl') add(a.inf + spec.syl, `Đuôi -(으)${spec.syl} gắn vào gốc, không gắn vào dạng 아/어`, 1)
  if (ending === 'if' && !p.tail && cls !== 'l') add(withTail(stem, 'ㄹ') + '면', 'Đuôi -(으)면 không có ㄹ', 1)
  if (ending === 'modPast' && a) add(withTail(a.inf, 'ㅆ') + '은', 'Định ngữ quá khứ là -(으)ㄴ, không ghép 았/었 với 은', 1)
  if (ending === 'modPast') add(conjugate(lex, 'mod')?.form, '-는 là hiện tại; việc đã làm dùng -(으)ㄴ', 1)
  if (ending === 'mod' && lex.pos === 'adj') {
    add(stem + '는', 'Tính từ dùng -(으)ㄴ; -는 chỉ dành cho động từ', 1)
    if (cls === 'l') add(dropTail(stem) + '는', 'Tính từ dùng -(으)ㄴ; -는 chỉ dành cho động từ', 1)
  }
  if (ending === 'can') {
    if (!p.tail || cls === 'l' || cls === 'hada') add((cls === 'l' ? dropTail(stem) : stem) + '는 수 있어요', 'Trước 수 dùng -(으)ㄹ, không dùng -는', 1)
    add(answer.replace(/있어요$/, '있아요'), '있다 + 어요 → 있어요', 2)
  }
  if (ending === 'future') {
    add(answer.replace(/거예요$/, '거에요'), 'Viết đúng là 거예요 (것 + 이에요), không phải 거에요', 2)
    add(answer.replace(/거예요$/, '꺼예요'), 'Đọc là [꺼] nhưng viết 거', 2)
  }
  if (ending === 'honor') add(answer.replace(/세요$/, '새요'), 'Viết 세요 (ㅔ), không phải 새요', 2)
  if (ending === 'honorPast') add(answer.replace(/셨어요$/, '셧어요'), 'Viết 셨 (ㅆ), không phải 셧', 2)
}

function copulaMistakes(noun: string, ending: EndingId, answer: string, add: Add) {
  const b = hasBatchim(noun)
  switch (ending) {
    case 'present':
      add(noun + '이예요', 'Không có dạng 이예요: có patchim → 이에요, không patchim → 예요', 0)
      if (b) {
        add(noun + '예요', 'Danh từ có patchim → + 이에요', 0)
        add(noun + '에요', 'Danh từ có patchim → + 이에요', 1)
      } else {
        add(noun + '에요', 'Danh từ không patchim → + 예요', 0)
      }
      break
    case 'past':
      add(noun + '이였어요', 'Viết 이었어요 (có patchim) hoặc 였어요 (không patchim), không có 이였어요', 0)
      if (b) add(noun + '였어요', 'Danh từ có patchim → + 이었어요', 0)
      add(noun + '었어요', 'Thiếu 이: 이 + 었어요', 1)
      break
    case 'formal':
      add(noun + '이습니다', '이다 không patchim → 이 + ㅂ니다 = 입니다', 0)
      add(noun + '습니다', 'Thiếu 이: danh từ + 입니다', 1)
      break
    case 'future':
      add(noun + '이을 거예요', '이 không có patchim → + ㄹ: 일 거예요', 0)
      add(answer.replace(/거예요$/, '거에요'), 'Viết đúng là 거예요, không phải 거에요', 2)
      add(answer.replace(/거예요$/, '꺼예요'), 'Đọc là [꺼] nhưng viết 거', 2)
      break
    case 'if':
      if (b) add(noun + '면', 'Danh từ có patchim → + 이면', 0)
      add(noun + '으면', 'Danh từ + (이)면, không thêm 으', 0)
      add(noun + '이으면', '이 không có patchim → + 면', 1)
      break
  }
}

// ── Chấm câu gõ ──

export function cleanInput(s: string): string {
  return s.normalize('NFC').replace(/[.?!,~。]+\s*$/, '').replace(/\s+/g, ' ').trim()
}

export interface Check {
  ok: boolean
  spacing?: boolean
  alt?: boolean
  mistake?: Mistake
}

export function checkAnswer(c: Conj, ms: Mistake[], typed: string): Check {
  const t = cleanInput(typed)
  if (!t) return { ok: false }
  if (t === c.form) return { ok: true }
  if (c.alts.includes(t)) return { ok: true, alt: true }
  const k = squash(t)
  if (squash(c.form) === k) return { ok: true, spacing: true }
  if (c.alts.some((a) => squash(a) === k)) return { ok: true, alt: true, spacing: true }
  return { ok: false, mistake: ms.find((m) => squash(m.form) === k) }
}
