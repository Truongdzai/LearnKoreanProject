from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


def convert(folder: Path, quality: int = 82) -> None:
    files = sorted(folder.rglob("*.png"))
    if not files:
        print(f"Khong tim thay .png trong {folder}")
        return

    before = after = 0
    for src in files:
        dst = src.with_suffix(".webp")
        img = Image.open(src).convert("RGBA")
        img.save(dst, "WEBP", quality=quality, method=6)
        b, a = src.stat().st_size, dst.stat().st_size
        before += b
        after += a
        print(f"{src.name:>16} {b // 1024:>5} KB -> {a // 1024:>5} KB  ({100 - a * 100 // b}% nho hon)")

    print(f"\nTong: {before // 1024} KB -> {after // 1024} KB "
          f"(giam {(before - after) // 1024} KB, {100 - after * 100 // before}%)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(1)
    convert(Path(sys.argv[1]), int(sys.argv[2]) if len(sys.argv) > 2 else 82)
