import json
import re
import sys
from pathlib import Path

import clean
from pdftext import ROOT

DATA = ROOT / "frontend" / "src" / "data" / "english" / "toeic" / "ets"
MAX_OPTION = 190
MAX_STEM = 320
MAX_EXPLAIN = 760

def check(n: int, stem: str, options: list[str], answer, where: str,
          want: int = 4, explain: str = "") -> list[str]:
    bad = []
    tag = f"{where} câu {n}"
    if len(explain) > MAX_EXPLAIN:
        bad.append(f"{tag}: giải thích dài {len(explain)} ký tự")
    if len(options) != want:
        bad.append(f"{tag}: {len(options)} phương án")
        return bad
    for i, opt in enumerate(options):
        letter = "ABCD"[i]
        if not opt.strip():
            bad.append(f"{tag} ({letter}): rỗng")
        elif len(opt) > MAX_OPTION:
            bad.append(f"{tag} ({letter}): dài {len(opt)} ký tự — {opt[:70]}…")
        elif clean.vi_spans(opt):
            bad.append(f"{tag} ({letter}): lẫn tiếng Việt — {opt[:70]}…")
        elif re.search(r"\(\s*[A-D]\s*\)", opt):
            bad.append(f"{tag} ({letter}): dính phương án khác — {opt[:70]}…")
        elif opt.rstrip().endswith(":") or clean.GLOSS.search(opt):
            bad.append(f"{tag} ({letter}): còn đuôi giải nghĩa — {opt[:70]}…")
        elif re.search(r"\s[A-D]\s+[A-ZĐ]", opt):
            bad.append(f"{tag} ({letter}): còn chữ đáp án + bản dịch — {opt[:70]}…")
    lower = [o.strip().lower() for o in options]
    if len(set(lower)) < want:
        bad.append(f"{tag}: có phương án trùng nhau")
    if len(stem) > MAX_STEM:
        bad.append(f"{tag}: đề dài {len(stem)} ký tự")
    if clean.vi_spans(stem):
        bad.append(f"{tag}: đề lẫn tiếng Việt — {stem[:70]}…")
    if answer is None or not 0 <= answer < want:
        bad.append(f"{tag}: đáp án {answer!r}")
    return bad

def audit(path: Path) -> list[str]:
    doc = json.loads(path.read_text(encoding="utf-8"))
    tag = f"đề {doc['test']:2d}"
    out = []
    seen = set()

    for item in doc["listening"]["p1"]:
        out += check(item["n"], "", item["statements"], item["answer"], f"{tag} P1")
    for item in doc["listening"]["p2"]:
        out += check(item["n"], item["q"], item["options"], item["answer"], f"{tag} P2", want=3)
    for part in ("p3", "p4"):
        for group in doc["listening"][part]:
            for item in group["questions"]:
                out += check(item["n"], item["q"], item["options"], item["answer"],
                             f"{tag} P{part[1]}")

    for item in doc["reading"]["p5"]:
        seen.add(item["n"])
        out += check(item["n"], item["text"], item["options"], item["answer"], f"{tag} P5",
                     explain=item.get("explain", ""))
    for part in ("p6", "p7"):
        for block in doc["reading"][part]:
            for item in block["questions"]:
                seen.add(item["n"])
                out += check(item["n"], item["text"], item["options"], item["answer"],
                             f"{tag} P{part[1]}", explain=item.get("explain", ""))

    missing = [n for n in range(101, 201) if n not in seen]
    if missing:
        out.append(f"{tag}: thiếu câu Đọc {missing}")
    return out

def main() -> int:
    problems = []
    for path in sorted(DATA.glob("t*.json")):
        problems += audit(path)
    for line in problems:
        print(line)
    print(f"\ntổng lỗi: {len(problems)}")
    return 1 if problems else 0

if __name__ == "__main__":
    raise SystemExit(main())
