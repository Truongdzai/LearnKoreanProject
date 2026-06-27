/**
 * Xuất danh sách từ vựng ra Word (.doc) và PDF — không cần thư viện ngoài.
 *  - Word : tạo file HTML hợp lệ với Word rồi tải về dưới dạng .doc.
 *  - PDF  : mở cửa sổ in được định dạng đẹp, người dùng chọn "Lưu thành PDF".
 *
 * Dùng chung cho mọi ngôn ngữ (tiếng Anh, tiếng Hàn…) để giữ feature parity.
 */

export interface ExportRow {
  /** Từ chính (en/ko…) */
  term: string
  /** Phiên âm / IPA (tuỳ chọn) */
  reading?: string
  /** Nghĩa */
  meaning: string
  /** Ví dụ (tuỳ chọn) */
  example?: string
  /** Nhóm / chủ đề (tuỳ chọn) */
  group?: string
}

const esc = (s: string): string =>
  (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function buildTableRows(rows: ExportRow[]): string {
  return rows
    .map((r, i) => {
      const term = esc(r.term) + (r.reading ? ` <span class="ipa">${esc(r.reading)}</span>` : '')
      const ex = r.example ? `<div class="ex">“${esc(r.example)}”</div>` : ''
      const grp = r.group ? `<div class="grp">${esc(r.group)}</div>` : ''
      return `<tr>
        <td class="num">${i + 1}</td>
        <td class="term">${term}${grp}</td>
        <td class="mean">${esc(r.meaning)}${ex}</td>
      </tr>`
    })
    .join('')
}

function buildHtml(title: string, rows: ExportRow[]): string {
  const date = new Date().toLocaleDateString('vi-VN')
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
  <style>
    body{font-family:"Segoe UI",Arial,sans-serif;color:#1a2238;padding:28px}
    h1{font-size:22px;margin:0 0 4px;color:#2563eb}
    .meta{color:#667;font-size:13px;margin-bottom:18px}
    table{border-collapse:collapse;width:100%}
    th,td{border:1px solid #cdd6e6;padding:9px 11px;vertical-align:top;text-align:left;font-size:14px}
    th{background:#eef3fb;color:#2563eb;font-size:12px;text-transform:uppercase;letter-spacing:.04em}
    td.num{width:38px;color:#8a97ad;text-align:center}
    td.term{width:34%;font-weight:700}
    .ipa{font-weight:400;color:#8a97ad;font-size:12px}
    .grp{font-weight:400;color:#8a97ad;font-size:11px;margin-top:2px}
    .ex{font-weight:400;color:#556;font-size:12.5px;margin-top:4px;font-style:italic}
    tr:nth-child(even) td{background:#fafbff}
  </style></head>
  <body>
    <h1>${esc(title)}</h1>
    <div class="meta">VyLing · Xuất ngày ${date} · ${rows.length} từ</div>
    <table>
      <thead><tr><th>#</th><th>Từ vựng</th><th>Nghĩa &amp; ví dụ</th></tr></thead>
      <tbody>${buildTableRows(rows)}</tbody>
    </table>
  </body></html>`
}

const slug = (s: string): string =>
  ((s || 'tu-vung')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')) || 'tu-vung'

/** Tải danh sách từ về máy dưới dạng file Word (.doc). */
export function exportVocabToWord(title: string, rows: ExportRow[]): void {
  if (!rows.length) return
  const html = buildHtml(title, rows)
  const blob = new Blob(['﻿', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug(title)}.doc`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}

/** Mở cửa sổ in để người dùng lưu thành PDF. */
export function exportVocabToPdf(title: string, rows: ExportRow[]): void {
  if (!rows.length) return
  const html = buildHtml(title, rows)
  const w = window.open('', '_blank')
  if (!w) {
    alert('Trình duyệt chặn cửa sổ in. Hãy cho phép pop-up rồi thử lại.')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => {
    w.print()
  }, 350)
}
