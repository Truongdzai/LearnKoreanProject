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
    "us": {
        "W": "en-US-JennyNeural", "M": "en-US-GuyNeural",
        "W2": "en-US-AriaNeural", "M2": "en-US-EricNeural",
    },
    "gb": {
        "W": "en-GB-SoniaNeural", "M": "en-GB-RyanNeural",
        "W2": "en-GB-LibbyNeural", "M2": "en-GB-ThomasNeural",
    },
    "au": {
        "W": "en-AU-NatashaNeural", "M": "en-AU-WilliamMultilingualNeural",
        "W2": "en-AU-NatashaNeural", "M2": "en-AU-WilliamMultilingualNeural",
    },
}

THREE_SPEAKER_FALLBACK = {"au": "us"}


def load(name: str):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


def accent_for(index: int) -> str:
    if index % 4 == 1:
        return "gb"
    if index % 4 == 3:
        return "au"
    return "us"


def build_lines() -> dict[str, list[tuple[str, str, str]]]:
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
            speakers = {ln["s"] for ln in it["script"]}
            if len(speakers) > 2:
                acc = THREE_SPEAKER_FALLBACK.get(acc, acc)
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
