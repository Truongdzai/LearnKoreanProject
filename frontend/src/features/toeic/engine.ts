import {
  TOEIC_P1, TOEIC_P2, TOEIC_P3, TOEIC_P4, TOEIC_P5, TOEIC_P6, TOEIC_P7,
  SKILLS, type ScriptLine, type ToeicConvItem, type ToeicGraphic, type ToeicP1Item, type ToeicP7Item,
} from '@/data/toeicCore'
import audioManifest from '@/data/english/toeic/audioManifest.json'

const MP3_LINES = audioManifest as Record<string, number>

function mp3For(id: string): string[] | undefined {
  const n = MP3_LINES[id]
  if (!n) return undefined
  return Array.from({ length: n }, (_, i) => `/audio/toeic/${id}-${i}.mp3`)
}


export interface RunQuestion {
  key: string
  text?: string
  options: string[]
  answer: number
  skill: string
  explain?: string
  vi?: string
  trap?: string
  hideOptionText?: boolean
}

export interface RunGroup {
  id: string
  part: number
  audio?: ScriptLine[]
  mp3?: string[]
  img?: string
  graphic?: ToeicGraphic
  passage?: string
  passageTitle?: string
  intro?: string
  qStart?: number
  questions: RunQuestion[]
}

export interface RunResult {
  total: number
  correct: number
  rawL: number
  totalL: number
  rawR: number
  totalR: number
  skills: Record<string, [number, number]>
  wrong: WrongItem[]
  rightKeys: string[]
  partStats: Record<number, [number, number]>
  review: ReviewGroup[]
}

export interface WrongItem {
  key: string
  part: number
  q: string
  picked: string
  right: string
  explain?: string
  skill?: string
}

export interface ReviewQuestion {
  key: string
  num: number | null
  text?: string
  options: string[]
  answer: number
  picked: number | null
  skill: string
  explain?: string
  vi?: string
  trap?: string
}

export interface ReviewGroup {
  id: string
  part: number
  intro?: string
  passage?: string
  passageTitle?: string
  audio?: ScriptLine[]
  graphic?: ToeicGraphic
  questions: ReviewQuestion[]
}

export const BANK_SIZE =
  TOEIC_P1.length
  + TOEIC_P2.length
  + TOEIC_P3.reduce((s, c) => s + c.questions.length, 0)
  + TOEIC_P4.reduce((s, c) => s + c.questions.length, 0)
  + TOEIC_P5.length
  + TOEIC_P6.reduce((s, p) => s + p.blanks.length, 0)
  + TOEIC_P7.reduce((s, p) => s + p.questions.length, 0)

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}


function p1Group(item: ToeicP1Item): RunGroup {
  const labels = ['A', 'B', 'C', 'D']
  return {
    id: item.id,
    part: 1,
    img: item.img,
    mp3: mp3For(item.id),
    audio: [
      { s: 'M', text: 'Look at the picture.' },
      ...item.statements.map((st, i) => ({ s: 'W' as const, text: `${labels[i]}. ${st}` })),
    ],
    questions: [{
      key: item.id,
      options: item.statements,
      answer: item.answer,
      skill: item.skill,
      vi: item.vi,
      trap: item.trap,
      hideOptionText: true,
    }],
  }
}

function p2Group(item: (typeof TOEIC_P2)[number]): RunGroup {
  return {
    id: item.id,
    part: 2,
    mp3: mp3For(item.id),
    audio: [
      { s: 'W', text: item.q },
      ...item.options.map((o) => ({ s: 'M' as const, text: o })),
    ],
    questions: [{
      key: item.id,
      options: item.options,
      answer: item.answer,
      skill: item.skill,
      vi: item.vi,
      trap: item.trap,
      hideOptionText: true,
    }],
  }
}

function convGroup(item: ToeicConvItem, part: 3 | 4): RunGroup {
  return {
    id: item.id,
    part,
    intro: item.title,
    mp3: mp3For(item.id),
    audio: item.script,
    graphic: item.graphic,
    questions: item.questions.map((q, i) => ({
      key: `${item.id}-${i}`,
      text: q.q,
      options: q.options,
      answer: q.answer,
      skill: q.skill,
    })),
  }
}

function p7Group(item: ToeicP7Item): RunGroup {
  return {
    id: item.id,
    part: 7,
    passage: item.text,
    passageTitle: item.title,
    questions: item.questions.map((q, i) => ({
      key: `${item.id}-${i}`,
      text: q.q,
      options: q.options,
      answer: q.answer,
      skill: q.skill,
    })),
  }
}

