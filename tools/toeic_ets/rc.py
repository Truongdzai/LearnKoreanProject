import re

from layout import doc_rows
from lc import LETTERS, flat, split_options
from pdftext import rc_pdf

BLANK = re.compile(r"-{3,}")

VERDICTS = [
    re.compile(r"Chọn\s*[:.\-–]?\s*\(?\s*([A-D])\s*\)?(?![A-Za-z])", re.IGNORECASE),
    re.compile(r"Đáp\s*án\s*(?:đúng)?\s*(?:là)?\s*[:.\-–]?\s*\(?\s*([A-D])\s*\)?(?![A-Za-z])",
               re.IGNORECASE),
    re.compile(r"(?:=>|->|→)\s*\(?\s*([A-D])\s*\)?(?![A-Za-z])"),
]
GROUP_HEAD = re.compile(r"Questions?\s+(\d{3})\s*[-–]\s*(\d{3})", re.IGNORECASE)

def verdict(text: str) -> int | None:
    for pattern in VERDICTS:
        m = pattern.search(text or "")
        if m:
            return LETTERS.index(m.group(1).upper())
    return None

def normalise_blank(stem: str) -> str:

    text = BLANK.sub("-------", stem)
    text = re.sub(r"(?<=[^\s])-------", " -------", text)
    text = re.sub(r"-------(?=[^\s.,;:?!])", "------- ", text)
    return re.sub(r"\s{2,}", " ", text).strip()

class ReadingDoc:

    def __init__(self, test: int):
        self.rows = doc_rows(rc_pdf(test))
        self.stream = ""
        self.notes = ""
        self.groups: list[tuple[int, int]] = []
        for row in self.rows:
            if row.get("note"):
                m = GROUP_HEAD.search(row["note"])
                if m:
                    self.groups.append((int(m.group(1)), int(m.group(2))))
                continue
            if row["num"] is not None:
                self.stream += f"{row['num']}. "
                self.notes += f"{row['num']}. "
            if row["en"]:
                self.stream += flat(row["en"]) + " "
            side = " ".join(filter(None, (row.get("key"), row.get("vi"))))
            if side.strip():
                self.notes += flat(side) + " "

LEAD_LETTER = re.compile(r"^\s*\(?\s*([A-D])\s*\)?\s*(?![A-Za-z\)])")

def slice_by_number(text: str, numbers: list[int], need_options: bool) -> dict[int, str]:

    marks: dict[int, re.Match] = {}
    pos = 0
    for n in numbers:
        pattern = re.compile(rf"(?<!\d){n}\s*[\.\:]?\s")
        chosen = None
        for m in pattern.finditer(text, pos):
            stem = text[m.end(): m.end() + 400]
            cut = stem.find("(A)")
            if not need_options:
                chosen = m
                break
            if cut >= 0 and not re.search(r"(?<!\d)\d{3}\s*[\.\:]", stem[:cut]):
                chosen = m
                break
            if chosen is None:
                chosen = m
        if chosen is None:
            continue
        marks[n] = chosen
        pos = chosen.end()

    starts = sorted(m.start() for m in marks.values())
    out = {}
    for n, m in marks.items():
        after = [s for s in starts if s > m.start()]
        out[n] = text[m.end(): after[0] if after else len(text)]
    return out

def answer_from(chunk: str) -> int | None:
    found = verdict(chunk)
    if found is not None:
        return found
    m = LEAD_LETTER.match(chunk or "")
    return LETTERS.index(m.group(1)) if m else None

def parse_questions(doc: ReadingDoc, numbers: list[int]) -> list[dict]:
    english = slice_by_number(doc.stream, numbers, need_options=True)
    vietnamese = slice_by_number(doc.notes, numbers, need_options=False)
    out = []
    for n in numbers:
        chunk = english.get(n)
        if chunk is None:
            continue
        stem, options = split_options(chunk, 4)
        side = vietnamese.get(n, "")
        out.append({
            "n": n,
            "text": normalise_blank(stem),
            "options": options,
            "answer": answer_from(side),
            "explain": re.sub(r"^\s*(=>|\(?[A-D]\)?)\s*", "", side).strip(),
        })
    return out

def parse_reading(test: int) -> dict:
    doc = ReadingDoc(test)
    p5 = parse_questions(doc, list(range(101, 131)))
    rest = parse_questions(doc, list(range(131, 201)))
    by_num = {q["n"]: q for q in rest}
    return {
        "p5": p5,
        "p6": [by_num[n] for n in range(131, 147) if n in by_num],
        "p7": [by_num[n] for n in range(147, 201) if n in by_num],
        "groups": doc.groups,
        "missing": [n for n in range(101, 201)
                    if n not in {q["n"] for q in p5} and n not in by_num],
    }
