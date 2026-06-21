from __future__ import annotations

import json
import re

import httpx
import yt_dlp

from ..config import settings

_KO_KEYS = ("ko", "ko-KR", "ko-orig")

_ID_RE = re.compile(r"(?:v=|/shorts/|/embed/|youtu\.be/)([0-9A-Za-z_-]{11})")

def extract_id(url: str) -> str:
    url = (url or "").strip()
    m = _ID_RE.search(url)
    if m:
        return m.group(1)
    if re.fullmatch(r"[0-9A-Za-z_-]{11}", url):
        return url
    return ""

def proxy() -> str:
    return (settings.get("network", {}) or {}).get("proxy", "") or ""

def _pick_track(tracks_map: dict):
    for key in _KO_KEYS:
        if key in tracks_map and tracks_map[key]:
            return tracks_map[key]
    return None

def _parse_json3(text: str) -> list[dict]:
    data = json.loads(text)
    out: list[dict] = []
    prev = None
    for ev in data.get("events", []):
        segs = ev.get("segs")
        if not segs:
            continue
        txt = "".join(s.get("utf8", "") for s in segs).replace("\n", " ").strip()
        if not txt or txt == prev:
            continue
        out.append({"start": round(ev.get("tStartMs", 0) / 1000, 2), "ko": txt})
        prev = txt
    return out

def _parse_vtt(text: str) -> list[dict]:
    import re

    out: list[dict] = []
    prev = None
    blocks = re.split(r"\n\s*\n", text)
    ts_re = re.compile(r"(\d+):(\d+):(\d+)[.,](\d+)\s*-->")
    tag_re = re.compile(r"<[^>]+>")
    for block in blocks:
        lines = block.strip().splitlines()
        start = None
        text_lines = []
        for ln in lines:
            m = ts_re.search(ln)
            if m:
                h, mi, s, _ms = (int(x) for x in m.groups())
                start = h * 3600 + mi * 60 + s
            elif ln.strip() and "-->" not in ln and ln.strip().upper() != "WEBVTT":
                text_lines.append(tag_re.sub("", ln).strip())
        txt = " ".join(t for t in text_lines if t).strip()
        if start is not None and txt and txt != prev:
            out.append({"start": float(start), "ko": txt})
            prev = txt
    return out

_SUB_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    ),
    "Accept-Language": "ko,en;q=0.9",
}

def _download_subs(track: list) -> list[dict]:
    order = []
    for ext in ("json3", "vtt"):
        fmt = next((t for t in track if t.get("ext") == ext), None)
        if fmt:
            order.append((ext, fmt))
    if not order:
        order.append((track[0].get("ext"), track[0]))

    px = proxy() or None
    last = None
    for ext, fmt in order:
        try:
            with httpx.Client(timeout=30.0, headers=_SUB_HEADERS, proxy=px) as client:
                resp = client.get(fmt["url"])
        except Exception as exc:
            last = exc
            continue
        if resp.status_code == 429:
            raise RuntimeError(
                "YouTube đang tạm giới hạn tải phụ đề (lỗi 429 — quá nhiều yêu cầu). "
                "Hãy đợi vài phút rồi thử lại."
            )
        if resp.status_code != 200 or not resp.text.strip():
            last = RuntimeError(f"HTTP {resp.status_code}")
            continue
        try:
            segs = _parse_json3(resp.text) if ext == "json3" else _parse_vtt(resp.text)
        except Exception as exc:
            last = exc
            continue
        if segs:
            return segs
        last = RuntimeError("phụ đề trống")
    raise RuntimeError(f"không đọc được phụ đề ({last})")

def get_korean_segments(url: str) -> dict:
    ydl_opts = {"skip_download": True, "quiet": True, "no_warnings": True}
    if proxy():
        ydl_opts["proxy"] = proxy()
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except Exception as exc:
        msg = str(exc).lower()
        if "not a bot" in msg or "sign in to confirm" in msg:
            raise RuntimeError(
                "YouTube đang yêu cầu xác minh (chặn bot tạm thời cho máy này, "
                "thường do tải nhiều video liên tiếp trong thời gian ngắn). "
                "Hãy đợi khoảng 30–60 phút rồi thử lại."
            )
        if "429" in msg or "too many requests" in msg:
            raise RuntimeError(
                "YouTube tạm giới hạn (lỗi 429 — quá nhiều yêu cầu). "
                "Hãy đợi vài phút rồi thử lại."
            )
        raise RuntimeError(f"Không lấy được thông tin video: {exc}")

    subs = info.get("subtitles") or {}
    autos = info.get("automatic_captions") or {}

    track = _pick_track(subs)
    source = "phụ đề chính thức"
    if track is None:
        track = _pick_track(autos)
        source = "phụ đề tự động (auto)"
    if track is None:
        raise RuntimeError(
            "Video này không có phụ đề tiếng Hàn. "
            "(Phase 2 sẽ bổ sung tự tạo phụ đề bằng Whisper.)"
        )

    segments = _download_subs(track)

    return {
        "id": info.get("id"),
        "title": info.get("title"),
        "channel": info.get("uploader") or info.get("channel"),
        "source": source,
        "segments": segments,
    }
