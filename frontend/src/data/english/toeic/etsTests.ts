import type { ScriptLine } from '@/data/toeicCore'

export interface EtsIndexItem {
  id: string
  test: number
  name: string
  listening: number
  part1: number
  part5: number
}

export interface EtsPhoto {
  n: number
  statements: string[]
  answer: number | null
  vi: string[]
  mp3: string
  img?: string
}

export interface EtsResponse {
  n: number
  q: string
  options: string[]
  answer: number | null
  viQ: string
  viOptions: string[]
  mp3: string
}

export interface EtsConvQuestion {
  n: number
  q: string
  options: string[]
  answer: number | null
  viQ: string
  viOptions: string[]
}

export interface EtsConv {
  ns: number[]
  script: ScriptLine[]
  viScript: string
  questions: EtsConvQuestion[]
  mp3: string
}

export interface EtsBlank {
  n: number
  text: string
  options: string[]
  answer: number | null
  explain: string
}

export interface EtsTest {
  id: string
  test: number
  name: string
  listening: { p1: EtsPhoto[]; p2: EtsResponse[]; p3: EtsConv[]; p4: EtsConv[] }
  reading: { p5: EtsBlank[] }
}

const indexModule = import.meta.glob<{ default: EtsIndexItem[] }>('./ets/index.json', {
  eager: true,
})
const testModules = import.meta.glob<{ default: EtsTest }>('./ets/t*.json')

export const ETS_TESTS: EtsIndexItem[] =
  Object.values(indexModule)[0]?.default ?? []

const cache = new Map<number, Promise<EtsTest>>()

export function loadEtsTest(test: number): Promise<EtsTest> {
  const hit = cache.get(test)
  if (hit) return hit
  const load = testModules[`./ets/t${String(test).padStart(2, '0')}.json`]
  if (!load) return Promise.reject(new Error(`Không có đề ETS số ${test}`))
  const p = load().then((m) => m.default)
  cache.set(test, p)
  return p
}
