import io
from functools import lru_cache
from pathlib import Path

from PIL import Image
from pypdf import PdfReader

from pdftext import SRC

LC_BOOK = SRC / "ETS 2026- LC.pdf"
RC_BOOK = SRC / "ETS 2026- RC.pdf"
TRANSCRIPT = SRC / "TRANSCRIPT.pdf"

MIN_STRIP_HEIGHT = 20

@lru_cache(maxsize=4)
def reader(path: str) -> PdfReader:
    return PdfReader(path)

def page_image(path: Path, index: int) -> Image.Image:
    strips = []
    for im in reader(str(path)).pages[index].images:
        img = Image.open(io.BytesIO(im.data))
        if img.height >= MIN_STRIP_HEIGHT:
            strips.append(img.convert("L"))
    if not strips:
        raise ValueError(f"{path.name} page {index} has no image strips")
    width = max(s.width for s in strips)
    canvas = Image.new("L", (width, sum(s.height for s in strips)), 255)
    y = 0
    for s in strips:
        canvas.paste(s, (0, y))
        y += s.height
    return canvas

def page_count(path: Path) -> int:
    return len(reader(str(path)).pages)