export function buildPartRun(part: number, n: number): RunGroup[] {
  switch (part) {
    case 1:
      return shuffle(TOEIC_P1).slice(0, Math.min(n, TOEIC_P1.length)).map(p1Group)
    case 2:
      return shuffle(TOEIC_P2).slice(0, Math.min(n, TOEIC_P2.length)).map(p2Group)
    case 3:
      return shuffle(TOEIC_P3).slice(0, Math.max(1, Math.ceil(n / 3))).map((c) => convGroup(c, 3))
    case 4:
      return shuffle(TOEIC_P4).slice(0, Math.max(1, Math.ceil(n / 3))).map((c) => convGroup(c, 4))
    case 5:
      return shuffle(TOEIC_P5).slice(0, Math.min(n, TOEIC_P5.length)).map((item) => ({
        id: item.id,
        part: 5,
        questions: [{
          key: item.id,
          text: item.text,
          options: item.options,
          answer: item.answer,
          skill: item.skill,
          explain: item.explain,
        }],
      }))
    case 6:
      return shuffle(TOEIC_P6).slice(0, Math.max(1, Math.ceil(n / 4))).map((item) => ({
        id: item.id,
        part: 6,
        passage: item.text,
        passageTitle: item.title,
        questions: item.blanks.map((b, i) => ({
          key: `${item.id}-${i}`,
          text: `Chỗ trống (${i + 1})`,
          options: b.options,
          answer: b.answer,
          skill: b.skill,
          explain: b.explain,
        })),
      }))
    case 7: {
      const groups: RunGroup[] = []
      let count = 0
      for (const item of shuffle(TOEIC_P7)) {
        if (count >= n) break
        groups.push(p7Group(item))
        count += item.questions.length
      }
      return groups
    }
    default:
      return []
  }
}

const KIND_EN: Record<string, string> = {
  email: 'e-mail', notice: 'notice', ad: 'advertisement', chat: 'text-message chain',
  article: 'article', memo: 'memo', web: 'web page', form: 'form',
  double: 'two documents', triple: 'three documents',
  announcement: 'announcement', voicemail: 'telephone message', talk: 'talk', broadcast: 'broadcast',
  tour: 'tour information', letter: 'letter', schedule: 'schedule', review: 'online review',
}

function numberGroups(groups: RunGroup[], kinds?: Record<string, string>): RunGroup[] {
  let q = 1
  return groups.map((g) => {
    const start = q
    const end = q + g.questions.length - 1
    q = end + 1
    const next: RunGroup = { ...g, qStart: start }
    if (g.part <= 2) {
      next.audio = g.audio ? [{ s: 'M', text: `Number ${start}.` }, ...g.audio] : g.audio
    } else if (g.part <= 4) {
      const what = g.part === 3 ? 'conversation' : (kinds?.[g.id] && KIND_EN[kinds[g.id]]) || 'talk'
      const lead = `Questions ${start} through ${end} refer to the following ${what}.`
      next.audio = g.audio ? [{ s: 'M', text: lead }, ...g.audio] : g.audio
      next.intro = lead
    } else {
      const what = (kinds?.[g.id] && KIND_EN[kinds[g.id]]) || (g.part === 6 ? 'text' : 'document')
      next.intro = start === end
        ? `Question ${start} refers to the following ${what}.`
        : `Questions ${start} through ${end} refer to the following ${what}.`
      next.passageTitle = undefined
    }
    return next
  })
}

function kindMap(): Record<string, string> {
  const m: Record<string, string> = {}
  for (const t of TOEIC_P4) m[t.id] = t.kind ?? 'talk'
  for (const p of TOEIC_P6) m[p.id] = p.kind
  for (const p of TOEIC_P7) m[p.id] = p.kind
  return m
}

export function buildMiniTest(): RunGroup[] {
  const groups = [
    ...shuffle(TOEIC_P1).slice(0, 2).map(p1Group),
    ...shuffle(TOEIC_P2).slice(0, 7).map(p2Group),
    ...shuffle(TOEIC_P3).slice(0, 2).map((c) => convGroup(c, 3)),
    ...shuffle(TOEIC_P4).slice(0, 2).map((c) => convGroup(c, 4)),
    ...buildPartRun(5, 18),
    ...buildPartRun(6, 4),
    ...shuffle(TOEIC_P7.filter((p) => p.kind !== 'triple')).slice(0, 2).map(p7Group),
  ]
  return numberGroups(groups, kindMap())
}

function pickSingles29(): ToeicP7Item[] {
  const pool = TOEIC_P7.filter((p) => p.kind !== 'double' && p.kind !== 'triple')
  const threes = shuffle(pool.filter((p) => p.questions.length === 3))
  const fours = shuffle(pool.filter((p) => p.questions.length === 4))
  return shuffle([...threes.slice(0, 7), ...fours.slice(0, 2)])
}

