from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

import yt_dlp

from . import llm, media
from .langs import study_name

CHUNK_SECONDS = 300
MAX_MINUTES = 40

_ASR_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {"t": {"type": "number"}, "text": {"type": "string"}},
        "required": ["t", "text"],
    },
}


def _ffmpeg() -> str:
    exe = media.ensure_ffmpeg()
    if not exe:
        raise RuntimeError(
            "Máy chưa có ffmpeg nên không tách được âm thanh. Hãy cài ffmpeg rồi thử lại."
        )
    return exe


def _download(video_id: str, workdir: str) -> str:
    opts = {
        "quiet": True,
        "no_warnings": True,
        "outtmpl": os.path.join(workdir, "src.%(ext)s"),
        "format": "bestaudio/best[acodec!=none]/18",
        "extractor_args": {"youtube": {"player_client": ["android"]}},
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=True)
    dur = info.get("duration") or 0
    if dur > MAX_MINUTES * 60:
        raise RuntimeError(f"Video dài quá {MAX_MINUTES} phút, chưa hỗ trợ tự tạo phụ đề.")
    files = [p for p in Path(workdir).glob("src.*") if p.is_file()]
    if not files:
        raise RuntimeError("Không tải được âm thanh của video.")
    return str(files[0])


def _split(src: str, workdir: str) -> list[tuple[str, float]]:
    out = os.path.join(workdir, "part%04d.mp3")
    subprocess.run(
        [
            _ffmpeg(), "-hide_banner", "-loglevel", "error", "-y",
            "-i", src, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k",
            "-f", "segment", "-segment_time", str(CHUNK_SECONDS), out,
        ],
        check=True,
        capture_output=True,
    )
    parts = sorted(Path(workdir).glob("part*.mp3"))
    if not parts:
        raise RuntimeError("Không cắt được âm thanh thành đoạn.")
    return [(str(p), i * float(CHUNK_SECONDS)) for i, p in enumerate(parts)]


def _probe_seconds(path: str) -> float:
    exe = _ffmpeg()
    probe = str(Path(exe).with_name("ffprobe.exe" if os.name == "nt" else "ffprobe"))
    if not Path(probe).exists():
        probe = "ffprobe"
    try:
        res = subprocess.run(
            [probe, "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", path],
            check=True, capture_output=True, text=True,
        )
        return float((res.stdout or "").strip())
    except Exception:
        return 0.0


def _fit(rows: list[dict], offset: float, dur: float) -> list[dict]:
    if not rows or dur <= 0:
        return rows
    top = max(r["start"] - offset for r in rows)
    if top > dur:
        scale = dur / top
        for r in rows:
            r["start"] = round(offset + (r["start"] - offset) * scale, 2)
    for r in rows:
        r["start"] = round(min(max(r["start"], offset), offset + dur), 2)
    return rows


def _transcribe_part(path: str, lang: str, offset: float) -> list[dict]:
    lname = study_name(lang)
    prompt = (
        f"Đây là một đoạn âm thanh có lời thoại {lname}. Hãy nghe và chép lại NGUYÊN VĂN.\n"
        f"- Chép bằng chính ngôn ngữ {lname}, TUYỆT ĐỐI không dịch.\n"
        "- Mỗi phần tử là MỘT CÂU trọn vẹn, có dấu câu và viết hoa đúng.\n"
        "- Không bịa nội dung; nghe không rõ thì bỏ qua.\n"
        "- Đoạn chỉ có nhạc hoặc tiếng động thì bỏ qua, không tạo phần tử.\n"
        '- Mỗi phần tử gồm "t" là giây bắt đầu tính từ ĐẦU ĐOẠN ÂM THANH NÀY, và "text" là câu.\n'
        '- "t" phải tăng dần.'
    )
    audio = Path(path).read_bytes()
    arr = llm.gemini_audio_json(prompt, audio, "audio/mpeg", _ASR_SCHEMA)
    rows: list[dict] = []
    if not isinstance(arr, list):
        return rows
    last = -1.0
    for item in arr:
        if not isinstance(item, dict):
            continue
        try:
            t = float(item.get("t"))
        except (TypeError, ValueError):
            continue
        text = str(item.get("text") or "").strip()
        if not text or t < 0 or t > CHUNK_SECONDS + 30 or t < last:
            continue
        rows.append({"start": round(offset + t, 2), "ko": text})
        last = t
    return _fit(rows, offset, _probe_seconds(path))


def transcribe(video_id: str, lang: str = "en") -> list[dict]:
    workdir = tempfile.mkdtemp(prefix="vyling_asr_")
    try:
        src = _download(video_id, workdir)
        parts = _split(src, workdir)
        segments: list[dict] = []
        for path, offset in parts:
            try:
                segments.extend(_transcribe_part(path, lang, offset))
            except Exception:
                continue
        if not segments:
            raise RuntimeError("Không nghe ra được lời thoại nào trong video.")
        segments.sort(key=lambda s: s["start"])
        return segments
    finally:
        shutil.rmtree(workdir, ignore_errors=True)
