import hashlib
import json
import sys
import zipfile
from pathlib import Path

from pdftext import ROOT

DATA_DIR = ROOT / "frontend" / "src" / "data" / "english" / "toeic" / "ets"
MEDIA_DIR = ROOT / "media" / "toeic" / "ets"
BUNDLE = ROOT / "dist" / "toeic-ets-bundle.zip"
MANIFEST = "manifest.json"

PARTS = {
    "data": DATA_DIR,
    "media": MEDIA_DIR,
}

def files_of(root: Path) -> list[Path]:
    return sorted(p for p in root.rglob("*") if p.is_file())

def digest(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()

def build_manifest() -> dict:
    out = {"parts": {}}
    for name, root in PARTS.items():
        entries = []
        for path in files_of(root):
            entries.append({
                "path": path.relative_to(root).as_posix(),
                "size": path.stat().st_size,
            })
        out["parts"][name] = entries
    out["totalFiles"] = sum(len(v) for v in out["parts"].values())
    out["totalBytes"] = sum(e["size"] for v in out["parts"].values() for e in v)
    return out

def pack() -> None:
    for name, root in PARTS.items():
        if not root.exists():
            raise SystemExit(f"thiếu {root} — chạy build.py trước")
    BUNDLE.parent.mkdir(parents=True, exist_ok=True)
    manifest = build_manifest()

    with zipfile.ZipFile(BUNDLE, "w", zipfile.ZIP_STORED) as zf:
        zf.writestr(MANIFEST, json.dumps(manifest, ensure_ascii=False, indent=1))
        for name, root in PARTS.items():
            for path in files_of(root):
                zf.write(path, f"{name}/{path.relative_to(root).as_posix()}")
    mb = BUNDLE.stat().st_size / (1 << 20)
    print(f"{BUNDLE.relative_to(ROOT)}: {manifest['totalFiles']} file · {mb:.0f} MB")

def restore(archive: Path) -> None:
    if not archive.is_file():
        raise SystemExit(f"không thấy {archive}")
    with zipfile.ZipFile(archive) as zf:
        manifest = json.loads(zf.read(MANIFEST))
        for name, root in PARTS.items():
            root.mkdir(parents=True, exist_ok=True)
            for entry in manifest["parts"][name]:
                target = root / entry["path"]
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(zf.read(f"{name}/{entry['path']}"))
    print(f"đã giải nén {manifest['totalFiles']} file vào media/ và frontend/src/data/")
    check()

def check() -> None:
    ok = True
    for name, root in PARTS.items():
        if not root.exists():
            print(f"✗ thiếu {root.relative_to(ROOT)}")
            ok = False
            continue
        print(f"✓ {root.relative_to(ROOT)}: {len(files_of(root))} file")
    index = DATA_DIR / "index.json"
    if index.is_file():
        tests = json.loads(index.read_text(encoding="utf-8"))
        for t in tests:
            folder = MEDIA_DIR / f"t{t['test']:02d}"
            mp3 = len(list(folder.glob("*.mp3"))) if folder.exists() else 0
            img = len(list(folder.glob("*.webp"))) if folder.exists() else 0
            flag = "✓" if (mp3 == 54 and img == 6) else "✗"
            if flag == "✗":
                ok = False
            print(f"  {flag} đề {t['test']}: {t['listening']} câu Nghe · {t['part5']} câu Part 5"
                  f" · {mp3}/54 mp3 · {img}/6 ảnh")
    else:
        print("✗ chưa có index.json")
        ok = False
    if not ok:
        raise SystemExit(1)

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "check"
    if cmd == "pack":
        pack()
    elif cmd == "restore":
        restore(Path(sys.argv[2]) if len(sys.argv) > 2 else BUNDLE)
    elif cmd == "check":
        check()
    else:
        raise SystemExit(__doc__)
