from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend import db  # noqa: E402
from backend.services import cache  # noqa: E402

OUT_DIR = ROOT / "data" / "lessons"
BUCKET = "vyling-lessons"
CF_DIR = ROOT / "cf"
WRANGLER = CF_DIR / "node_modules" / "wrangler" / "bin" / "wrangler.js"


def collect(lang: str | None) -> list[dict]:
    conn = db.get_conn()
    try:
        rows = conn.execute("SELECT video_id FROM lesson_cache").fetchall()
        langs = {
            r["id"]: (r["lang"] or "ko")
            for r in conn.execute("SELECT id, lang FROM catalog_videos")
        }
    finally:
        conn.close()

    out = []
    for r in rows:
        vid = r["video_id"]
        if lang and langs.get(vid) != lang:
            continue
        lesson = cache.get_lesson(vid)
        if not lesson or not lesson["segments"]:
            continue
        spk = cache.get_speakers(vid)
        if spk and len(spk["speakers"]) == len(lesson["segments"]):
            for seg, s in zip(lesson["segments"], spk["speakers"]):
                seg["speaker"] = s
        out.append(lesson)
    return out


def run_wrangler(args: list[str]) -> tuple[bool, str]:
    proc = subprocess.run(
        ["node", str(WRANGLER), *args],
        cwd=str(CF_DIR),
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return proc.returncode == 0, (proc.stderr or "") + (proc.stdout or "")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang")
    ap.add_argument("--dry", action="store_true", help="chỉ xuất file ra data/lessons")
    args = ap.parse_args()

    lessons = collect(args.lang)
    if not lessons:
        print("Chưa có bài học nào dựng sẵn. Chạy scripts/prebuild_lessons.py trước.")
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    total = 0
    for lesson in lessons:
        payload = json.dumps(lesson, ensure_ascii=False, separators=(",", ":"))
        path = OUT_DIR / f"{lesson['id']}.json"
        path.write_text(payload, encoding="utf-8")
        total += len(payload.encode("utf-8"))

    print(f"{len(lessons)} bài · {total / 1024:.0f} KB → {OUT_DIR}")
    if args.dry:
        return 0

    if not WRANGLER.exists():
        print(f"Không thấy wrangler tại {WRANGLER}. Chạy: npm install --prefix cf")
        return 1

    ok, err = run_wrangler(["r2", "bucket", "info", BUCKET])
    if not ok:
        print(f"Chưa có bucket {BUCKET}, đang tạo...")
        ok, err = run_wrangler(["r2", "bucket", "create", BUCKET])
        if not ok:
            print(f"Tạo bucket hỏng: {err.strip()[:300]}")
            return 1

    failed = []
    for i, lesson in enumerate(lessons, 1):
        key = f"{lesson['id']}.json"
        ok, err = run_wrangler([
            "r2", "object", "put", f"{BUCKET}/{key}",
            "--file", str(OUT_DIR / key),
            "--content-type", "application/json",
            "--remote",
        ])
        mark = "ok " if ok else "LỖI"
        print(f"  [{i}/{len(lessons)}] {mark} {key}")
        if not ok:
            failed.append((key, err.strip()[:200]))

    print(f"\nXong {len(lessons) - len(failed)}/{len(lessons)}.")
    for key, why in failed:
        print(f"  {key}: {why}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
