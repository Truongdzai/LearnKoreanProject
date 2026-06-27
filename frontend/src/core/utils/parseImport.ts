/**
 * Trích xuất danh sách từ vựng từ văn bản dán tay hoặc tệp tải lên
 * (.txt / .csv / .md / .docx, và cố gắng đọc .pdf) — không cần thư viện ngoài.
 *
 * Mỗi dòng được hiểu là: <từ> <dấu phân cách> <nghĩa>
 * Dấu phân cách chấp nhận: tab, "  -  ", " — ", " : ", ",", "=", "|".
 */

export interface ParsedWord {
  front: string
  back: string
}

const SPLITTERS = ['\t', ' — ', ' – ', ' - ', ' : ', ' = ', '|', ';', ',', '=', ':', ' - ']

function splitLine(line: string): ParsedWord | null {
  const raw = line.trim()
  if (!raw || raw.length < 1) return null
  for (const sep of SPLITTERS) {
    const idx = raw.indexOf(sep)
    if (idx > 0) {
      const front = raw.slice(0, idx).trim()
      const back = raw.slice(idx + sep.length).trim()
      if (front) return { front, back }
    }
  }
  // No separator → treat the whole line as a term with no meaning yet.
  return { front: raw, back: '' }
}

/** Biến văn bản nhiều dòng thành danh sách từ (đã loại trùng theo từ). */
export function parseWordsFromText(text: string): ParsedWord[] {
  const seen = new Set<string>()
  const out: ParsedWord[] = []
  for (const line of (text || '').split(/\r?\n/)) {
    const w = splitLine(line)
    if (!w) continue
    const key = w.front.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(w)
  }
  return out
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&')
}

async function inflate(data: Uint8Array, format: 'deflate' | 'deflate-raw'): Promise<Uint8Array> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const DS = (globalThis as any).DecompressionStream
  if (!DS) throw new Error('Trình duyệt không hỗ trợ giải nén.')
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DS(format))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Đọc text từ tệp .docx (ZIP chứa word/document.xml). */
async function extractDocx(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer())
  const dv = new DataView(buf.buffer)
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new Error('Tệp .docx không hợp lệ.')
  const cdOffset = dv.getUint32(eocd + 16, true)
  const count = dv.getUint16(eocd + 10, true)
  const dec = new TextDecoder()
  let p = cdOffset
  let target: { method: number; compSize: number; localOff: number } | null = null
  for (let n = 0; n < count; n++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break
    const method = dv.getUint16(p + 10, true)
    const compSize = dv.getUint32(p + 20, true)
    const nameLen = dv.getUint16(p + 28, true)
    const extraLen = dv.getUint16(p + 30, true)
    const commentLen = dv.getUint16(p + 32, true)
    const localOff = dv.getUint32(p + 42, true)
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen))
    if (name === 'word/document.xml') { target = { method, compSize, localOff }; break }
    p += 46 + nameLen + extraLen + commentLen
  }
  if (!target) throw new Error('Không tìm thấy nội dung trong .docx.')
  const lnameLen = dv.getUint16(target.localOff + 26, true)
  const lextraLen = dv.getUint16(target.localOff + 28, true)
  const dataStart = target.localOff + 30 + lnameLen + lextraLen
  const comp = buf.subarray(dataStart, dataStart + target.compSize)
  const raw = target.method === 0 ? comp : await inflate(comp, 'deflate-raw')
  const xml = dec.decode(raw)
  const withBreaks = xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:tab\b[^>]*\/?>/g, '\t')
    .replace(/<w:br\b[^>]*\/?>/g, '\n')
  return decodeXmlEntities(withBreaks.replace(/<[^>]+>/g, ''))
}

function latin1(bytes: Uint8Array): string {
  let s = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    s += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return s
}

function pdfOps(content: string): string {
  // Pull text out of (...) literals; insert breaks on text-show operators.
  let out = ''
  const re = /\((?:\\.|[^\\()])*\)|\bTd\b|\bTD\b|\bT\*\b|'|"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(content))) {
    const tok = m[0]
    if (tok.startsWith('(')) {
      out += tok.slice(1, -1)
        .replace(/\\(\d{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
        .replace(/\\([()\\nrt])/g, (_, c) => ({ n: '\n', r: '\r', t: '\t', '(': '(', ')': ')', '\\': '\\' } as Record<string, string>)[c] ?? c)
    } else {
      out += '\n'
    }
  }
  return out
}

/** Cố gắng đọc text từ .pdf (chỉ hiệu quả với PDF dạng text, không quét ảnh). */
async function extractPdf(file: File): Promise<string> {
  const buf = new Uint8Array(await file.arrayBuffer())
  const latin = latin1(buf)
  let text = ''
  const re = /stream\r?\n/g
  let m: RegExpExecArray | null
  while ((m = re.exec(latin))) {
    const start = m.index + m[0].length
    const end = latin.indexOf('endstream', start)
    if (end < 0) continue
    const slice = buf.subarray(start, end)
    try {
      const raw = await inflate(slice, 'deflate')
      text += pdfOps(latin1(raw)) + '\n'
    } catch {
      text += pdfOps(latin.slice(start, end)) + '\n'
    }
  }
  if (!text.trim()) text = pdfOps(latin)
  return text
}

/** Đọc bất kỳ tệp được hỗ trợ nào thành văn bản thô. */
export async function readFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase()
  if (name.endsWith('.docx')) return extractDocx(file)
  if (name.endsWith('.pdf')) return extractPdf(file)
  return file.text()
}
