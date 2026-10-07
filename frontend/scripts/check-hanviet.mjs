// Báo chữ Hán trong kho từ tiếng Trung chưa có âm Hán–Việt (chỉ cảnh báo, không chặn build).
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const UNITS = join(ROOT, 'src', 'data', 'chinese', 'units')
const hv = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'chinese', 'hanviet.json'), 'utf8'))

const missing = new Map()
for (const f of readdirSync(UNITS).filter((x) => x.endsWith('.json'))) {
  for (const w of JSON.parse(readFileSync(join(UNITS, f), 'utf8')).words ?? []) {
    for (const c of w.zh ?? '') {
      if (/\p{Script=Han}/u.test(c) && !hv[c]) missing.set(c, w.zh)
    }
  }
}

if (missing.size) {
  console.warn(`[check-hanviet] ${missing.size} chữ chưa có âm Hán–Việt trong src/data/chinese/hanviet.json:`)
  for (const [c, word] of missing) console.warn(`  ${c} (trong ${word})`)
} else {
  console.log(`[check-hanviet] Đủ âm Hán–Việt cho ${Object.keys(hv).length} chữ.`)
}
