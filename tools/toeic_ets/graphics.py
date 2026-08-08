import json
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "TailieuToeic"
MEDIA = ROOT / "media" / "toeic" / "ets"
DATA = ROOT / "frontend" / "src" / "data" / "english" / "toeic" / "ets"

CROP_GROUPS = {56: [62], 62: [62], 65: [65, 68], 95: [95, 98]}
MANUAL = {"graphictucau95cuatest3.png": [(54, 61, 524, 304), (570, 76, 1000, 432)]}
DARK = 170
DILATE = 3
MIN_W = 110
MIN_H = 70
MAX_FILL = 0.72
PAD = 6
MIN_WIDTH = 700

def frames(img: Image.Image) -> list[tuple[int, int, int, int]]:
    dark = np.asarray(img.convert("L")) < DARK
    closed = ndimage.binary_dilation(dark, np.ones((DILATE, DILATE), bool))
    labels, _ = ndimage.label(closed)
    out = []
    for rows, cols in ndimage.find_objects(labels):
        box = (cols.start, rows.start, cols.stop, rows.stop)
        if box[2] - box[0] < MIN_W or box[3] - box[1] < MIN_H:
            continue
        if dark[rows, cols].mean() > MAX_FILL:
            continue
        out.append(box)
    return out

def drop_nested(boxes: list[tuple[int, int, int, int]]) -> list[tuple[int, int, int, int]]:
    return [
        b for b in boxes
        if not any(
            o is not b and o[0] <= b[0] and o[1] <= b[1] and o[2] >= b[2] and o[3] >= b[3]
            for o in boxes
        )
    ]

def by_column(boxes: list[tuple[int, int, int, int]]) -> list[tuple[int, int, int, int]]:
    columns: list[list[tuple[int, int, int, int]]] = []
    for box in sorted(boxes, key=lambda b: b[0]):
        for col in columns:
            if box[0] < max(b[2] for b in col) - 20:
                col.append(box)
                break
        else:
            columns.append([box])
    return [box for col in columns for box in sorted(col, key=lambda b: b[1])]

def sources() -> list[tuple[Path, int, list[int]]]:
    out = []
    for path in sorted(SRC.glob("graphictucau*.png")):
        m = re.fullmatch(r"graphictucau(\d+)cuatest(\d+)\.png", path.name)
        if not m or int(m.group(1)) not in CROP_GROUPS:
            continue
        out.append((path, int(m.group(2)), CROP_GROUPS[int(m.group(1))]))
    return out

def extract(write: bool) -> list[str]:
    unresolved = []
    for path, test, starts in sources():
        img = Image.open(path).convert("RGB")
        boxes = MANUAL.get(path.name) or by_column(drop_nested(frames(img)))
        if len(boxes) != len(starts):
            unresolved.append(f"{path.name}: cần {len(starts)} khung, dò ra {len(boxes)}")
            continue
        dest = MEDIA / f"t{test:02d}"
        for box, start in zip(boxes, starts):
            crop = img.crop((
                max(0, box[0] - PAD),
                max(0, box[1] - PAD),
                min(img.width, box[2] + PAD),
                min(img.height, box[3] + PAD),
            ))
            if crop.width < MIN_WIDTH:
                crop = crop.resize(
                    (MIN_WIDTH, round(crop.height * MIN_WIDTH / crop.width)),
                    Image.LANCZOS,
                )
            print(f"t{test:02d}/g-{start}.webp  {crop.width}x{crop.height}  <- {path.name}")
            if write:
                dest.mkdir(parents=True, exist_ok=True)
                crop.save(dest / f"g-{start}.webp", "WEBP", quality=88, method=6)
    return unresolved

def link() -> None:
    for path in sorted(DATA.glob("t*.json")):
        doc = json.loads(path.read_text(encoding="utf-8"))
        test = doc["test"]
        n = 0
        for part in ("p3", "p4"):
            for group in doc["listening"][part]:
                start = group["ns"][0]
                if not (MEDIA / f"t{test:02d}" / f"g-{start}.webp").exists():
                    continue
                group["img"] = f"/media/toeic/ets/t{test:02d}/g-{start}.webp"
                n += 1
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8", newline="\n")
        print(f"{path.name}: gắn {n} hình")

def main() -> int:
    write = "--write" in sys.argv
    unresolved = extract(write)
    if write and not unresolved:
        link()
    for line in unresolved:
        print("CHƯA DÒ ĐƯỢC —", line)
    return 1 if unresolved else 0

if __name__ == "__main__":
    raise SystemExit(main())
