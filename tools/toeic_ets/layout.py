import re
import unicodedata
from pathlib import Path

from pypdf import PdfReader

HEADER = re.compile(r"ETS\s+20\d\d\s+(LISTENING|READING)\s+TEST")
PAGE_NO = re.compile(r"^\s*\d{1,3}\s*$")

SPANNING = re.compile(
    r"^\s*(PART\s*\d|SCRIPT\s+AND\s+KEY|S*TT\b|Bộ\s+câu|Transcript\b|Đáp\s*$|án\s*$|Key\s*$"
    r"|Dịch\s+(nghĩa\s+)?tiếng\s+Việt|Nội\s+dung\s+đề|Đáp\s+án\s+và\s+giải\s+thích"
    r"|TEST\s*\d+\s*[-–]?\s*KEY|KEY\s+AND\s+EXPLANATION|Question\s+\d{3})",
    re.IGNORECASE,
)
HEAD_WORDS = ("stt", "script", "transcript", "key", "đáp án", "dịch", "bộ câu", "nội dung đề")

HEAD_FRAGMENTS = {
    "stt", "sstt", "key", "script", "transcript", "bộ", "câu", "đáp", "án", "dịch",
    "nghĩa", "tiếng", "việt", "nội", "dung", "đề", "và", "giải", "thích", "part",
}
BREAK = "\x00"

GAP = re.compile(r"\S {5,}\S")

def prose_lines(lines: list[str]) -> set[int]:

    out = set()
    for i, ln in enumerate(lines):
        stripped = ln.strip()
        indent = len(ln) - len(ln.lstrip())
        if indent <= 2 and len(stripped) > 60 and not GAP.search(stripped):
            out.add(i)
    return out

def is_header_line(s: str) -> bool:
    low = s.lower()
    if sum(1 for w in HEAD_WORDS if w in low) >= 2 or SPANNING.match(s):
        return True
    words = low.replace(".", " ").split()
    return bool(words) and len(words) <= 6 and all(w in HEAD_FRAGMENTS for w in words)
VI_MARKS = set("ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ")

FIX = {
    "ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl",
    "’": "'", "‘": "'", "“": '"', "”": '"', " ": " ",
}

def _fix(s: str) -> str:
    for a, b in FIX.items():
        s = s.replace(a, b)
    return s

def vi_ratio(s: str) -> float:
    letters = [c for c in s.lower() if c.isalpha()]
    if not letters:
        return 0.0
    marked = sum(1 for c in letters if c in VI_MARKS)
    return marked / len(letters)

def page_lines(page) -> list[str]:
    raw = page.extract_text(extraction_mode="layout") or ""
    out = []
    for ln in _fix(raw).split("\n"):
        stripped = ln.strip()
        if not stripped:
            out.append("")
            continue
        if HEADER.search(stripped) and len(stripped) < 60:
            out.append("")
            continue
        if PAGE_NO.match(stripped):
            out.append("")
            continue
        if is_header_line(stripped):
            out.append(BREAK + stripped)
            continue
        out.append(ln.rstrip())
    return out

def gutters(lines: list[str], min_width: int = 3, tolerance: float = 0.0) -> list[tuple[int, int]]:

    width = max((len(l) for l in lines), default=0)
    if not width:
        return []
    body = [l for l in lines if l.strip()]
    limit = tolerance * len(body)
    hits = [0] * (width + 1)
    for ln in body:
        for i, ch in enumerate(ln):
            if ch != " ":
                hits[i] += 1
    runs = []
    start = None
    for i in range(width + 1):
        if hits[i] <= limit:
            if start is None:
                start = i
        else:
            if start is not None and i - start >= min_width:
                runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, width + 1))
    return runs

