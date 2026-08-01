from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "frontend" / "public" / "icons"
TOP = (59, 130, 246)
BOTTOM = (29, 58, 138)
SIZES = [192, 512]


def _bg(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), TOP)
    d = ImageDraw.Draw(img)
    for y in range(size):
        k = y / max(1, size - 1)
        d.line(
            [(0, y), (size, y)],
            fill=tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * k) for i in range(3)),
        )
    return img


def _font(px: int) -> ImageFont.FreeTypeFont:
    for name in ("segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"):
        try:
            return ImageFont.truetype(name, px)
        except OSError:
            continue
    return ImageFont.load_default()


def _letter(img: Image.Image, ratio: float) -> None:
    size = img.width
    d = ImageDraw.Draw(img)
    f = _font(round(size * ratio))
    box = d.textbbox((0, 0), "V", font=f)
    d.text(
        ((size - (box[2] - box[0])) / 2 - box[0], (size - (box[3] - box[1])) / 2 - box[1]),
        "V",
        font=f,
        fill=(255, 255, 255),
    )


def _rounded(img: Image.Image, radius_ratio: float) -> Image.Image:
    size = img.width
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, size - 1, size - 1], radius=round(size * radius_ratio), fill=255
    )
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        img = _bg(size)
        _letter(img, 0.62)
        _rounded(img, 0.22).save(OUT / f"icon-{size}.png")

    apple = _bg(180)
    _letter(apple, 0.62)
    apple.convert("RGBA").save(OUT / "apple-touch-icon.png")

    maskable = _bg(512)
    _letter(maskable, 0.46)
    maskable.convert("RGBA").save(OUT / "icon-maskable.png")

    for f in sorted(OUT.iterdir()):
        print(f"  {f.name:24} {f.stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
