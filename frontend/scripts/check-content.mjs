// Soát dữ liệu bài tập trước khi build: đáp án phải trỏ đúng một lựa chọn có thật,
// các lựa chọn không được trùng nhau, id trong cùng một danh sách không được lặp.
// Lỗi kiểu này không làm vỡ build nhưng khiến người học bị chấm sai.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DATA = join(ROOT, 'src', 'data')

const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f)
  return statSync(p).isDirectory() ? walk(p) : p.endsWith('.json') ? [p] : []
})

const problems = []
let questions = 0

function visit(node, file, path) {
  if (Array.isArray(node)) {
    const ids = node.filter((x) => x && typeof x === 'object' && typeof x.id === 'string').map((x) => x.id)
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i)
    if (dup.length) problems.push(`${file} ${path}: id trùng ${[...new Set(dup)].join(', ')}`)
    node.forEach((x, i) => visit(x, file, `${path}[${i}]`))
    return
  }
  if (!node || typeof node !== 'object') return
  if (Array.isArray(node.options) && typeof node.answer === 'number') {
    questions++
    const opts = node.options
    const where = `${file} ${path}${node.id ? ` (${node.id})` : ''}`
    if (opts.length < 2) problems.push(`${where}: chỉ có ${opts.length} lựa chọn`)
    if (!Number.isInteger(node.answer) || node.answer < 0 || node.answer >= opts.length) {
      problems.push(`${where}: answer=${node.answer} nằm ngoài ${opts.length} lựa chọn`)
    }
    const norm = opts.map((o) => (typeof o === 'string' ? o.trim().toLowerCase() : JSON.stringify(o)))
    if (norm.some((o) => o === '' || o === '""')) problems.push(`${where}: có lựa chọn rỗng`)
    const dupOpt = norm.filter((o, i) => norm.indexOf(o) !== i)
    if (dupOpt.length) problems.push(`${where}: lựa chọn trùng "${dupOpt[0]}"`)
  }
  for (const [k, v] of Object.entries(node)) visit(v, file, path ? `${path}.${k}` : k)
}

for (const f of walk(DATA)) visit(JSON.parse(readFileSync(f, 'utf8')), relative(ROOT, f), '')

if (problems.length) {
  console.error(`[check-content] ${problems.length} lỗi dữ liệu bài tập:`)
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}
console.log(`[check-content] Ổn: ${questions} câu hỏi trắc nghiệm, đáp án và lựa chọn hợp lệ.`)