function pickConv(pool: ToeicConvItem[], total: number, withGraphic: number): ToeicConvItem[] {
  const graphics = shuffle(pool.filter((c) => c.graphic))
  const plain = shuffle(pool.filter((c) => !c.graphic))
  const picked = [...graphics.slice(0, Math.min(withGraphic, graphics.length))]
  for (const c of [...plain, ...graphics.slice(picked.length)]) {
    if (picked.length >= total) break
    picked.push(c)
  }
  return shuffle(picked.slice(0, total))
}

export function buildFullTest(): RunGroup[] {
  const doubles = shuffle(TOEIC_P7.filter((p) => p.kind === 'double')).slice(0, 2)
  const triples = shuffle(TOEIC_P7.filter((p) => p.kind === 'triple')).slice(0, 3)
  const groups = [
    ...shuffle(TOEIC_P1).slice(0, 6).map(p1Group),
    ...shuffle(TOEIC_P2).slice(0, 25).map(p2Group),
    ...pickConv(TOEIC_P3, 13, 2).map((c) => convGroup(c, 3)),
    ...pickConv(TOEIC_P4, 10, 2).map((c) => convGroup(c, 4)),
    ...buildPartRun(5, 30),
    ...buildPartRun(6, 16),
    ...[...pickSingles29(), ...doubles, ...triples].map(p7Group),
  ]
  return numberGroups(groups, kindMap())
}

export function rebuildTest(ids: string[]): RunGroup[] {
  const groups: RunGroup[] = []
  for (const id of ids) {
    const g = groupFor(id)
    if (!g) return []
    groups.push(g)
  }
  return numberGroups(groups, kindMap())
}

export function buildWeakRun(weakSkills: string[], n: number): RunGroup[] {
  const want = new Set(weakSkills)
  const groups: RunGroup[] = []
  let count = 0
  const push = (g: RunGroup) => { groups.push(g); count += g.questions.length }

  const p5Pool = shuffle(TOEIC_P5.filter((i) => want.has(i.skill)))
  const p1Pool = shuffle(TOEIC_P1.filter((i) => want.has(i.skill)))
  const p2Pool = shuffle(TOEIC_P2.filter((i) => want.has(i.skill)))
  const convPool = shuffle([
    ...TOEIC_P3.filter((c) => c.questions.some((q) => want.has(q.skill))).map((c) => convGroup(c, 3 as const)),
    ...TOEIC_P4.filter((c) => c.questions.some((q) => want.has(q.skill))).map((c) => convGroup(c, 4 as const)),
  ])
  const p7Pool = shuffle(TOEIC_P7.filter((i) => i.questions.some((q) => want.has(q.skill))).map(p7Group))

  for (const item of p5Pool) { if (count >= n) break; push(buildFromP5(item.id)) }
  for (const item of p1Pool) { if (count >= n) break; push(p1Group(item)) }
  for (const item of p2Pool) { if (count >= n) break; push(p2Group(item)) }
  for (const g of convPool) { if (count >= n) break; push(g) }
  for (const g of p7Pool) { if (count >= n) break; push(g) }
  if (count < n) {
    for (const g of buildPartRun(5, n - count)) push(g)
  }
  return groups
}

export interface QuestionRef {
  key: string
  part: number
  label: string
  skill: string
}

function splitKey(key: string): { id: string; sub: number | null } | null {
  const m = /^(p([1-7])-\d+)(?:-(\d+))?$/.exec(key)
  if (!m) return null
  return { id: m[1], sub: m[3] != null ? Number(m[3]) : null }
}

function groupFor(id: string): RunGroup | null {
  const part = Number(id[1])
  switch (part) {
    case 1: {
      const it = TOEIC_P1.find((x) => x.id === id)
      return it ? p1Group(it) : null
    }
    case 2: {
      const it = TOEIC_P2.find((x) => x.id === id)
      return it ? p2Group(it) : null
    }
    case 3: {
      const it = TOEIC_P3.find((x) => x.id === id)
      return it ? convGroup(it, 3) : null
    }
    case 4: {
      const it = TOEIC_P4.find((x) => x.id === id)
      return it ? convGroup(it, 4) : null
    }
    case 5:
      return TOEIC_P5.some((x) => x.id === id) ? buildFromP5(id) : null
    case 6: {
      const it = TOEIC_P6.find((x) => x.id === id)
      if (!it) return null
      return {
        id: it.id,
        part: 6,
        passage: it.text,
        passageTitle: it.title,
        questions: it.blanks.map((b, i) => ({
          key: `${it.id}-${i}`,
          text: `Chỗ trống (${i + 1})`,
          options: b.options,
          answer: b.answer,
          skill: b.skill,
          explain: b.explain,
        })),
      }
    }
    case 7: {
      const it = TOEIC_P7.find((x) => x.id === id)
      return it ? p7Group(it) : null
    }
    default:
      return null
  }
}

