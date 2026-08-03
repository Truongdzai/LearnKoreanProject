import type { EtsConv, EtsConvQuestion, EtsTest } from '@/data/english/toeic/etsTests'
import type { RunGroup, RunQuestion } from './engine'

const WH = /^(who|what|where|when|why|which|how)\b/i
const YESNO = /^(do|does|did|is|are|was|were|have|has|had|can|could|will|would|should|shall|may|must|am)\b/i
const TAG = /,\s*(is|are|was|were|do|does|did|have|has|can|could|will|would|should|isn't|aren't|don't|doesn't|didn't|haven't|hasn't|won't|wouldn't|shouldn't)\s+\w+\?$/i

function part2Skill(q: string): string {
  const text = q.trim()
  if (TAG.test(text)) return 'l-yesno'
  if (/\bor\b/i.test(text) && !WH.test(text)) return 'l-choice'
  if (WH.test(text)) return 'l-wh'
  if (YESNO.test(text)) return 'l-yesno'
  return 'l-statement'
}

function convSkill(q: string): string {
  const text = q.toLowerCase()
  if (text.includes('look at the graphic')) return 'l-graphic'
  if (text.includes('mainly about') || text.includes('what is the topic')) return 'l-main'
  if (text.includes('purpose') || text.includes('why is the') || text.includes('where does')
    || text.includes('who most likely') || text.includes('where are the speakers')) return 'l-purpose'
  if (text.includes('imply') || text.includes('most likely') || text.includes('suggest')
    || text.includes('mean when')) return 'l-infer'
  return 'l-detail'
}

const PREPS = new Set(['in', 'on', 'at', 'by', 'for', 'to', 'from', 'with', 'about', 'under',
  'over', 'into', 'onto', 'during', 'within', 'without', 'between', 'among', 'across',
  'through', 'toward', 'towards', 'until', 'since', 'against', 'beside', 'behind', 'inside'])
const CONJS = new Set(['although', 'because', 'while', 'whereas', 'however', 'therefore',
  'moreover', 'nevertheless', 'unless', 'since', 'so that', 'even though', 'in addition',
  'furthermore', 'otherwise', 'meanwhile', 'as a result', 'for example'])
const PRONOUNS = new Set(['he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
  'they', 'them', 'their', 'theirs', 'themselves', 'it', 'its', 'itself', 'we', 'us', 'our',
  'ours', 'ourselves', 'i', 'me', 'my', 'mine', 'myself', 'you', 'your', 'yours', 'yourself'])

function sharedStem(options: string[]): boolean {
  const words = options.map((o) => o.toLowerCase().split(/\s+/)[0] ?? '')
  if (words.some((w) => w.length < 4)) return false
  const prefix = words.reduce((acc, w) => {
    let i = 0
    while (i < acc.length && i < w.length && acc[i] === w[i]) i++
    return acc.slice(0, i)
  })
  return prefix.length >= 4
}

function part5Skill(options: string[]): string {
  const low = options.map((o) => o.trim().toLowerCase())
  if (low.every((o) => PREPS.has(o))) return 'prep'
  if (low.every((o) => PRONOUNS.has(o))) return 'pronoun'
  if (low.some((o) => CONJS.has(o))) return 'conj'
  if (sharedStem(low)) return 'word-form'
  return 'vocab'
}

function joinVi(parts: string[]): string | undefined {
  const clean = parts.filter(Boolean)
  if (!clean.length) return undefined
  return clean.map((s, i) => `(${'ABCD'[i]}) ${s}`).join(' · ')
}

function convGroup(conv: EtsConv, part: 3 | 4, id: string): RunGroup {
  const needsGraphic = conv.questions.some((q: EtsConvQuestion) =>
    /look at the graphic/i.test(q.q))
  return {
    id,
    part,
    mp3: [conv.mp3],
    audio: conv.script,
    qStart: conv.ns[0],
    needsGraphic,
    questions: conv.questions.map((q, i) => ({
      key: `${id}-${i}`,
      text: q.q,
      options: q.options,
      answer: q.answer ?? 0,
      skill: convSkill(q.q),
      vi: q.viQ || undefined,
      explain: joinVi(q.viOptions),
    })),
  }
}

export interface EtsSection {
  groups: RunGroup[]
  skipped: { part1: number }
}

export function buildEtsListening(doc: EtsTest): EtsSection {
  const { p1, p2, p3, p4 } = doc.listening
  const groups: RunGroup[] = []
  const withPhoto = p1.filter((item) => item.img)

  withPhoto.forEach((item) => {
    groups.push({
      id: `${doc.id}-p1-${item.n}`,
      part: 1,
      img: item.img,
      mp3: [item.mp3],
      audio: [
        { s: 'M', text: `Number ${item.n}. Look at the picture.` },
        ...item.statements.map((s, i) => ({ s: 'W' as const, text: `${'ABCD'[i]}. ${s}` })),
      ],
      qStart: item.n,
      questions: [{
        key: `${doc.id}-p1-${item.n}`,
        options: item.statements,
        answer: item.answer ?? 0,
        skill: 'l-photo',
        hideOptionText: true,
        explain: joinVi(item.vi),
      }],
    })
  })

  p2.forEach((item) => {
    groups.push({
      id: `${doc.id}-p2-${item.n}`,
      part: 2,
      mp3: [item.mp3],
      audio: [{ s: 'W', text: item.q }, ...item.options.map((o) => ({ s: 'M' as const, text: o }))],
      qStart: item.n,
      questions: [{
        key: `${doc.id}-p2-${item.n}`,
        options: item.options,
        answer: item.answer ?? 0,
        skill: part2Skill(item.q),
        hideOptionText: true,
        vi: item.viQ || undefined,
        explain: joinVi(item.viOptions),
      }],
    })
  })
  p3.forEach((c) => groups.push(convGroup(c, 3, `${doc.id}-p3-${c.ns[0]}`)))
  p4.forEach((c) => groups.push(convGroup(c, 4, `${doc.id}-p4-${c.ns[0]}`)))

  return { groups, skipped: { part1: p1.length - withPhoto.length } }
}

export function buildEtsPart5(doc: EtsTest): RunGroup[] {
  return doc.reading.p5.filter((item) => item.text && item.options.length === 4).map((item) => {
    const question: RunQuestion = {
      key: `${doc.id}-p5-${item.n}`,
      text: item.text,
      options: item.options,
      answer: item.answer ?? 0,
      skill: part5Skill(item.options),
      explain: item.explain || undefined,
    }
    return { id: `${doc.id}-p5-${item.n}`, part: 5, qStart: item.n, questions: [question] }
  })
}
