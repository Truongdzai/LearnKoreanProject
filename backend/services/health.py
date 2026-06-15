from __future__ import annotations

import sys
import shutil
from importlib import import_module
from pathlib import Path

from ..config import settings, DB_PATH
from . import ankiconnect

def _try_import(module: str):
    try:
        mod = import_module(module)
        return True, getattr(mod, "__version__", "đã cài")
    except Exception as exc:
        return False, str(exc)

def run_checks() -> list[dict]:
    checks: list[dict] = []

    def add(name, ok, detail, hint="", optional=False):
        checks.append({"name": name, "ok": ok, "detail": detail, "hint": hint, "optional": optional})

    add("Python", True, sys.version.split()[0])
    in_venv = sys.prefix != getattr(sys, "base_prefix", sys.prefix)
    add("Môi trường ảo (.venv)", in_venv,
        sys.prefix if in_venv else "Đang chạy Python hệ thống",
        "" if in_venv else "Hãy khởi động bằng start.bat để dùng đúng .venv")

    ffmpeg = shutil.which("ffmpeg")
    add("FFmpeg", bool(ffmpeg), ffmpeg or "Không thấy trên PATH",
        "" if ffmpeg else "Mở lại cửa sổ lệnh sau khi cài, hoặc cài lại Gyan.FFmpeg")
    ffprobe = shutil.which("ffprobe")
    add("FFprobe", bool(ffprobe), ffprobe or "Không thấy trên PATH")

    ok, ver = _try_import("yt_dlp")
    add("yt-dlp (tải video/sub)", ok, ver, "" if ok else "pip install yt-dlp")
    ok, ver = _try_import("edge_tts")
    add("edge-tts (đọc giọng Hàn)", ok, ver, "" if ok else "pip install edge-tts")

    anki_candidates = [
        Path.home() / "AppData/Local/Programs/Anki/anki.exe",
        Path("C:/Program Files/Anki/anki.exe"),
    ]
    anki_exe = next((str(p) for p in anki_candidates if p.exists()), None)
    add("Ứng dụng Anki", bool(anki_exe), anki_exe or "Chưa tìm thấy",
        "" if anki_exe else "Cài Anki rồi mở 1 lần")

    ac_ok, ac_detail = ankiconnect.check(settings["anki"]["url"])
    add("AnkiConnect (cầu nối)", ac_ok,
        f"API phiên bản {ac_detail}" if ac_ok else "Không kết nối được",
        "" if ac_ok else "Mở Anki → cài add-on mã 2055492159 → mở lại Anki")

    provider = settings["llm"]["provider"]
    llm_ok = provider != "none" and bool(settings["llm"]["api_key"])
    add("Bộ não AI (LLM)", llm_ok,
        f"{provider} · {settings['llm']['model'] or 'model mặc định'}" if llm_ok else f"provider = {provider}",
        "" if llm_ok else "Sẽ cấu hình ở Phase 3 (Gemini/Groq miễn phí hoặc Claude API)",
        optional=True)

    add("Cơ sở dữ liệu (SQLite)", Path(DB_PATH).exists(), str(DB_PATH))

    return checks
