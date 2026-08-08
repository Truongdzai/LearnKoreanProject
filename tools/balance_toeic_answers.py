import json
import random
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "frontend" / "src" / "data" / "english" / "toeic"
PARTS = ("part3", "part4", "part7")
LETTERED = ("part1", "part2", "part5", "part6")
SEED = 20260804
NOTE_FIELDS = ("explain", "trap", "vi")
BARE_LETTER = re.compile(r"(?<![A-Za-zÀ-ỹ\-])[A-D](?![A-Za-zÀ-ỹ0-9\-])")
QUOTED = re.compile(r"“[^”]*”")

ENDS_DIGIT = re.compile(r"\d\s*$")
CLOCK = re.compile(r"\d{1,2}:\d{2}")
CODE = re.compile(r"^[A-Z]{2,3}\s*\d+$")

def ordered_series(options, graphic):
    if all(ENDS_DIGIT.search(o) for o in options):
        return True
    if all(CLOCK.search(o) for o in options):
        return True
    if all(CODE.match(o.strip()) for o in options):
        return True
    if graphic:
        first = [str(r[0]).strip().lower() for r in graphic.get("rows", [])]
        cleaned = [o.strip().lower() for o in options]
        if len(first) >= len(cleaned) and cleaned == first[: len(cleaned)]:
            return True
    return False

def load(name):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))

def save(name, items):
    (DATA / f"{name}.json").write_text(
        json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def targets(count, width, rng):
    slots = [i % width for i in range(count)]
    rng.shuffle(slots)
    return slots

def report(label, answers, width):
    c = Counter(answers)
    total = max(1, len(answers))
    parts = " ".join(f"{chr(65 + i)}={c.get(i, 0) * 100 // total}%" for i in range(width))
    print(f"  {label:<8} n={total:<4} {parts}")

def mentions_letter(node):

    for field in NOTE_FIELDS:
        text = node.get(field)
        if isinstance(text, str) and BARE_LETTER.search(QUOTED.sub(" ", text)):
            return True
    return False

def shuffle_lettered(rng, apply_changes):
    for name in LETTERED:
        items = load(name)
        every = []
        free = []
        for item in items:
            for node in (item.get("blanks") or [item]):
                key = "statements" if "statements" in node else "options"
                every.append(node)
                if ordered_series(node[key], item.get("graphic")):
                    continue
                if mentions_letter(node):
                    continue
                free.append((node, key))

        width = max(len(n.get("statements") or n["options"]) for n in every)
        before = [n["answer"] for n in every]
        for (node, key), want in zip(free, targets(len(free), width, rng)):
            options = node[key]
            want = min(want, len(options) - 1)
            right = options[node["answer"]]
            rest = [i for i in range(len(options)) if i != node["answer"]]
            rng.shuffle(rest)
            ordering = rest[:want] + [node["answer"]] + rest[want:]
            node[key] = [options[i] for i in ordering]
            node["answer"] = want
            assert node[key][want] == right

        after = [n["answer"] for n in every]
        print(f"{name}: {len(free)} cau xao duoc / {len(every)} cau")
        report("truoc", before, width)
        report("sau", after, width)
        if apply_changes:
            save(name, items)

def main(apply_changes):
    rng = random.Random(SEED)
    for name in PARTS:
        items = load(name)
        free = []
        for item in items:
            for q in item["questions"]:
                if q.get("explain") or q.get("trap") or q.get("vi"):
                    continue
                if ordered_series(q["options"], item.get("graphic")):
                    continue
                free.append(q)

        before = [q["answer"] for item in items for q in item["questions"]]
        width = max(len(q["options"]) for item in items for q in item["questions"])
        print(f"{name}: {len(free)} cau xao duoc / {len(before)} cau")
        report("truoc", before, width)

        for q, want in zip(free, targets(len(free), width, rng)):
            options = q["options"]
            right = options[q["answer"]]
            rest = [o for i, o in enumerate(options) if i != q["answer"]]
            rng.shuffle(rest)
            want = min(want, len(options) - 1)
            new = rest[:want] + [right] + rest[want:]
            q["options"] = new
            q["answer"] = want

        after = [q["answer"] for item in items for q in item["questions"]]
        report("sau", after, width)
        if apply_changes:
            save(name, items)

    shuffle_lettered(rng, apply_changes)
    print("da ghi" if apply_changes else "chay thu, chua ghi (them --apply de ghi)")

if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main("--apply" in sys.argv)
