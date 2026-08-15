from __future__ import annotations

import argparse
import json
import re
import string
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

from backend.services import wordprofile  # noqa: E402

UNITS_DIR = ROOT / "frontend" / "src" / "data" / "english" / "units"
OUT_DIR = ROOT / "frontend" / "src" / "data" / "english" / "profiles"

POLY_POS = {"verb": 0, "prep": 1, "adj": 2, "adverb": 3, "question": 4, "noun": 5, "phrase": 6}


def bank() -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for path in sorted(UNITS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for w in data.get("words") or []:
            term = (w.get("en") or "").strip()
            key = term.lower()
            if not term or key in seen or " " in term:
                continue
            if not re.fullmatch(r"[a-zA-Z][a-zA-Z'-]*", term):
                continue
            seen.add(key)
            out.append({"term": term, "pos": w.get("pos") or "noun", "vi": w.get("vi") or ""})
    return out


def ranked(words: list[dict]) -> list[dict]:
    return sorted(words, key=lambda w: (POLY_POS.get(w["pos"], 9), len(w["term"]), w["term"]))


def shard_of(term: str) -> str:
    head = term[:1].lower()
    return head if head in string.ascii_lowercase else "other"


def export() -> tuple[int, int]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    shards: dict[str, dict] = {}
    for w in bank():
        got = wordprofile.cached_only(w["term"])
        if not got:
            continue
        shards.setdefault(shard_of(w["term"]), {})[w["term"].lower()] = got

    for name in list(shards):
        path = OUT_DIR / f"{name}.json"
        path.write_text(json.dumps(shards[name], ensure_ascii=False), encoding="utf-8")

    for path in OUT_DIR.glob("*.json"):
        if path.stem != "index" and path.stem not in shards:
            path.unlink()

    every = [(t, p) for group in shards.values() for t, p in group.items()]
    terms = sorted(t for t, _ in every)
    top = sorted(every, key=lambda x: (-len(x[1].get("senses") or []), x[0]))[:80]
    (OUT_DIR / "index.json").write_text(
        json.dumps(
            {"words": terms, "top": [{"term": t, "n": len(p.get("senses") or [])} for t, p in top]},
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )
    return len(terms), len(shards)


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Dung ho so tu vung day du (moi nghia cua tu) cho trang Hoc sau tu vung."
    )
    ap.add_argument("--limit", type=int, default=50, help="So tu can dung (mac dinh 50)")
    ap.add_argument("--skip", type=int, default=0, help="Bo qua bao nhieu tu dau danh sach")
    ap.add_argument("--sleep", type=float, default=0.5, help="Nghi bao nhieu giay giua moi tu")
    ap.add_argument("--only", default="", help="Chi dung cho vai tu, ngan cach bang dau phay")
    ap.add_argument("--refresh", action="store_true", help="Dung lai ca nhung tu da co trong cache")
    ap.add_argument("--export-only", action="store_true", help="Chi xuat file tinh tu cache, khong goi AI")
    args = ap.parse_args()

    if args.export_only:
        n, shards = export()
        print(f"Da xuat {n} ho so ra {shards} file trong {OUT_DIR.relative_to(ROOT)}")
        return 0

    pool = ranked(bank())
    if args.only:
        want = {t.strip().lower() for t in args.only.split(",") if t.strip()}
        words = [w for w in pool if w["term"].lower() in want]
    else:
        words = pool[args.skip : args.skip + args.limit]

    print(f"Kho co {len(pool)} tu. Dang dung ho so cho {len(words)} tu.")
    made = skipped = failed = 0
    senses = 0

    for i, w in enumerate(words, 1):
        term = w["term"]
        line = f"[{i}/{len(words)}] {term:<16}"
        if not args.refresh and wordprofile.has_cache(term):
            skipped += 1
            print(line + "co-san", flush=True)
            continue
        try:
            got = wordprofile.get(term, w["pos"], w["vi"], refresh=args.refresh)
            profile = got.get("profile")
            if profile:
                made += 1
                senses += len(profile["senses"])
                print(line + f"moi ({len(profile['senses'])} nghia)", flush=True)
            else:
                failed += 1
                print(line + "trong", flush=True)
        except Exception as exc:
            failed += 1
            print(line + f"LOI({exc.__class__.__name__})", flush=True)
        time.sleep(args.sleep)

    n, shards = export()
    print("\n--- Tong ket ---")
    print(f"Moi {made} · da co {skipped} · loi {failed}")
    if made:
        print(f"Trung binh {senses / made:.1f} nghia moi tu")
    print(f"File tinh: {n} ho so trong {shards} file ({OUT_DIR.relative_to(ROOT)})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
