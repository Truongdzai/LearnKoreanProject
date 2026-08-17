from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend import db
from backend.services import cache, translate, youtube

OPEN_LANGS = ("en",)


def catalog(langs: tuple[str, ...] | None, limit: int, force: bool) -> list[dict]:
    conn = db.get_conn()
    try:
        rows = conn.execute(
            "SELECT id, title, lang, dur FROM catalog_videos WHERE active = 1 ORDER BY lang, sort"
        ).fetchall()
        done = {r["video_id"] for r in conn.execute("SELECT video_id FROM lesson_cache")}
    finally:
        conn.close()

    out = []
    for r in rows:
        if langs and (r["lang"] or "ko") not in langs:
            continue
        if not force and r["id"] in done:
            continue
        out.append(dict(r))
    return out[:limit] if limit else out


def build(video: dict) -> tuple[bool, str]:
    vid = video["id"]
    lang = video["lang"] or "ko"

    data = youtube.get_segments(f"https://www.youtube.com/watch?v={vid}", lang)
    if not data["segments"]:
        return False, "không có phụ đề"

    texts = [str(s.get("ko") or "") for s in data["segments"]]
    if translate.needs_repair(texts, data.get("source") or ""):
        try:
            data["segments"] = translate.repair_segments(data["segments"], lang)
        except Exception as exc:
            print(f"      (dọn phụ đề hỏng, dùng bản thô: {type(exc).__name__})")

    note = ""
    if data.get("title"):
        note = f"Bối cảnh: video \"{data['title']}\" của kênh {data.get('channel') or ''}.".strip()
    translate.translate_segments(data["segments"], lang, note)

    missing = sum(1 for s in data["segments"] if not (s.get("vi") or "").strip())
    if missing > len(data["segments"]) // 2:
        return False, f"dịch hỏng ({missing}/{len(data['segments'])} dòng trống)"

    data["id"] = vid
    cache.save_lesson(data)
    return True, f"{len(data['segments'])} dòng · nguồn: {data.get('source') or '?'}"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", help="chỉ một ngôn ngữ (en, ko, zh, ja)")
    ap.add_argument("--all", action="store_true", help="cả ngôn ngữ chưa mở cho người học")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--force", action="store_true", help="dựng lại cả video đã có bài")
    args = ap.parse_args()

    langs: tuple[str, ...] | None
    if args.lang:
        langs = (args.lang,)
    elif args.all:
        langs = None
    else:
        langs = OPEN_LANGS

    todo = catalog(langs, args.limit, args.force)
    if not todo:
        print("Không còn video nào cần dựng.")
        return 0

    print(f"{len(todo)} video cần dựng bài học.\n")
    ok = 0
    failed: list[tuple[str, str]] = []
    for i, v in enumerate(todo, 1):
        title = (v["title"] or "")[:46]
        print(f"[{i}/{len(todo)}] {v['lang']} {v['id']} · {v['dur'] or '?'} · {title}")
        started = time.time()
        try:
            good, detail = build(v)
        except Exception as exc:
            good, detail = False, f"{type(exc).__name__}: {exc}"
        secs = time.time() - started
        if good:
            ok += 1
            print(f"      xong sau {secs:.0f}s — {detail}")
        else:
            failed.append((v["id"], detail))
            print(f"      HỎNG sau {secs:.0f}s — {detail}")

    print(f"\nXong {ok}/{len(todo)}.")
    if failed:
        print("Chưa dựng được:")
        for vid, why in failed:
            print(f"  {vid}: {why}")
        print("Chạy lại lệnh này để thử tiếp các video còn thiếu.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
