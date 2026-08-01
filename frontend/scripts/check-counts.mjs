import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'src', 'data')

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const jsonFiles = (dir) => readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f))

function unitStats(dir) {
  const files = jsonFiles(dir)
  const words = files.reduce((n, f) => n + (readJson(f).words?.length ?? 0), 0)
  return { units: files.length, words }
}

const en = unitStats(join(DATA, 'english', 'units'))
const ko = unitStats(join(DATA, 'korean', 'units'))
const zh = unitStats(join(DATA, 'chinese', 'units'))

function videoCounts() {
  const py = readFileSync(join(ROOT, '..', 'backend', 'services', 'catalog.py'), 'utf8')
  const per = {}
  for (const [, lang, body] of py.matchAll(/DEFAULT_([A-Z]{2})_VIDEOS = \[([\s\S]*?)\n\]/g)) {
    per[lang.toLowerCase()] = (body.match(/^\s*\("/gm) ?? []).length
  }
  if (!per.ko || !per.en) throw new Error('check-counts: không đọc được DEFAULT_*_VIDEOS trong catalog.py')
  return { ...per, total: Object.values(per).reduce((a, b) => a + b, 0) }
}

const vid = videoCounts()

const actual = {
  enWords: en.words,
  enUnits: en.units,
  enGrammar: readJson(join(DATA, 'english', 'grammar', 'lessons.json')).length,
  koWords: ko.words,
  koUnits: ko.units,
  zhWords: zh.words,
  zhUnits: zh.units,
  topikCapsules: readJson(join(DATA, 'korean', 'topik', 'grammar.json')).length,
  videos: vid.total,
  koVideos: vid.ko,
  enVideos: vid.en,
}

const src = readFileSync(join(DATA, 'counts.ts'), 'utf8')
const declared = Object.fromEntries(
  [...src.matchAll(/(\w+):\s*(\d+)/g)].map(([, k, v]) => [k, Number(v)]),
)

const wrong = Object.entries(actual).filter(([k, v]) => declared[k] !== v)
if (wrong.length) {
  console.error('\n[check-counts] src/data/counts.ts đã lệch với dữ liệu thật:')
  for (const [k, v] of wrong) console.error(`  ${k}: ghi ${declared[k]} — đếm được ${v}`)
  console.error('Sửa lại counts.ts rồi build lại.\n')
  process.exit(1)
}

console.log(`[check-counts] Khớp: EN ${actual.enWords} từ/${actual.enUnits} chủ đề · `
  + `KO ${actual.koWords} từ/${actual.koUnits} chủ đề · `
  + `${actual.enGrammar} bài ngữ pháp EN · ${actual.topikCapsules} viên TOPIK · `
  + `ZH ${actual.zhWords} từ/${actual.zhUnits} chủ đề · `
  + `${actual.videos} video (KO ${actual.koVideos}, EN ${actual.enVideos}).`)

const terms = {}
for (const f of jsonFiles(join(DATA, 'english', 'units'))) {
  const u = readJson(f)
  terms[u.id] = (u.words ?? []).map((w) => w.en ?? '')
}
const outFile = join(DATA, 'english', 'unitTerms.json')
const next = JSON.stringify(terms)
let prev = ''
try { prev = readFileSync(outFile, 'utf8') } catch {  }
if (prev !== next) {
  writeFileSync(outFile, next, 'utf8')
  console.log(`[check-counts] Đã dựng lại unitTerms.json (${actual.enUnits} chủ đề, ${Math.round(next.length / 1024)} KB).`)
}
