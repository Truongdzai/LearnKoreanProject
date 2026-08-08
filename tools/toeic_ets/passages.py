from functools import lru_cache

import numpy as np
from PIL import Image

from regions import as_array, content_top, WHITE
from scans import RC_BOOK, page_image

PAGES_PER_TEST = 30
CALIBRATION_PAGES = (1, 2, 5, 8, 11, 14, 17, 20, 23, 26)
LINE_GAP = 12
MARGIN_SLACK = 14
MAX_WIDTH = 1000

@lru_cache(maxsize=1)
def rc_content_top() -> int:
    return content_top([page_image(RC_BOOK, i) for i in CALIBRATION_PAGES])

def text_lines(arr: np.ndarray, top: int) -> list[tuple[int, int, int]]:

    ink = arr[top:] < WHITE
    rows = ink.any(axis=1)
    lines = []
    y = 0
    while y < len(rows):
        if not rows[y]:
            y += 1
            continue
        end = y
        blank = 0
        while end < len(rows) and blank <= LINE_GAP:
            end += 1
            blank = 0 if (end < len(rows) and rows[end]) else blank + 1
        band = ink[y:end]
        cols = np.where(band.any(axis=0))[0]
        if len(cols):
            lines.append((top + y, top + end, int(cols[0])))
        y = end
    return lines

def blocks(arr: np.ndarray, top: int) -> list[dict]:

    lines = text_lines(arr, top)
    if not lines:
        return []
    margin = min(l[2] for l in lines)
    out = []
    for y0, y1, left in lines:
        kind = "margin" if left <= margin + MARGIN_SLACK else "body"
        if out and out[-1]["kind"] == kind:
            out[-1]["y1"] = y1
        else:
            out.append({"kind": kind, "y0": y0, "y1": y1})
    return out

def page_passages(page: int, top: int) -> list[tuple[int, int]]:

    img = page_image(RC_BOOK, page)
    arr = as_array(img)
    return [(b["y0"], b["y1"]) for b in blocks(arr, top) if b["kind"] == "body"]

def crop(page: int, span: tuple[int, int], pad: int = 20) -> Image.Image:
    img = page_image(RC_BOOK, page)
    arr = as_array(img)
    y0, y1 = span
    band = arr[y0:y1] < WHITE
    cols = np.where(band.any(axis=0))[0]
    x0, x1 = (int(cols[0]), int(cols[-1]) + 1) if len(cols) else (0, img.width)
    box = (max(0, x0 - pad), max(0, y0 - pad),
           min(img.width, x1 + pad), min(img.height, y1 + pad))
    out = img.crop(box)
    if out.width > MAX_WIDTH:
        out = out.resize((MAX_WIDTH, round(out.height * MAX_WIDTH / out.width)), Image.LANCZOS)
    return out