def columns(lines: list[str], preset: list[tuple[int, int]] | None = None,
            tolerance: float = 0.0) -> list[tuple[int, int]]:
    if preset:
        return [c for c in preset if any(ln[c[0]:c[1]].strip() for ln in lines)]
    gaps = gutters(lines, tolerance=tolerance)
    width = max((len(l) for l in lines), default=0)
    cols = []
    pos = 0
    for a, b in gaps:
        if a > pos:
            cols.append((pos, a))
        pos = b
    if pos < width:
        cols.append((pos, width))
    return cols

def cell(lines: list[str], col: tuple[int, int], lo: int, hi: int) -> str:
    a, b = col
    parts = []
    for ln in lines[lo:hi]:
        chunk = ln[a:b].strip()
        parts.append(chunk)
    text = "\n".join(parts)
    text = re.sub(r"\n{2,}", "\n", text).strip()
    return text

WIDE = 20
DIGIT_CELL = re.compile(r"^\d{1,3}\s*[-–]?\s*\d{0,3}$")
KEY_CELL = re.compile(r"^[\(\)A-D0-9:.\s]+$")

def col_cells(lines: list[str], col: tuple[int, int]) -> list[str]:
    return [c for c in (ln[col[0]:col[1]].strip() for ln in lines) if c]

def _mostly(cells: list[str], pattern: re.Pattern) -> bool:
    if not cells:
        return False
    hits = sum(1 for c in cells if pattern.match(c))
    return hits / len(cells) >= 0.6

def classify(lines: list[str], cols: list[tuple[int, int]]) -> dict:

    role: dict[str, tuple[int, int] | None] = {"num": None, "en": None, "key": None, "vi": None}
    if not cols:
        return role
    cols = sorted(cols)
    wide = [c for c in cols if c[1] - c[0] >= WIDE]
    if not wide:
        role["en"] = (cols[0][0], cols[-1][1])
        return role

    prose = sorted(wide, key=lambda c: c[1] - c[0], reverse=True)[:2]
    prose.sort()
    first = prose[0]
    end = cols[-1][1]

    num_end = 0
    for c in cols:
        if c[1] > first[0]:
            break
        if not _mostly(col_cells(lines, c), DIGIT_CELL):
            break
        num_end = c[1]
    if num_end:
        role["num"] = (0, num_end)

    if len(prose) == 1:
        body = "\n".join(ln[first[0]:first[1]] for ln in lines)
        role["vi" if vi_ratio(body) > 0.08 else "en"] = (num_end, end)
        return role

    second = prose[1]
    key = None
    for c in cols:
        if c[0] >= first[1] and c[1] <= second[0] and _mostly(col_cells(lines, c), KEY_CELL):
            key = c
            break
    role["key"] = key

    left = (num_end, key[0] if key else second[0])
    right = (key[1] if key else second[0], end)
    a = "\n".join(ln[left[0]:left[1]] for ln in lines)
    b = "\n".join(ln[right[0]:right[1]] for ln in lines)
    if vi_ratio(a) > vi_ratio(b):
        role["vi"], role["en"] = left, right
    else:
        role["en"], role["vi"] = left, right
    return role

ROW_NUM = re.compile(r"^\s*(\d{1,3})\s*[-–]?\s*(\d{1,3})?\b")

def page_rows(lines: list[str], preset: list[tuple[int, int]] | None = None) -> list[dict]:

    out: list[dict] = []
    segment: list[str] = []
    for ln in lines + [BREAK]:
        if ln.startswith(BREAK):
            out.extend(split_prose(segment, preset))
            segment = []
            note = ln[len(BREAK):].strip()
            if note:
                out.append(note_row(note))
            continue
        segment.append(ln)
    return out

def note_row(text: str) -> dict:
    return {"num": None, "span": None, "note": text, "en": "", "key": "", "vi": "", "head": ""}

