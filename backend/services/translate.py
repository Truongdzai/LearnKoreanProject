from __future__ import annotations

from . import llm
from .langs import study_name, native_name
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


def _translate_lines_to(lines: list[str], lang: str, native: str, batch: int = 40) -> list[str]:
    lname = study_name(lang)
    nname = native_name(native)
    results: list[str] = []
    for i in range(0, len(lines), batch):
        chunk = lines[i:i + batch]
        numbered = "\n".join(f"{idx + 1}. {line}" for idx, line in enumerate(chunk))
        prompt = (
            f"Bạn là người dịch phụ đề chuyên nghiệp. Dịch các câu {lname} sau sang {nname} "
            f"tự nhiên, giữ ĐÚNG thứ tự và ĐÚNG {len(chunk)} dòng. "
            f"Trả về một mảng JSON gồm các chuỗi {nname}, mỗi chuỗi ứng với 1 dòng theo số thứ tự.\n\n"
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


def _cache_get_native(conn, lang: str, native: str, kos: list[str]) -> dict[str, str]:
    out: dict[str, str] = {}
    uniq = list(dict.fromkeys(kos))
    CHUNK = 400
    for i in range(0, len(uniq), CHUNK):
        part = uniq[i:i + CHUNK]
        ph = ",".join("?" * len(part))
        cur = conn.execute(
            f"SELECT ko, txt FROM translation_cache_native WHERE lang=? AND native=? AND ko IN ({ph})",
            [lang, native, *part],
        )
        for row in cur.fetchall():
            out[row["ko"]] = row["txt"]
    return out


def _cache_put_native(conn, lang: str, native: str, pairs: dict[str, str]) -> None:
    rows = [(lang, native, k, v) for k, v in pairs.items() if v]
    if not rows:
        return
    conn.executemany(
        "INSERT OR IGNORE INTO translation_cache_native (lang, native, ko, txt) VALUES (?,?,?,?)",
        rows,
    )
    conn.commit()


def translate_lines_native(lines: list[str], lang: str, native: str) -> list[str]:
    """Dịch danh sách câu sang tiếng mẹ đẻ đã chọn, có cache riêng theo (lang, native)."""
    kos = [str(x) for x in lines]
    if native == "vi":
        return translate_lines_vi(kos)
    conn = db.get_conn()
    try:
        cached = _cache_get_native(conn, lang, native, kos)
        missing = [k for k in dict.fromkeys(kos) if k and k not in cached]
        if missing:
            txts = _translate_lines_to(missing, lang, native)
            fresh = {k: v for k, v in zip(missing, txts) if v}
            _cache_put_native(conn, lang, native, fresh)
            cached.update(fresh)
    finally:
        conn.close()
    return [cached.get(k, "") for k in kos]
