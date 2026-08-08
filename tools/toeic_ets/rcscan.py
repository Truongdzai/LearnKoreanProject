import numpy as np
from PIL import Image

from regions import as_array
from scans import RC_BOOK, page_image

PAGES_PER_TEST = 30
SET_PAGES = {
    176: (19, None),
    181: (21, None),
    186: (23, 24),
    191: (25, 26),
    196: (27, 28),
}
WHITE = 250
CONTENT_HEIGHT = 3335
FOOTER_GAP = 90
GUTTER_RUN = 260
GUTTER_HALF = 26
LINE = 46
LIFT = 300
SIDE_PAD = 24
MAX_WIDTH = 1000

def ink_rows(arr: np.ndarray) -> np.ndarray:
    return (arr < WHITE).sum(axis=1) > 14

def banner_bottom(arr: np.ndarray) -> int:
    return max(0, arr.shape[0] - CONTENT_HEIGHT)

def body_box(img: Image.Image) -> tuple[int, int, int, int]:
    full = as_array(img)
    top = banner_bottom(full)
    arr = full[top:]
    rows = ink_rows(arr)
    hits = np.where(rows)[0]
    if not len(hits):
        return (0, top, img.width, img.height)
    start, end = int(hits[0]), int(hits[-1]) + 1
    gaps = np.where(np.diff(hits) > FOOTER_GAP)[0]
    if len(gaps):
        end = int(hits[gaps[-1]]) + 1
    band = arr[start:end] < WHITE
    cols = np.where(band.sum(axis=0) > 2)[0]
    x0, x1 = (int(cols[0]), int(cols[-1]) + 1) if len(cols) else (0, img.width)
    return (max(0, x0 - SIDE_PAD), top + start,
            min(img.width, x1 + SIDE_PAD), top + end)

def gutter_x(arr: np.ndarray, box: tuple[int, int, int, int]) -> int:
    x0, y0, x1, y1 = box
    lower = arr[y1 - (y1 - y0) // 3: y1, x0:x1] < WHITE
    blank = lower.sum(axis=0) == 0
    lo, hi = (x1 - x0) * 2 // 5, (x1 - x0) * 3 // 5
    best, run, start = None, 0, 0
    for i in range(lo, hi):
        if blank[i]:
            start = i if run == 0 else start
            run += 1
            if best is None or run > best[1]:
                best = (start, run)
        else:
            run = 0
    if not best:
        return (x0 + x1) // 2
    return x0 + best[0] + best[1] // 2

def question_top(img: Image.Image, box: tuple[int, int, int, int]) -> int:
    x0, y0, x1, y1 = box
    arr = as_array(img)
    mid = gutter_x(arr, box)
    blank = (arr[y0:y1, mid - GUTTER_HALF: mid + GUTTER_HALF] < WHITE).sum(axis=1) == 0
    best = (0, 0)
    start = run = 0
    for i, empty in enumerate(blank):
        if empty:
            start = i if run == 0 else start
            run += 1
            if run > best[1]:
                best = (start, run)
        else:
            run = 0
    if best[1] < GUTTER_RUN:
        return y1
    top = best[0]
    ink = 0
    for i in range(best[0] - 1, max(-1, best[0] - LIFT), -1):
        if blank[i]:
            ink = 0
            top = i
        else:
            ink += 1
            if ink > LINE:
                break
    return y0 + top

def crops(test: int, start: int) -> list[Image.Image]:
    base = PAGES_PER_TEST * (test - 1)
    first, second = SET_PAGES[start]
    out = []
    page = page_image(RC_BOOK, base + first)
    out.append(page.crop(body_box(page)))
    if second is not None:
        page = page_image(RC_BOOK, base + second)
        box = body_box(page)
        cut = question_top(page, box)
        if cut - box[1] > 200:
            out.append(page.crop((box[0], box[1], box[2], cut)))
    return out

def save(test: int, start: int, dest, base_url: str) -> list[str]:
    urls = []
    for k, pic in enumerate(crops(test, start)):
        if pic.width > MAX_WIDTH:
            pic = pic.resize((MAX_WIDTH, round(pic.height * MAX_WIDTH / pic.width)),
                             Image.LANCZOS)
        name = f"rc-{start}-scan{k + 1}.webp"
        pic.save(dest / name, "WEBP", quality=84, method=6)
        urls.append(f"{base_url}/{name}")
    return urls