def split_prose(lines: list[str], preset: list[tuple[int, int]] | None) -> list[dict]:

    if not any(l.strip() for l in lines):
        return []
    prose = prose_lines(lines)
    out: list[dict] = []
    chunk: list[str] = []
    para: list[str] = []

    def flush_chunk():
        if any(l.strip() for l in chunk):
            out.extend(segment_rows(chunk, preset))
        chunk.clear()

    def flush_para():
        if para:
            out.append(note_row(" ".join(para)))
            para.clear()

    for i, ln in enumerate(lines):
        if i in prose:
            flush_chunk()
            para.append(ln.strip())
        else:
            flush_para()
            chunk.append(ln)
    flush_para()
    flush_chunk()
    return out

def segment_rows(lines: list[str], preset: list[tuple[int, int]] | None = None) -> list[dict]:
    cols = columns(lines, preset)
    role = classify(lines, cols)
    if not role["num"]:
        return [{"num": None, "span": None, "en": cell(lines, role["en"], 0, len(lines)) if role["en"] else "",
                 "key": cell(lines, role["key"], 0, len(lines)) if role["key"] else "",
                 "vi": cell(lines, role["vi"], 0, len(lines)) if role["vi"] else ""}]

    a, b = role["num"]
    starts = []
    i = 0
    while i < len(lines):
        if not lines[i][a:b].strip():
            i += 1
            continue
        j = i
        parts = []
        while j < len(lines) and lines[j][a:b].strip():
            parts.append(lines[j][a:b].strip())
            j += 1
        m = ROW_NUM.match("".join(parts))
        if m and m.group(1):
            starts.append((i, int(m.group(1)), int(m.group(2)) if m.group(2) else None))
        i = j

    rows = []
    for idx, (line_i, n, n2) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        rows.append({
            "num": n,
            "span": n2,
            "en": cell(lines, role["en"], line_i, end) if role["en"] else "",
            "key": cell(lines, role["key"], line_i, end) if role["key"] else "",
            "vi": cell(lines, role["vi"], line_i, end) if role["vi"] else "",
            "head": cell(lines, role["num"], line_i, end),
        })
    head_end = starts[0][0] if starts else len(lines)
    if head_end > 0:
        rows.insert(0, {
            "num": None, "span": None,
            "en": cell(lines, role["en"], 0, head_end) if role["en"] else "",
            "key": cell(lines, role["key"], 0, head_end) if role["key"] else "",
            "vi": cell(lines, role["vi"], 0, head_end) if role["vi"] else "",
            "head": cell(lines, role["num"], 0, head_end),
        })
    return rows

def doc_pages(path: Path) -> list[list[str]]:
    reader = PdfReader(str(path))
    return [page_lines(p) for p in reader.pages]

def doc_columns(pages: list[list[str]]) -> list[tuple[int, int]]:

    body = [pg for pg in pages if any(l.strip() for l in pg)]
    if not body:
        return []
    width = max((len(l) for pg in body for l in pg), default=0)
    if not width:
        return []
    votes = [0] * (width + 1)
    for pg in body:
        mask = [True] * (width + 1)
        for ln in pg:
            for i, ch in enumerate(ln):
                if ch != " ":
                    mask[i] = False
        for i, blank in enumerate(mask):
            if blank:
                votes[i] += 1
    need = 0.6 * len(body)
    fake = ["x" if votes[i] < need else " " for i in range(width + 1)]
    return columns(["".join(fake)])

def doc_rows(path: Path) -> list[dict]:

    out = []
    for pi, lines in enumerate(doc_pages(path)):
        if not any(l.strip() for l in lines):
            continue
        for row in page_rows(lines):
            row["page"] = pi
            out.append(row)
    return out

def merge_continuations(rows: list[dict]) -> list[dict]:

    merged: list[dict] = []
    last: dict | None = None
    for row in rows:
        if row.get("note"):
            merged.append(dict(row))
            continue
        if last is not None and (row["num"] is None or row["num"] == last["num"]):
            for f in ("en", "key", "vi"):
                if row.get(f):
                    last[f] = (last.get(f, "") + "\n" + row[f]).strip()
            continue
        copy = dict(row)
        merged.append(copy)
        last = copy
    return merged
