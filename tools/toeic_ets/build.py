import json
import shutil
import sys
from pathlib import Path

import photos
from answer_keys import reading_key
from lc import LETTERS, parse_listening
from pdftext import ROOT, audio_dir
from rc import parse_reading

DATA_OUT = ROOT / "frontend" / "src" / "data" / "english" / "toeic" / "ets"
MEDIA_OUT = ROOT / "media" / "toeic" / "ets"
MEDIA_BASE = "/media/toeic/ets"
AUDIO_BASE = MEDIA_BASE

def audio_names(test: int) -> dict[str, str]:
    tag = f"E26-T{test:02d}"
    names = {str(n): f"{tag}-{n:02d}.mp3" for n in range(1, 32)}
    for start in range(32, 101, 3):
        names[f"{start}-{start + 2}"] = f"{tag}-{start}-{start + 2}.mp3"
    return names

def copy_audio(test: int) -> tuple[int, list[str]]:
    src = audio_dir(test)
    dest = MEDIA_OUT / f"t{test:02d}"
    dest.mkdir(parents=True, exist_ok=True)
    copied, missing = 0, []
    for name in audio_names(test).values():
        origin = src / name
        if not origin.is_file():
            missing.append(name)
            continue
        target = dest / name
        if not target.is_file() or target.stat().st_size != origin.stat().st_size:
            shutil.copy2(origin, target)
        copied += 1
    return copied, missing

def usable_p5(item: dict) -> bool:

    return bool(item["text"]) and len(item["options"]) == 4 and item["answer"] is not None

def build(test: int, with_audio: bool = True, with_photos: bool = True) -> dict:
    listening = parse_listening(test)
    reading = parse_reading(test)
    base = f"{AUDIO_BASE}/t{test:02d}/E26-T{test:02d}"
    folder = f"{MEDIA_BASE}/t{test:02d}"

    key = reading_key(test)
    disputed = []
    for q in reading["p5"]:
        if q["answer"] is not None and LETTERS[q["answer"]] != key[q["n"]]:
            disputed.append(q["n"])
        q["answer"] = LETTERS.index(key[q["n"]])

    p5 = [q for q in reading["p5"] if usable_p5(q)]
    dropped = [q["n"] for q in reading["p5"] if not usable_p5(q)]

    for item in listening["p1"] + listening["p2"]:
        item["mp3"] = f"{base}-{item['n']:02d}.mp3"
    for group in listening["p3"] + listening["p4"]:
        first = group["ns"][0]
        group["mp3"] = f"{base}-{first}-{first + 2}.mp3"

    if with_photos:
        names = photos.extract(test, MEDIA_OUT / f"t{test:02d}")
        for item, name in zip(listening["p1"], names):
            item["img"] = f"{folder}/{name}"

    missing = []
    if with_audio:
        _, missing = copy_audio(test)

    return {
        "id": f"ets26-t{test:02d}",
        "test": test,
        "name": f"ETS 2026 · Test {test}",
        "listening": listening,
        "reading": {"p5": p5},
        "gaps": {
            "readingMissing": sorted(set(reading["missing"] + dropped)),
            "audioMissing": missing,
            "keyDisputed": disputed,
            "parts67": "chưa nhập",
        },
    }

def counts(doc: dict) -> dict:
    lis = doc["listening"]
    return {
        "p1": len(lis["p1"]),
        "p2": len(lis["p2"]),
        "p3": sum(len(g["questions"]) for g in lis["p3"]),
        "p4": sum(len(g["questions"]) for g in lis["p4"]),
        "p5": len(doc["reading"]["p5"]),
    }

def main(tests: list[int], with_audio: bool = True, with_photos: bool = True) -> None:
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    index = []
    for test in tests:
        doc = build(test, with_audio, with_photos)
        path = DATA_OUT / f"t{test:02d}.json"
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
        c = counts(doc)
        index.append({
            "id": doc["id"],
            "test": test,
            "name": doc["name"],
            "listening": c["p1"] + c["p2"] + c["p3"] + c["p4"],
            "part1": c["p1"],
            "part5": c["p5"],
        })
        print(f"test {test}: {c} -> {path.name} ({path.stat().st_size // 1024} KB)")
    (DATA_OUT / "index.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"index.json: {len(index)} tests")

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    main([int(a) for a in args] or list(range(1, 11)),
         with_audio="--no-audio" not in sys.argv,
         with_photos="--no-photos" not in sys.argv)
