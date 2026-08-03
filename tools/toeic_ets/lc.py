import re

from layout import doc_rows, merge_continuations, vi_ratio
from pdftext import lc_pdf

LETTERS = "ABCD"

OPTION = re.compile(r"(?:(?<=\s)|^)\(?([A-D])[\)\.]\s*")
VOICE_TAG = re.compile(r"^\s*(?:[MW][12]?\s*-\s*[A-Za-z]{2}\s*/?\s*)+", re.IGNORECASE)
QNUM = re.compile(r"(?:(?<=\s)|^)(\d{2,3})\s*[\.\:]\s+")
QNUM_BARE = re.compile(r"(?:(?<=\s)|^)(\d{2,3})\s+")
KEY_PAIR = re.compile(r"(\d{2,3})\s*[\.\:]?\s*\(?([A-D])\)?")
BARE_LETTER = re.compile(r"^\s*\(?([A-D])\)?\s*$")
SPEAK_COLON = re.compile(r"(?:(?<=\s)|^)([MW][12]?)(?:\s*-\s*[A-Za-z]{2})?\s*:\s*")
SPEAK_PLAIN = re.compile(r"(?:(?<=\s)|^)([MW][12]?)(?:\s*-\s*[A-Za-z]{2})?\s+(?=[A-Z])")

