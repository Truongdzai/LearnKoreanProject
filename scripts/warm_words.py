from __future__ import annotations

import argparse
import json
import re
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

from backend.services import dictionary, wordimg  # noqa: E402

UNITS_DIR = ROOT / "frontend" / "src" / "data" / "english" / "units"


IMAGE_POS = {"noun"}


def bank_words(pos_filter: set[str] | None = None) -> list[dict]:
    out: list[dict] = []
    seen: set[str] = set()
    for path in sorted(UNITS_DIR.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for w in data.get("words") or []:
            term = (w.get("en") or "").strip()
            key = term.lower()
            if not term or key in seen:
                continue
            if not re.fullmatch(r"[a-zA-Z][a-zA-Z' -]*", term):
                continue
            if " " in term:
                continue
            if pos_filter and (w.get("pos") or "") not in pos_filter:
                continue
            seen.add(key)
            out.append({"term": term, "pos": w.get("pos") or "noun", "vi": w.get("vi") or ""})
    return out


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Ham cache truoc cho trang Hoc sau tu vung: nghia sau (AI) va anh minh hoa (Openverse)."
    )
    ap.add_argument("--limit", type=int, default=100, help="So tu can ham (mac dinh 100)")
    ap.add_argument("--skip", type=int, default=0, help="Bo qua bao nhieu tu dau tien")
    ap.add_argument("--images", action="store_true", help="Ham anh minh hoa")
    ap.add_argument("--rich", action="store_true", help="Ham nghia sau bang AI (ton quota LLM)")
    ap.add_argument("--sleep", type=float, default=0.4, help="Nghi bao nhieu giay giua moi tu")
    ap.add_argument("--all-pos", action="store_true",
                    help="Ham ca tinh tu/dong tu (mac dinh anh CHI lay cho danh tu)")
    ap.add_argument("--ai", action="store_true",
                    help="Nho AI ve anh thay vi tim tren Openverse (CAN bat thanh toan Gemini)")
    ap.add_argument("--replace", action="store_true",
                    help="Xoa het anh Openverse truoc, de AI ve lai tu dau")
    args = ap.parse_args()

    if args.replace:
        n = wordimg.clear_non_ai()
        print(f"Da xoa {n} ban ghi anh Openverse (file van con tren dia, lay lai duoc).")

    if not args.images and not args.rich:
        args.images = True

    pos = None if (args.all_pos or args.ai or not args.images) else IMAGE_POS
    pool = bank_words(pos)
    words = pool[args.skip : args.skip + args.limit]
    how = "AI ve" if args.ai else "tim Openverse"
    print(f"Kho co {len(pool)} tu {'(chi danh tu)' if pos else '(moi loai tu)'}. "
          f"Dang ham {len(words)} tu (anh={args.images} bang {how}, nghia sau={args.rich}).")

    img_ok = img_skip = img_none = rich_ok = rich_skip = fail = 0

    for i, w in enumerate(words, 1):
        term = w["term"]
        line = f"[{i}/{len(words)}] {term:<18}"

        if args.images:
            if wordimg.cached_only(term) is not None:
                img_skip += 1
                line += " anh:co-san"
            else:
                try:
                    if args.ai:
                        res = wordimg.generate(term, w["vi"], w["pos"])
                        got = res.get("image")
                        if not got:
                            line += f" anh:LOI({res.get('error', '')[:60]})"
                    else:
                        got = wordimg.lookup(term, force=True).get("image")
                    if got:
                        img_ok += 1
                        line += f" anh:{got['license']:<4}"
                    elif not args.ai:
                        img_none += 1
                        line += " anh:khong-hop"
                    else:
                        fail += 1
                except Exception as exc:
                    fail += 1
                    line += f" anh:LOI({exc.__class__.__name__})"

        if args.rich:
            if dictionary.has_rich_cache(term, "en", "vi"):
                rich_skip += 1
                line += " nghia:co-san"
            else:
                try:
                    got = dictionary.lookup_rich(term, "en", "vi")
                    if got.get("rich"):
                        rich_ok += 1
                        line += " nghia:moi"
                    else:
                        line += " nghia:trong"
                except Exception as exc:
                    fail += 1
                    line += f" nghia:LOI({exc.__class__.__name__})"

        print(line, flush=True)
        time.sleep(args.sleep)

    print("\n--- Tong ket ---")
    if args.images:
        print(f"Anh: moi {img_ok} · da co {img_skip} · khong tim duoc anh hop {img_none}")
    if args.rich:
        print(f"Nghia sau: moi {rich_ok} · da co {rich_skip}")
    print(f"Loi: {fail}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
