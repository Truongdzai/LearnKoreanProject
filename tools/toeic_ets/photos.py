from functools import lru_cache
from pathlib import Path

from PIL import Image

from regions import content_top, photo_boxes, tighten
from scans import LC_BOOK, page_image

PAGES_PER_TEST = 14
PHOTO_PAGE_OFFSETS = (2, 3, 4)
PHOTOS_PER_PAGE = 2
CALIBRATION_PAGES = (1, 2, 3, 5, 7, 9, 16, 17, 20, 30)
MAX_WIDTH = 900

@lru_cache(maxsize=1)
def lc_content_top() -> int:
    return content_top([page_image(LC_BOOK, i) for i in CALIBRATION_PAGES])

def photo_pages(test: int) -> list[int]:
    base = PAGES_PER_TEST * (test - 1)
    return [base + off for off in PHOTO_PAGE_OFFSETS]

def page_photos(page: int, top: int) -> list[tuple[int, int, int, int]]:

    boxes = photo_boxes(page_image(LC_BOOK, page), top)
    boxes.sort(key=lambda b: (b[2] - b[0]) * (b[3] - b[1]), reverse=True)
    return sorted(boxes[:PHOTOS_PER_PAGE], key=lambda b: b[1])

def extract(test: int, dest: Path) -> list[str]:

    dest.mkdir(parents=True, exist_ok=True)
    top = lc_content_top()
    names = []
    n = 1
    for page in photo_pages(test):
        img = page_image(LC_BOOK, page)
        for box in page_photos(page, top):
            crop = img.crop(tighten(img, box, pad=4))
            if crop.width > MAX_WIDTH:
                crop = crop.resize(
                    (MAX_WIDTH, round(crop.height * MAX_WIDTH / crop.width)),
                    Image.LANCZOS,
                )
            name = f"p1-{n:02d}.webp"
            crop.save(dest / name, "WEBP", quality=82, method=6)
            names.append(name)
            n += 1
    return names
