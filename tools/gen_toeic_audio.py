"""Sinh MP3 giọng neural cho ngân hàng nghe TOEIC (chạy 1 lần khi biên soạn nội dung).

Cách chạy:  .venv\\Scripts\\python.exe tools\\gen_toeic_audio.py

- Đọc part1-4 JSON, dựng đúng các dòng thoại như engine.ts (p1Group/p2Group/convGroup).
- Mỗi dòng thoại = 1 file MP3 tại frontend/public/audio/toeic/{itemId}-{i}.mp3
  (frontend phát tuần tự — người dùng KHÔNG cần giọng TTS trên máy).
- Giọng neural Microsoft (edge-tts): Mỹ mặc định; hội thoại/bài nói xen kẽ Anh/Úc
  theo xu hướng đề 2026. Chạy lại chỉ sinh file còn thiếu (idempotent).
- Xuất manifest {itemId: số dòng} vào frontend/src/data/english/toeic/audioManifest.json.
"""

import asyncio
import json
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "frontend" / "src" / "data" / "english" / "toeic"
OUT = ROOT / "frontend" / "public" / "audio" / "toeic"
MANIFEST = DATA / "audioManifest.json"

RATE = "-4%"
VOICES = {
    "us": {"W": "en-US-JennyNeural", "M": "en-US-GuyNeural"},
    "gb": {"W": "en-GB-SoniaNeural", "M": "en-GB-RyanNeural"},
    "au": {"W": "en-AU-NatashaNeural", "M": "en-AU-WilliamNeural"},
}


def load(name: str):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


def accent_for(index: int) -> str:
    if index % 4 == 1:
        return "gb"
    if index % 4 == 3:
        return "au"
    return "us"


def build_lines() -> dict[str, list[tuple[str, str, str]]]:
    """itemId -> [(speaker, text, accent)] — khớp thứ tự dòng trong engine.ts."""
    items: dict[str, list[tuple[str, str, str]]] = {}

    for it in load("part1"):
        lines = [("M", "Look at the picture.", "us")]
        for i, st in enumerate(it["statements"]):
            lines.append(("W", f"{'ABCD'[i]}. {st}", "us"))
        items[it["id"]] = lines

    for it in load("part2"):
        lines = [("W", it["q"], "us")]
        lines += [("M", o, "us") for o in it["options"]]
        items[it["id"]] = lines

    for name in ("part3", "part4"):
        for idx, it in enumerate(load(name)):
            acc = accent_for(idx)
            items[it["id"]] = [(ln["s"], ln["text"], acc) for ln in it["script"]]

    return items


async def gen_one(sem: asyncio.Semaphore, path: Path, speaker: str, text: str, accent: str) -> bool:
    if path.exists() and path.stat().st_size > 1000:
        return True
    voice = VOICES[accent][speaker]
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(text, voice, rate=RATE).save(str(path))
                if path.exists() and path.stat().st_size > 1000:
                    return True
            except Exception as e:
                if attempt == 2:
                    print(f"  LOI {path.name}: {e}")
                await asyncio.sleep(1 + attempt)
    return False


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    items = build_lines()
    print(f"{len(items)} item · {sum(len(v) for v in items.values())} dong thoai")

    sem = asyncio.Semaphore(4)
    tasks = []
    for item_id, lines in items.items():
        for i, (spk, text, acc) in enumerate(lines):
            tasks.append(gen_one(sem, OUT / f"{item_id}-{i}.mp3", spk, text, acc))
    results = await asyncio.gather(*tasks)
    ok = sum(1 for r in results if r)
    print(f"OK {ok}/{len(results)} file")

    if ok == len(results):
        manifest = {item_id: len(lines) for item_id, lines in sorted(items.items())}
        MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        size = sum(f.stat().st_size for f in OUT.glob("*.mp3"))
        print(f"Manifest {len(manifest)} item -> {MANIFEST.name}; tong dung luong {size/1e6:.1f} MB")
    else:
        print("Con file loi — chay lai script de sinh not (khong ghi manifest).")
        sys.exit(1)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    asyncio.run(main())
