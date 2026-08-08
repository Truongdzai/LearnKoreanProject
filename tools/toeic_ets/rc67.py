import re
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

import clean
from pdftext import rc_pdf

FIX = {
    "ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl",
    "’": "'", "‘": "'", "“": '"', "”": '"', " ": " ",
}
HEADER = re.compile(r"ETS\s+20\d\d\s+READING\s+TEST", re.I)

PART6_SETS = [(131, 134), (135, 138), (139, 142), (143, 146)]
SINGLE_LO, SINGLE_HI = 147, 175
FIXED_SETS = [(176, 180, 2), (181, 185, 2), (186, 190, 3), (191, 195, 3), (196, 200, 3)]
MIN_IMG = (500, 250)
BANNER_SHARE = 0.4
MAX_WIDTH = 1000
MARK = "\x01"

NUM_TOKEN = re.compile(r"^\(?(1[3-9]\d|200)\)?\.?$")

def page_marks(page) -> tuple[list[float], dict[int, float]]:
    pics: list[tuple[float, str]] = []
    words: list[tuple[float, str]] = []

    def on_operator(op, args, cm, tm):
        if op == b"Do" and args:
            pics.append((cm[5], str(args[0]).lstrip("/")))

    def on_text(text, cm, tm, font, size):
        if text.strip():
            words.append((cm[5] + tm[5], text.strip()))

    page.extract_text(visitor_operand_before=on_operator, visitor_text=on_text)
    tops: dict[int, float] = {}
    for y, word in words:
        m = NUM_TOKEN.match(word)
        if m:
            n = int(m.group(1))
            tops[n] = max(tops.get(n, -1e9), y)
    return pics, tops

def read(test: int) -> list[dict]:
    out = []
    for page in PdfReader(str(rc_pdf(test))).pages:
        text = page.extract_text() or ""
        for a, b in FIX.items():
            text = text.replace(a, b)
        pics, tops = page_marks(page)
        out.append({
            "text": re.sub(r"\s+", " ", HEADER.sub(" ", text)),
            "pics": pics,
            "tops": tops,
            "images": {im.name.rsplit(".", 1)[0]: im.image for im in page.images},
        })
    return out

def keep_pictures(pages: list[dict]) -> None:
    counts: dict[tuple[int, int], int] = {}
    for page in pages:
        sizes = set()
        for _, name in page["pics"]:
            pic = page["images"].get(name)
            if pic is not None:
                sizes.add(pic.size)
        for size in sizes:
            counts[size] = counts.get(size, 0) + 1
    limit = BANNER_SHARE * len(pages)
    for page in pages:
        kept = []
        for y, name in page["pics"]:
            pic = page["images"].get(name)
            if pic is None or counts[pic.size] > limit:
                continue
            if pic.size[0] < MIN_IMG[0] or pic.size[1] < MIN_IMG[1]:
                continue
            kept.append((y, pic))
        page["shots"] = kept

def build_stream(pages: list[dict]) -> tuple[str, list[int]]:
    text = ""
    offsets = []
    for page in pages:
        offsets.append(len(text))
        text += page["text"] + " "
    return text, offsets

def candidates(text: str, n: int) -> list[tuple[int, int]]:
    out = []
    for m in re.finditer(rf"(?<!\d)(?<!\d\.){n}\s*\.?\s", text):
        if "(A)" in text[m.end(): m.end() + 600]:
            out.append((m.start(), m.end()))
    return out

def pick_increasing(options: list[list[tuple[int, int]]]) -> list[tuple[int, int] | None]:
    table: list[list[tuple[int, int]]] = []
    for i, spots in enumerate(options):
        row = []
        for start, _ in spots:
            score, back = 0, -1
            for k in range(i):
                for l, (prev, _) in enumerate(options[k]):
                    if prev < start and table[k][l][0] > score:
                        score, back = table[k][l][0], k * 1000 + l
            row.append((score + 1, back))
        table.append(row)

    top = (0, -1, -1)
    for i, row in enumerate(table):
        for j, (score, _) in enumerate(row):
            if score > top[0]:
                top = (score, i, j)

    chosen: list[tuple[int, int] | None] = [None] * len(options)
    i, j = top[1], top[2]
    while i >= 0:
        chosen[i] = options[i][j]
        back = table[i][j][1]
        if back < 0:
            break
        i, j = back // 1000, back % 1000
    return chosen

def split_four(chunk: str, blank: bool) -> tuple[str, list[str], str]:
    stem, opts = clean.split_paren(re.sub(r"\s+", " ", chunk))
    if not opts:
        return stem, [], ""
    tail = opts[3]
    stem, opts = clean.tidy(stem, opts, blank=blank)
    return stem, opts, tail[len(opts[3]):].strip()

def parse_questions(text: str) -> tuple[dict[int, dict], dict[int, int]]:
    numbers = list(range(131, 201))
    spots = pick_increasing([candidates(text, n) for n in numbers])
    at = {n: s[0] for n, s in zip(numbers, spots) if s}
    starts = sorted(at.values())
    out: dict[int, dict] = {}
    for n, spot in zip(numbers, spots):
        if not spot:
            continue
        after = [x for x in starts if x > spot[0]]
        chunk = text[spot[1]: after[0] if after else len(text)]
        stem, opts, explain = split_four(chunk, blank=n <= PART6_SETS[-1][1])
        if not clean.usable(stem, opts):
            continue
        out[n] = {"n": n, "text": stem, "options": opts, "answer": None,
                  "explain": clean.cut_explain(explain)}
    return out, at

