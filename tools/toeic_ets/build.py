import json
import shutil
import sys
from pathlib import Path

import clean
import fixes
import photos
import rc67
import rcscan
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

def scrub_listening(listening: dict) -> list[int]:
    touched = []

    def fix(n: int, seq: list[str]) -> None:
        for i, opt in enumerate(seq):
            if not clean.vi_spans(opt):
                continue
            out = clean.clean_option(opt)
            if out:
                seq[i] = out
                touched.append(n)

    for item in listening["p1"]:
        fix(item["n"], item["statements"])
    for item in listening["p2"]:
        fix(item["n"], item["options"])
    for part in ("p3", "p4"):
        for group in listening[part]:
            for item in group["questions"]:
                fix(item["n"], item["options"])
    return sorted(set(touched))

def usable_p5(item: dict) -> bool:

    return bool(item["text"]) and clean.usable(item["text"], item["options"])

def build_parts67(test: int, key: dict[int, str], folder: str) -> tuple[list, list, list, list]:
    data = rc67.collect(test)
    rc67.save(data["sets"], MEDIA_OUT / f"t{test:02d}", folder)
    patch = fixes.reading_patch(test)
    for item in data["sets"]:
        have = {q["n"] for q in item["questions"]}
        item["questions"].extend(patch[n] for n in item["ns"] if n in patch and n not in have)
        item["questions"].sort(key=lambda q: q["n"])
    p6, p7, short = [], [], []
    for item in data["sets"]:
        start = item["ns"][0]
        imgs = item["imgs"]
        missing = item["shortPassage"]
        if missing and start in rcscan.SET_PAGES:
            scanned = rcscan.save(test, start, MEDIA_OUT / f"t{test:02d}", folder)
            if scanned:
                imgs, missing = scanned, 0
        if not imgs or not item["questions"]:
            continue
        for q in item["questions"]:
            q["answer"] = LETTERS.index(key[q["n"]])
        block = {"ns": item["ns"], "imgs": imgs, "questions": item["questions"]}
        if missing:
            block["short"] = missing
            short.append(start)
        (p6 if item["part"] == 6 else p7).append(block)
    kept = {q["n"] for block in p6 + p7 for q in block["questions"]}
    dropped = [n for n in range(131, 201) if n not in kept]
    return p6, p7, short, dropped

def build(test: int, with_audio: bool = True, with_photos: bool = True) -> dict:
    listening = parse_listening(test)
    reading = parse_reading(test)
    base = f"{AUDIO_BASE}/t{test:02d}/E26-T{test:02d}"
    folder = f"{MEDIA_BASE}/t{test:02d}"

    key = reading_key(test)
    patch = fixes.reading_patch(test)
    by_num = {q["n"]: q for q in reading["p5"]}
    by_num.update({n: q for n, q in patch.items() if n < 131})
    reading["p5"] = [by_num[n] for n in sorted(by_num)]
    disputed = []
    for q in reading["p5"]:
        if q["answer"] is not None and LETTERS[q["answer"]] != key[q["n"]]:
            disputed.append(q["n"])
        q["answer"] = LETTERS.index(key[q["n"]])

    p5 = [q for q in reading["p5"] if usable_p5(q)]
    dropped = [q["n"] for q in reading["p5"] if not usable_p5(q)]
    p6, p7, short, missing67 = build_parts67(test, key, folder)

    for item in listening["p1"] + listening["p2"]:
        item["mp3"] = f"{base}-{item['n']:02d}.mp3"
    for group in listening["p3"] + listening["p4"]:
        first = group["ns"][0]
        group["mp3"] = f"{base}-{first}-{first + 2}.mp3"
        if (MEDIA_OUT / f"t{test:02d}" / f"g-{first}.webp").is_file():
            group["img"] = f"{folder}/g-{first}.webp"
    fixes.apply_listening(test, listening)
    scrub_listening(listening)

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
        "reading": {"p5": p5, "p6": p6, "p7": p7},
        "gaps": {
            "readingMissing": sorted(n for n in set(reading["missing"] + dropped) if n < 131),
            "audioMissing": missing,
            "keyDisputed": disputed,
            "parts67Missing": missing67,
            "parts67Short": short,
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
        "p6": sum(len(g["questions"]) for g in doc["reading"]["p6"]),
        "p7": sum(len(g["questions"]) for g in doc["reading"]["p7"]),
    }

def index_row(doc: dict) -> dict:
    c = counts(doc)
    return {
        "id": doc["id"],
        "test": doc["test"],
        "name": doc["name"],
        "listening": c["p1"] + c["p2"] + c["p3"] + c["p4"],
        "part1": c["p1"],
        "part5": c["p5"],
        "reading": c["p5"] + c["p6"] + c["p7"],
    }

def main(tests: list[int], with_audio: bool = True, with_photos: bool = True) -> None:
    DATA_OUT.mkdir(parents=True, exist_ok=True)
    index: dict[int, dict] = {}
    for test in tests:
        doc = build(test, with_audio, with_photos)
        out = DATA_OUT / f"t{test:02d}.json"
        out.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")
        index[test] = index_row(doc)
        print(f"test {test}: {counts(doc)} -> {out.name} ({out.stat().st_size // 1024} KB)")

    for path in sorted(DATA_OUT.glob("t*.json")):
        doc = json.loads(path.read_text(encoding="utf-8"))
        index.setdefault(doc["test"], index_row(doc))
    rows = [index[k] for k in sorted(index)]
    (DATA_OUT / "index.json").write_text(
        json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"index.json: {len(rows)} tests")

if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("-")]
    main([int(a) for a in args] or list(range(1, 11)),
         with_audio="--no-audio" not in sys.argv,
         with_photos="--no-photos" not in sys.argv)