export function lookupQuestion(key: string): QuestionRef | null {
  const parsed = splitKey(key)
  if (!parsed) return null
  const g = groupFor(parsed.id)
  if (!g) return null
  const q = g.questions.find((x) => x.key === key)
  if (!q) return null
  const label = q.text ?? q.vi ?? '(câu nghe)'
  return { key, part: g.part, label, skill: q.skill }
}

export function buildReviewRun(keys: string[], max: number): RunGroup[] {
  const wanted = new Map<string, Set<string>>()
  for (const key of keys) {
    const parsed = splitKey(key)
    if (!parsed) continue
    const set = wanted.get(parsed.id) ?? new Set<string>()
    set.add(key)
    wanted.set(parsed.id, set)
  }

  const groups: RunGroup[] = []
  let count = 0
  for (const id of shuffle([...wanted.keys()])) {
    if (count >= max) break
    const g = groupFor(id)
    if (!g) continue
    const keep = g.questions.filter((q) => wanted.get(id)!.has(q.key))
    if (!keep.length) continue
    groups.push({ ...g, questions: keep })
    count += keep.length
  }
  return groups
}

function buildFromP5(id: string): RunGroup {
  const item = TOEIC_P5.find((x) => x.id === id)!
  return {
    id: item.id,
    part: 5,
    questions: [{
      key: item.id,
      text: item.text,
      options: item.options,
      answer: item.answer,
      skill: item.skill,
      explain: item.explain,
    }],
  }
}


export function scoreRun(groups: RunGroup[], answers: Record<string, number>): RunResult {
  const skills: Record<string, [number, number]> = {}
  const partStats: Record<number, [number, number]> = {}
  const wrong: WrongItem[] = []
  const rightKeys: string[] = []
  const review: ReviewGroup[] = []
  let correct = 0, total = 0, rawL = 0, totalL = 0, rawR = 0, totalR = 0

  for (const g of groups) {
    const listening = g.part <= 4
    const reviewQs: ReviewQuestion[] = []
    for (let qi = 0; qi < g.questions.length; qi++) {
      const q = g.questions[qi]
      total += 1
      if (listening) totalL += 1
      else totalR += 1
      const picked = answers[q.key] != null ? answers[q.key] : null
      const ok = picked === q.answer
      if (ok) {
        correct += 1
        rightKeys.push(q.key)
        if (listening) rawL += 1
        else rawR += 1
      } else {
        wrong.push({
          key: q.key,
          part: g.part,
          q: q.text ?? q.vi ?? '(câu nghe)',
          picked: picked != null ? q.options[picked] : '(bỏ trống)',
          right: q.options[q.answer],
          explain: q.explain ?? q.trap,
          skill: q.skill,
        })
      }
      const s = skills[q.skill] ?? [0, 0]
      s[1] += 1
      if (ok) s[0] += 1
      skills[q.skill] = s
      const p = partStats[g.part] ?? [0, 0]
      p[1] += 1
      if (ok) p[0] += 1
      partStats[g.part] = p
      reviewQs.push({
        key: q.key,
        num: g.qStart != null ? g.qStart + qi : null,
        text: q.text,
        options: q.options,
        answer: q.answer,
        picked,
        skill: q.skill,
        explain: q.explain,
        vi: q.vi,
        trap: q.trap,
      })
    }
    review.push({
      id: g.id,
      part: g.part,
      intro: g.intro,
      passage: g.passage,
      passageTitle: g.passageTitle,
      audio: g.audio,
      graphic: g.graphic,
      questions: reviewQs,
    })
  }
  return { total, correct, rawL, totalL, rawR, totalR, skills, wrong, rightKeys, partStats, review }
}


export interface SkillStat {
  skill: string
  vi: string
  group: 'listening' | 'grammar' | 'reading'
  advice: string
  correct: number
  total: number
  pct: number
}

export function skillStats(allSkills: Record<string, [number, number]>[]): SkillStat[] {
  const merged: Record<string, [number, number]> = {}
  for (const rec of allSkills) {
    for (const [k, [c, t]] of Object.entries(rec)) {
      const m = merged[k] ?? [0, 0]
      m[0] += c
      m[1] += t
      merged[k] = m
    }
  }
  return Object.entries(merged)
    .filter(([k]) => SKILLS[k])
    .map(([k, [c, t]]) => ({
      skill: k,
      vi: SKILLS[k].vi,
      group: SKILLS[k].group,
      advice: SKILLS[k].advice,
      correct: c,
      total: t,
      pct: t ? Math.round((c / t) * 100) : 0,
    }))
    .sort((a, b) => a.pct - b.pct || b.total - a.total)
}

export function weakestSkills(stats: SkillStat[], max = 3): SkillStat[] {
  return stats.filter((s) => s.total >= 3 && s.pct < 80).slice(0, max)
}