def timeline(pages: list[dict], at: dict[int, int], offsets: list[int]) -> list[tuple[str, object]]:
    page_of: dict[int, int] = {}
    for n, pos in at.items():
        page = 0
        for i, start in enumerate(offsets):
            if start <= pos:
                page = i
        page_of[n] = page

    shots: list[Image.Image] = []
    events: list[tuple[str, object]] = []
    for i, page in enumerate(pages):
        rows: list[tuple[float, str, object]] = []
        for y, pic in page["shots"]:
            rows.append((y, "img", pic))
        for n, p in page_of.items():
            if p == i:
                rows.append((page["tops"].get(n, -1e9), "q", n))
        rows.sort(key=lambda r: -r[0])
        for _, kind, value in rows:
            if kind == "img":
                events.append(("img", len(shots)))
                shots.append(value)
            else:
                events.append(("q", value))
    return events, shots

def raw_sets(events: list[tuple[str, object]]) -> list[dict]:
    sets: list[dict] = []
    pending: list[int] = []
    for kind, value in events:
        if kind == "img":
            if sets and sets[-1]["ns"]:
                sets.append({"pics": [], "ns": []})
            pending.append(value)
            continue
        if not sets:
            sets.append({"pics": [], "ns": []})
        sets[-1]["pics"].extend(pending)
        pending.clear()
        sets[-1]["ns"].append(value)
    return [s for s in sets if s["ns"] or s["pics"]]

HEADING = re.compile(r"(?:Questions?|Câu\s+hỏi)\s+(\d{3})\s*[-–]\s*(\d{3})", re.I)

def headings(text: str) -> list[tuple[int, int]]:
    return sorted({(int(a), int(b)) for a, b in HEADING.findall(text)
                   if SINGLE_LO <= int(a) <= SINGLE_HI})

def regroup(sets: list[dict]) -> list[dict]:
    slots: list[dict] = []
    for a, b in PART6_SETS:
        slots.append({"part": 6, "ns": list(range(a, b + 1)), "need": 1, "pics": []})
    for a, b, need in FIXED_SETS:
        slots.append({"part": 7, "ns": list(range(a, b + 1)), "need": need, "pics": []})

    singles = [s for s in sets if any(SINGLE_LO <= n <= SINGLE_HI for n in s["ns"])]
    merged: list[dict] = []
    for item in singles:
        ns = [n for n in item["ns"] if SINGLE_LO <= n <= SINGLE_HI]
        if not ns:
            continue
        if merged and not item["pics"]:
            merged[-1]["ns"].extend(ns)
            continue
        merged.append({"part": 7, "ns": ns, "need": 1, "pics": list(item["pics"])})
    for item in merged:
        item["ns"].sort()
    for i, item in enumerate(merged):
        end = merged[i + 1]["ns"][0] - 1 if i + 1 < len(merged) else SINGLE_HI
        item["ns"] = list(range(item["ns"][0], max(item["ns"][-1], end) + 1))

    out = slots[:4] + merged + slots[4:]
    for item in out:
        if item["pics"]:
            continue
        for s in sets:
            if s["pics"] and set(s["ns"]) & set(item["ns"]):
                item["pics"] = list(dict.fromkeys(item["pics"] + s["pics"]))
    return out

def collect(test: int) -> dict:
    pages = read(test)
    keep_pictures(pages)
    text, offsets = build_stream(pages)
    found, at = parse_questions(text)
    events, shots = timeline(pages, at, offsets)
    sets = regroup(raw_sets(events))
    for item in sets:
        item["images"] = [shots[i] for i in item["pics"]]
        item["questions"] = [found[n] for n in item["ns"] if n in found]
        item["shortPassage"] = max(0, item["need"] - len(item["images"]))
    inferred = {(s["ns"][0], s["ns"][-1]) for s in sets if s["part"] == 7 and s["ns"][0] < 176}
    return {
        "sets": sets,
        "missing": [n for n in range(131, 201) if n not in found],
        "shots": len(shots),
        "headingOff": [h for h in headings(text) if h not in inferred],
    }

def save(sets: list[dict], dest: Path, base: str) -> None:
    dest.mkdir(parents=True, exist_ok=True)
    for item in sets:
        urls = []
        for k, pic in enumerate(item["images"]):
            if pic.mode not in ("RGB", "L"):
                pic = pic.convert("RGB")
            if pic.width > MAX_WIDTH:
                pic = pic.resize((MAX_WIDTH, round(pic.height * MAX_WIDTH / pic.width)),
                                 Image.LANCZOS)
            name = f"rc-{item['ns'][0]}-{k + 1}.webp"
            pic.save(dest / name, "WEBP", quality=86, method=6)
            urls.append(f"{base}/{name}")
        item["imgs"] = urls

if __name__ == "__main__":
    for t in range(1, 11):
        data = collect(t)
        sets = data["sets"]
        print(f"test {t:2d}: câu {70 - len(data['missing'])}/70 · bộ {len(sets)} "
              f"· ảnh {data['shots']} · thiếu câu {data['missing']} "
              f"· lệch mốc in trong sách {data['headingOff']}")
        print("        ", [(s["ns"][0], len(s["questions"]), len(s["images"])) for s in sets])
