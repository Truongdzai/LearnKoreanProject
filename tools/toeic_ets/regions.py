import numpy as np
from PIL import Image

WHITE = 250

def as_array(img: Image.Image) -> np.ndarray:
    return np.asarray(img.convert("L"), dtype=np.uint8)

def banner_end(pages: list[np.ndarray]) -> int:

    limit = min(int(a.shape[0] * 0.45) for a in pages)
    profiles = np.stack([a[:limit].mean(axis=1) for a in pages])
    median = np.median(profiles, axis=0)
    end = 0
    for i in range(limit):
        if median[i] < 248:
            end = i + 1
        elif i - end > 60:
            break
    return end

def content_top(images: list[Image.Image]) -> int:

    arrays = [as_array(im) for im in images]
    rough = banner_end(arrays)
    tally: dict[tuple[int, int], int] = {}
    for im in images:
        for _, y0, _, y1 in photo_boxes(im, rough, min_side=200):
            key = (round(y0 / 50), round(y1 / 50))
            tally[key] = tally.get(key, 0) + 1
    repeated = [k for k, n in tally.items() if n >= 0.7 * len(images)]
    if not repeated:
        return rough
    return max(k[1] for k in repeated) * 50 + 30

def content_box(arr: np.ndarray, top: int = 0) -> tuple[int, int, int, int]:

    ink = arr[top:] < WHITE
    rows = np.where(ink.any(axis=1))[0]
    cols = np.where(ink.any(axis=0))[0]
    if not len(rows) or not len(cols):
        return (0, top, arr.shape[1], arr.shape[0])
    return (int(cols[0]), top + int(rows[0]), int(cols[-1]) + 1, top + int(rows[-1]) + 1)

def cell_means(arr: np.ndarray, box: tuple[int, int, int, int], cell: int) -> np.ndarray:
    x0, y0, x1, y1 = box
    crop = arr[y0:y1, x0:x1].astype(np.float32)
    h, w = crop.shape
    gh, gw = max(1, h // cell), max(1, w // cell)
    crop = crop[: gh * cell, : gw * cell]
    return crop.reshape(gh, cell, gw, cell).mean(axis=(1, 3))

def blocks(mask: np.ndarray) -> list[tuple[int, int, int, int]]:

    seen = np.zeros_like(mask, dtype=bool)
    out = []
    for r in range(mask.shape[0]):
        for c in range(mask.shape[1]):
            if not mask[r, c] or seen[r, c]:
                continue
            stack = [(r, c)]
            seen[r, c] = True
            cells = []
            while stack:
                y, x = stack.pop()
                cells.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < mask.shape[0] and 0 <= nx < mask.shape[1] \
                            and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        stack.append((ny, nx))
            ys = [y for y, _ in cells]
            xs = [x for _, x in cells]
            out.append((min(ys), min(xs), max(ys) + 1, max(xs) + 1))
    return out

def photo_boxes(img: Image.Image, top: int, cell: int = 24, dark: float = 205.0,
                min_side: int = 300) -> list[tuple[int, int, int, int]]:

    arr = as_array(img)
    box = content_box(arr, top)
    grid = cell_means(arr, box, cell)
    found = []
    for r0, c0, r1, c1 in blocks(grid < dark):
        x0 = box[0] + c0 * cell
        y0 = box[1] + r0 * cell
        x1 = box[0] + c1 * cell
        y1 = box[1] + r1 * cell
        if x1 - x0 >= min_side and y1 - y0 >= min_side:
            found.append((x0, y0, x1, y1))
    return sorted(found, key=lambda b: b[1])

def tighten(img: Image.Image, box: tuple[int, int, int, int], pad: int = 6) -> tuple[int, int, int, int]:
    x0, y0, x1, y1 = box
    arr = as_array(img.crop(box))
    ink = arr < WHITE
    rows = np.where(ink.any(axis=1))[0]
    cols = np.where(ink.any(axis=0))[0]
    if not len(rows) or not len(cols):
        return box
    return (
        max(0, x0 + int(cols[0]) - pad),
        max(0, y0 + int(rows[0]) - pad),
        min(img.width, x0 + int(cols[-1]) + 1 + pad),
        min(img.height, y0 + int(rows[-1]) + 1 + pad),
    )
