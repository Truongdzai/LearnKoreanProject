// Soát câu của các phòng luyện tiếng Anh dạng điền chỗ trống (src/features/english/*/frames.ts) trước khi build:
// id không lặp, đúng một chỗ ___, các phương án không trùng và có chứa đáp án, câu điền xong không còn ___.
// Câu viết trong TypeScript nên dịch tạm bằng esbuild (đã có sẵn cùng Vite) rồi nạp vào để kiểm.
import { readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LABS = join(ROOT, 'src', 'features', 'english')

const files = readdirSync(LABS, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(LABS, d.name, 'frames.ts')))
  .map((d) => join(LABS, d.name, 'frames.ts'))

const problems = []
let total = 0

for (const file of files) {
  const lab = file.slice(LABS.length + 1).split(/[\\/]/)[0]
  const out = await build({
    entryPoints: [file], bundle: true, write: false, format: 'esm', platform: 'node', logLevel: 'silent',
    alias: { '@': join(ROOT, 'src') },
  })
  const url = 'data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64')
  const mod = await import(url)
  if (!Array.isArray(mod.FRAMES)) continue
  const seen = new Set()
  for (const f of mod.FRAMES) {
    total++
    const where = `${lab}: "${f.en}"`
    if (seen.has(f.id)) problems.push(`${where} — id lặp`)
    seen.add(f.id)
    if ((f.en.match(/___/g) ?? []).length !== 1) problems.push(`${where} — cần đúng một chỗ ___`)
    if (!Array.isArray(f.options) || f.options.length < 2) { problems.push(`${where} — thiếu phương án`); continue }
    if (new Set(f.options).size !== f.options.length) problems.push(`${where} — phương án trùng nhau`)
    if (!f.options.includes(f.answer)) problems.push(`${where} — đáp án "${f.answer}" không nằm trong phương án`)
    if (!f.vi || !f.vi.trim()) problems.push(`${where} — thiếu câu tiếng Việt`)
    if (typeof mod.filled === 'function' && mod.filled(f).includes('___')) problems.push(`${where} — điền xong vẫn còn ___`)
  }
}

if (problems.length) {
  console.error(`[check-labs] ${problems.length} lỗi trong câu của phòng luyện:\n  ` + problems.join('\n  '))
  process.exit(1)
}
console.log(`[check-labs] Ổn: ${total} câu ở ${files.length} phòng luyện tiếng Anh.`)