def flat(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").replace("\n", " ")).strip()

def split_options(text: str, count: int) -> tuple[str, list[str]]:

    marks = [m for m in OPTION.finditer(text)]
    wanted = LETTERS[:count]
    picked = []
    for m in marks:
        letter = m.group(1)
        if len(picked) < count and letter == wanted[len(picked)]:
            picked.append(m)
    if len(picked) != count:
        return text.strip(), []
    head = text[: picked[0].start()].strip()
    opts = []
    for i, m in enumerate(picked):
        end = picked[i + 1].start() if i + 1 < count else len(text)
        opts.append(text[m.end():end].strip())
    return head, opts

def answers_from(cell: str, nums: list[int]) -> dict[int, int]:
    out: dict[int, int] = {}
    for m in KEY_PAIR.finditer(flat(cell)):
        n, letter = int(m.group(1)), m.group(2)
        if n in nums:
            out[n] = LETTERS.index(letter)
    if not out:
        letters = re.findall(r"\b([A-D])\b", flat(cell))
        if len(letters) == len(nums):
            out = {n: LETTERS.index(l) for n, l in zip(nums, letters)}
    return out

def single_answer(row: dict) -> int | None:
    for source in (row.get("key", ""), row.get("vi", ""), row.get("en", "")):
        for line in (source or "").split("\n"):
            m = BARE_LETTER.match(line)
            if m:
                return LETTERS.index(m.group(1))
        m = re.match(r"^\s*\(?([A-D])\)?\s{2,}\S", source or "")
        if m:
            return LETTERS.index(m.group(1))
    return None

def strip_leading_key(text: str) -> str:

    lines = (text or "").split("\n")
    for i, line in enumerate(lines):
        if BARE_LETTER.match(line):
            lines[i] = ""
            break
        m = re.match(r"^\s*\(?[A-D]\)?\s{2,}(\S.*)$", line)
        if m:
            lines[i] = m.group(1)
            break
        if line.strip():
            break
    return "\n".join(lines)

def parse_p1(row: dict) -> dict:
    en = flat(row["en"])
    vi = flat(strip_leading_key(row["vi"]))
    _, statements = split_options(en, 4)
    _, vi_statements = split_options(vi, 4)
    return {
        "n": row["num"],
        "statements": statements,
        "answer": single_answer(row),
        "vi": vi_statements,
    }

def parse_p2(row: dict) -> dict:
    en = flat(row["en"])
    vi = flat(strip_leading_key(row["vi"]))
    q, options = split_options(en, 3)
    vi_q, vi_options = split_options(vi, 3)
    return {
        "n": row["num"],
        "q": q,
        "options": options,
        "answer": single_answer(row),
        "viQ": vi_q,
        "viOptions": vi_options,
    }

def parse_script(text: str) -> list[dict]:
    body = VOICE_TAG.sub("", flat(text))
    pattern = SPEAK_COLON if SPEAK_COLON.search(body) else SPEAK_PLAIN
    marks = list(pattern.finditer(body))
    if not marks:
        return [{"s": "M", "text": body}] if body else []
    lines = []
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(body)
        who = m.group(1).upper()
        speaker = {"M1": "M", "W1": "W"}.get(who, who)
        said = body[m.end():end].strip()
        if said:
            lines.append({"s": speaker, "text": said})
    return lines

def _marks_with(pattern: re.Pattern, text: str, nums: list[int]) -> list:
    by_num: dict[int, list] = {n: [] for n in nums}
    for m in pattern.finditer(text):
        n = int(m.group(1))
        if n in by_num:
            by_num[n].append(m)
    picked = []
    pos = 0
    for n in nums:
        chosen = None
        for m in by_num[n]:
            if m.start() < pos:
                continue
            stem = text[m.end(): m.end() + 300]
            cut = stem.find("(A)")
            if cut >= 0 and not any(str(x) in stem[:cut] for x in nums):
                chosen = m
                break
            if chosen is None:
                chosen = m
        if chosen is None:
            continue
        picked.append(chosen)
        pos = chosen.end()
    return picked

def question_marks(text: str, nums: list[int]) -> list:

    strict = _marks_with(QNUM, text, nums)
    if len(strict) == len(nums):
        return strict
    lenient = _marks_with(QNUM_BARE, text, nums)
    return lenient if len(lenient) > len(strict) else strict

MISSING_OPT = re.compile(r"\(([A-D])\)\s*([^\n(]{1,80})")
STEM_START = re.compile(r"\s\d{2,3}\s*[\.\:]")

def borrow_option(options: list[str], letter: str, pool: str) -> list[str]:

    for m in MISSING_OPT.finditer(pool):
        if m.group(1) != letter:
            continue
        text = m.group(2)
        cut = STEM_START.search(text)
        if cut:
            text = text[: cut.start()]
        text = text.strip()
        if text and vi_ratio(text) < 0.03:
            return options + [text]
    return options

def parse_conv(row: dict, nums: list[int]) -> dict:
    en = flat(row["en"])
    vi = flat(row["vi"])
    keys = answers_from(row["key"] or row["vi"], nums)
    leftovers = [LETTERS.index(l) for l in re.findall(r"\(([A-D])\)", flat(row["key"]))]
    for n in nums:
        if keys.get(n) is None and len(leftovers) == len(nums):
            keys[n] = leftovers[nums.index(n)]

    ordered = question_marks(en, nums)
    script_en = en[: ordered[0].start()] if ordered else en
    vi_ordered = question_marks(vi, nums)
    script_vi = vi[: vi_ordered[0].start()] if vi_ordered else vi

    def slice_at(text, marks, i):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        return text[marks[i].end():end]

    questions = []
    for i, n in enumerate(nums):
        chunk = slice_at(en, ordered, i) if i < len(ordered) else ""
        q, options = split_options(chunk, 4)
        if not options:
            head, three = split_options(chunk, 3)
            if len(three) == 3:
                filled = borrow_option(three, "D", vi)
                if len(filled) == 4:
                    q, options = head, filled
        vi_chunk = slice_at(vi, vi_ordered, i) if i < len(vi_ordered) else ""
        vi_q, vi_options = split_options(vi_chunk, 4)
        questions.append({
            "n": n,
            "q": q,
            "options": options,
            "answer": keys.get(n),
            "viQ": vi_q,
            "viOptions": vi_options,
        })
    return {
        "ns": nums,
        "script": parse_script(script_en),
        "viScript": VOICE_TAG.sub("", script_vi).strip(),
        "questions": questions,
    }

def parse_listening(test: int) -> dict:
    rows = {r["num"]: r for r in merge_continuations(doc_rows(lc_pdf(test))) if r["num"]}
    out = {"p1": [], "p2": [], "p3": [], "p4": []}
    for n in range(1, 7):
        out["p1"].append(parse_p1(rows[n]))
    for n in range(7, 32):
        out["p2"].append(parse_p2(rows[n]))
    for start in range(32, 71, 3):
        out["p3"].append(parse_conv(rows[start], [start, start + 1, start + 2]))
    for start in range(71, 101, 3):
        out["p4"].append(parse_conv(rows[start], [start, start + 1, start + 2]))
    return out
