from __future__ import annotations

from . import llm
from .. import db

_ARRAY_OF_STRINGS = {"type": "array", "items": {"type": "string"}}

def translate_lines_vi(ko_lines: list[str], batch: int = 40) -> list[str]:
    results: list[str] = []
    for i in range(0, len(ko_lines), batch):
        chunk = ko_lines[i:i + batch]
        numbered = "\n".join(f"{idx + 1}. {line}" for idx, line in enumerate(chunk))
        prompt = (
            "Bạn là người dịch phụ đề chuyên nghiệp. Dịch sang tiếng Việt tự nhiên, "
            f"giữ ĐÚNG thứ tự và ĐÚNG {len(chunk)} dòng. "
            "Trả về một mảng JSON gồm các chuỗi tiếng Việt, mỗi chuỗi ứng với 1 dòng theo số thứ tự.\n\n"
            + numbered
        )
        try:
            arr = llm.gemini_json(prompt, _ARRAY_OF_STRINGS)
            if not isinstance(arr, list):
                arr = []
        except Exception:
            arr = []
        arr = [str(x) for x in arr]
        if len(arr) < len(chunk):
            arr += [""] * (len(chunk) - len(arr))
        results.extend(arr[:len(chunk)])
    return results

def _cache_get(conn, kos: list[str]) -> dict[str, str]:
    out: dict[str, str] = {}
    uniq = list(dict.fromkeys(kos))
    CHUNK = 400
    for i in range(0, len(uniq), CHUNK):
        part = uniq[i:i + CHUNK]
        ph = ",".join("?" * len(part))
        cur = conn.execute(f"SELECT ko, vi FROM translation_cache WHERE ko IN ({ph})", part)
        for row in cur.fetchall():
            out[row["ko"]] = row["vi"]
    return out

def _cache_put(conn, pairs: dict[str, str]) -> None:
    rows = [(k, v) for k, v in pairs.items() if v]
    if not rows:
        return
    conn.executemany(
        "INSERT OR IGNORE INTO translation_cache (ko, vi) VALUES (?,?)", rows
    )
    conn.commit()

def translate_segments(segments: list[dict]) -> list[dict]:
    kos = [s["ko"] for s in segments]
    conn = db.get_conn()
    try:
        cached = _cache_get(conn, kos)
        missing = [k for k in dict.fromkeys(kos) if k not in cached]
        if missing:
            vis = translate_lines_vi(missing)
            fresh = {k: v for k, v in zip(missing, vis) if v}
            _cache_put(conn, fresh)
            cached.update(fresh)
    finally:
        conn.close()

    for seg in segments:
        seg["vi"] = cached.get(seg["ko"], "")
    return segments
