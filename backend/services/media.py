from __future__ import annotations

import os
import shutil
from pathlib import Path

def find_ffmpeg_dir() -> str | None:
    if shutil.which("ffmpeg"):
        return None

    bases = []
    local = os.environ.get("LOCALAPPDATA")
    if local:
        bases.append(Path(local) / "Microsoft" / "WinGet" / "Packages")
    bases.append(Path("C:/Program Files/ffmpeg/bin"))

    patterns = ["Gyan.FFmpeg*/**/bin/ffmpeg.exe", "BtbN.FFmpeg*/**/ffmpeg.exe",
                "yt-dlp.FFmpeg*/**/ffmpeg.exe", "**/ffmpeg.exe"]
    for base in bases:
        if not base.exists():
            direct = base / "ffmpeg.exe"
            if direct.exists():
                return str(base)
            continue
        for pat in patterns:
            for hit in base.glob(pat):
                if hit.exists():
                    return str(hit.parent)
    return None

def ensure_ffmpeg() -> str | None:
    extra = find_ffmpeg_dir()
    if extra and extra not in os.environ.get("PATH", ""):
        os.environ["PATH"] = extra + os.pathsep + os.environ.get("PATH", "")
    return shutil.which("ffmpeg")
