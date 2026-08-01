import asyncio
import json
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "frontend" / "src" / "data" / "korean" / "topik"
OUT = ROOT / "frontend" / "public" / "audio" / "topik"
MANIFEST = DATA / "audioManifest.json"

RATE = "-10%"
VOICES = {"W": "ko-KR-SunHiNeural", "M": "ko-KR-InJoonNeural"}


async def synth(text: str, voice: str, path: Path) -> None:
    await edge_tts.Communicate(text, voice, rate=RATE).save(str(path))


async def main() -> int:
    items = json.loads((DATA / "listening.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)

    manifest: dict[str, int] = {}
    made = skipped = 0

    async def one(text: str, voice: str, path: Path, tag: str) -> bool:
        nonlocal made, skipped
        if path.exists() and path.stat().st_size > 0:
            skipped += 1
            return True
        try:
            await synth(text, voice, path)
        except Exception as e:
            print(f"  LOI {path.name}: {e}")
            return False
        made += 1
        print(f"  {path.name}  [{tag}]  {text[:34]}")
        return True

    for it in items:
        script = it.get("script") or []
        manifest[it["id"]] = len(script)
        for i, line in enumerate(script):
            voice = VOICES.get(line.get("s", "W"), VOICES["W"])
            if not await one(line["text"], voice, OUT / f"{it['id']}-{i}.mp3", line.get("s", "W")):
                return 1

    capsules = json.loads((DATA / "grammar.json").read_text(encoding="utf-8"))
    for c in capsules:
        ex = c.get("examples") or []
        manifest[f"{c['id']}-ex"] = len(ex)
        for i, e in enumerate(ex):
            voice = VOICES["W"] if i % 2 == 0 else VOICES["M"]
            if not await one(e["ko"], voice, OUT / f"{c['id']}-ex{i}.mp3", "vd"):
                return 1

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum(f.stat().st_size for f in OUT.glob("*.mp3"))
    print(f"\nXong: {made} file moi, {skipped} da co. Tong {len(list(OUT.glob('*.mp3')))} file, "
          f"{total // 1024} KB. Manifest: {MANIFEST.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
