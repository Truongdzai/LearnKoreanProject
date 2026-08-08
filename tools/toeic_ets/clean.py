import re

VI_ONLY = set("ăâđêôơư") | set(
    "ảãạằắẳẵặầấẩẫậẻẽẹềếểễệỉĩịỏõọồốổỗộờớởỡợủũụừứửữựỳỷỹỵ")
STOP = re.compile(r"(Chọn|Dịch|Đáp\s*án|Giải\s*thích|Useful\s+Structures)", re.I)
GLOSS = re.compile(r"\s(?:[A-Z][A-Za-z'()\-/ ]{0,28}:(?=\s|$)|\([a-z]{1,4}\)\s*:|●)")
LIST_ITEM = re.compile(r"\s\d{1,2}\.\s+[A-Z]")
ANSWER_LETTER = re.compile(r"\s([A-D])\s")
VI_LOOKAHEAD = 200
NEXT_Q = re.compile(r"(?<![\d.])(1[0-9]\d|200)\s*[.:]\s")
OPTION = re.compile(r"\(\s*[A-D]\s*\)")
LEAD_OPTION = re.compile(r"^[\s\d.:;,)\]]*\(\s*[A-D]\s*\)\s*")
LEAD_JUNK = re.compile(r"^[\s\d.:;,)\]\-–]+")
PAGE_TAIL = re.compile(r"\s+\d{1,3}\s+\d{1,2}\s*$")
VI_RUN_GAP = 60
VI_HEAD = 8
MAX_OPTION = 180
MAX_STEM = 300

def is_vi(word: str) -> bool:
    return any(c in VI_ONLY for c in word.lower())

def has_accent(word: str) -> bool:
    return any(ord(c) > 127 and c.isalpha() for c in word)

def spans(text: str, test) -> list[tuple[int, int]]:
    return [(m.start(), m.end()) for m in re.finditer(r"\S+", text or "") if test(m.group())]

def vi_spans(text: str) -> list[tuple[int, int]]:
    return spans(text, is_vi)

def strip_leading_vi(text: str) -> str:
    tokens = list(re.finditer(r"\S+", text or ""))
    if not tokens or not has_accent(tokens[0].group()):
        return text
    end = tokens[0].end()
    for token in tokens[1:]:
        if not has_accent(token.group()):
            continue
        if token.start() - end > VI_RUN_GAP:
            break
        end = token.end()
    return text[end:]

def cut_tail(text: str, cap: int) -> str:
    limit = len(text)
    for pattern in (STOP, NEXT_Q, OPTION, GLOSS, LIST_ITEM):
        m = pattern.search(text)
        if m:
            limit = min(limit, m.start())
    for m in ANSWER_LETTER.finditer(text):
        if m.start() >= limit:
            break
        if spans(text[m.end(): m.end() + VI_LOOKAHEAD], has_accent):
            limit = m.start()
            break
    marks = vi_spans(text[:limit])
    if marks:
        limit = min(limit, marks[0][0])
    out = text[:limit].strip()
    if len(out) > cap:
        out = out[:cap].rsplit(" ", 1)[0]
    out = re.sub(r"\s*\([^)]*$", "", out)
    while out.rstrip().endswith(":") and " " in out.rstrip():
        out = out.rstrip().rsplit(" ", 1)[0]
    return PAGE_TAIL.sub("", out).strip(" ;,:()●•·—-")

def clean_option(text: str) -> str:
    out = LEAD_OPTION.sub("", strip_leading_vi(text or ""))
    return cut_tail(LEAD_JUNK.sub("", out), MAX_OPTION)

EXPLAIN_STOP = re.compile(
    r"(?<![\d.])(1[0-9]\d|200)\s*[.:]\s|(?:Questions?|Câu\s+hỏi)\s+\d{3}\s*[-–]", re.I)
MAX_EXPLAIN = 700

def cut_explain(text: str) -> str:
    out = re.sub(r"\s+", " ", strip_leading_vi(text or "")).strip()
    m = EXPLAIN_STOP.search(out)
    if m:
        out = out[: m.start()]
    if len(out) > MAX_EXPLAIN:
        out = out[:MAX_EXPLAIN].rsplit(" ", 1)[0] + "…"
    return LEAD_JUNK.sub("", out).strip()

def clean_stem(text: str) -> str:
    out = LEAD_JUNK.sub("", strip_leading_vi(text or ""))
    return cut_tail(out, MAX_STEM)

MARK = re.compile(r"\(\s*([A-D])\s*\)")
TAIL_WINDOW = 240
CHUNK_CAP = 1800
MARK_CAP = 4

def split_paren(chunk: str) -> tuple[str, list[str]]:
    chunk = chunk[:CHUNK_CAP]
    marks = [(m.start(), m.end(), m.group(1)) for m in MARK.finditer(chunk)]
    by_letter = {L: [m for m in marks if m[2] == L][:MARK_CAP] for L in "ABCD"}
    if not all(by_letter.values()):
        return chunk.strip(), []

    best = None
    for a in by_letter["A"]:
        for b in by_letter["B"]:
            if b[0] <= a[1]:
                continue
            for c in by_letter["C"]:
                if c[0] <= b[1]:
                    continue
                for d in by_letter["D"]:
                    if d[0] <= c[1]:
                        continue
                    parts = [chunk[a[1]:b[0]], chunk[b[1]:c[0]], chunk[c[1]:d[0]],
                             chunk[d[1]:d[1] + TAIL_WINDOW]]
                    if not all(p.strip() for p in parts[:3]):
                        continue
                    done = [clean_option(p) for p in parts]
                    whole = all(done) and len({x.lower() for x in done}) == 4
                    dirty = sum(1 for x in done if vi_spans(x))
                    score = (0 if whole else 1, dirty, -sum(len(x) for x in done), a[0])
                    if best is None or score < best[0]:
                        best = (score, a, b, c, d)
    if best is None:
        return chunk.strip(), []
    _, a, b, c, d = best
    return chunk[: a[0]], [chunk[a[1]:b[0]], chunk[b[1]:c[0]], chunk[c[1]:d[0]], chunk[d[1]:]]

def tidy(stem: str, options: list[str], blank: bool = False) -> tuple[str, list[str]]:
    return ("" if blank else clean_stem(stem)), [clean_option(o) for o in options]

def usable(stem: str, options: list[str]) -> bool:
    if len(options) != 4 or not all(o.strip() for o in options):
        return False
    if len({o.strip().lower() for o in options}) < 4:
        return False
    return not vi_spans(stem) and not any(vi_spans(o) for o in options)
