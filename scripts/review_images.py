from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

from PIL import Image, ImageDraw  # noqa: E402

from backend import db  # noqa: E402
from backend.services import wordimg  # noqa: E402

COLS = 5
CELL = 240
PAD = 8
LABEL = 34
BG = (17, 20, 31)
FG = (233, 237, 249)
SUB = (140, 150, 175)
LINE = (48, 56, 78)


def rows() -> list[tuple[str, dict]]:
    conn = db.get_conn()
    try:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS word_images ("
            "key TEXT PRIMARY KEY, word TEXT NOT NULL, data TEXT NOT NULL, "
            "created_at TEXT DEFAULT (datetime('now','localtime')))"
        )
        got = conn.execute("SELECT word, data FROM word_images ORDER BY word").fetchall()
    finally:
        conn.close()

    out = []
    for r in got:
        try:
            data = json.loads(r["data"])
        except Exception:
            continue
        if data.get("image"):
            out.append((r["word"], data))
    return out


def sheet(out_path: Path, limit: int, skip: int, only: str = "") -> int:
    items = rows()
    if only:
        pick = {w.strip().lower() for w in only.split(",") if w.strip()}
        items = [x for x in items if x[0].lower() in pick]
    items = items[skip: skip + limit]
    if not items:
        print("Khong co anh nao trong cache.")
        return 0

    n = len(items)
    cols = min(COLS, n)
    rws = (n + cols - 1) // cols
    w = cols * (CELL + PAD) + PAD
    h = rws * (CELL + LABEL + PAD) + PAD

    canvas = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(canvas)

    for i, (word, data) in enumerate(items):
        cx = PAD + (i % cols) * (CELL + PAD)
        cy = PAD + (i // cols) * (CELL + LABEL + PAD)
        draw.rectangle([cx, cy, cx + CELL, cy + CELL + LABEL], outline=LINE)

        path = wordimg.file_path(data["image"].get("file", ""))
        if path:
            try:
                im = Image.open(path).convert("RGBA")
                im.thumbnail((CELL - 12, CELL - 12), Image.LANCZOS)
                plate = Image.new("RGBA", (CELL - 12, CELL - 12), (255, 255, 255, 255))
                plate.paste(im, ((plate.width - im.width) // 2, (plate.height - im.height) // 2), im)
                canvas.paste(plate.convert("RGB"), (cx + 6, cy + 6))
            except Exception as exc:
                draw.text((cx + 10, cy + 10), f"loi: {exc}", fill=SUB)

        draw.text((cx + 8, cy + CELL + 4), f"{skip + i + 1}. {word}", fill=FG)
        title = (data["image"].get("title") or "")[:34]
        draw.text((cx + 8, cy + CELL + 18), title, fill=SUB)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG")
    print(f"Da ghep {n} anh (tu #{skip + 1}) vao {out_path}")
    return n


def main() -> int:
    ap = argparse.ArgumentParser(description="Duyet anh minh hoa bang mat.")
    ap.add_argument("--sheet", type=Path, help="Xuat bang anh ra file PNG de nhin")
    ap.add_argument("--limit", type=int, default=20)
    ap.add_argument("--skip", type=int, default=0)
    ap.add_argument("--next", default="", help="Danh sach tu bi loai, lay anh ke tiep (cach nhau dau phay)")
    ap.add_argument("--drop", default="", help="Danh sach tu bo han anh, quay ve emoji")
    ap.add_argument("--list", action="store_true", help="Liet ke tu va tieu de anh dang dung")
    ap.add_argument("--only", default="", help="Chi ghep bang anh cho cac tu nay")
    ap.add_argument("--refetch", default="", help="Xoa cache roi tim lai (dung sau khi sua QUERY_HINTS)")
    ap.add_argument("--regen", default="", help="Nho AI ve lai anh cho cac tu nay")
    ap.add_argument("--hint", default="", help="Mo ta rieng cho --regen, vi du: 'a steaming cup of tea'")
    args = ap.parse_args()

    if args.regen:
        meta = {}
        units = ROOT / "frontend" / "src" / "data" / "english" / "units"
        for f in sorted(units.glob("*.json")):
            for w in json.loads(f.read_text(encoding="utf-8")).get("words") or []:
                t = (w.get("en") or "").strip().lower()
                if t and t not in meta:
                    meta[t] = (w.get("vi") or "", w.get("pos") or "noun")
        for word in [w.strip() for w in args.regen.split(",") if w.strip()]:
            vi, pos = meta.get(word.lower(), ("", "noun"))
            wordimg.forget(word)
            res = wordimg.generate(word, vi, pos, args.hint)
            if res.get("image"):
                print(f"{word:14} -> AI ve xong ({res['image']['provider']})")
            else:
                print(f"{word:14} -> LOI: {res.get('error', '')[:110]}")

    if args.refetch:
        for word in [w.strip() for w in args.refetch.split(",") if w.strip()]:
            wordimg.forget(word)
            res = wordimg.lookup(word, force=True)
            im = res.get("image")
            print(f"{word:14} -> {(im or {}).get('title', 'KHONG TIM DUOC')[:50]}")

    if args.next:
        for word in [w.strip() for w in args.next.split(",") if w.strip()]:
            res = wordimg.advance(word)
            im = res.get("image")
            print(f"{word:14} -> {(im or {}).get('title', 'HET UNG VIEN')[:46]} (con {res.get('left', 0)})")

    if args.drop:
        for word in [w.strip() for w in args.drop.split(",") if w.strip()]:
            wordimg.drop(word)
            print(f"{word:14} -> bo han anh, dung emoji")

    if args.list:
        for i, (word, data) in enumerate(rows(), 1):
            print(f"{i:3}. {word:14} {data['image'].get('title', '')[:52]}")

    if args.sheet:
        sheet(args.sheet, args.limit, args.skip, args.only)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
