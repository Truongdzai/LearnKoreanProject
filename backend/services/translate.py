from __future__ import annotations

import re

from . import llm
from .langs import study_name, native_name
from .. import db

_ARRAY_OF_STRINGS = {"type": "array", "items": {"type": "string"}}

_SENT_END = ".?!…\"')]}。！？"

_TOKEN_RE = re.compile(
    r"[0-9a-zÀ-ɏЀ-ӿ぀-ヿ一-鿿가-힯]+"
)


def _tokens(text: str) -> list[str]:
    return _TOKEN_RE.findall((text or "").lower())


def needs_repair(lines: list[str]) -> bool:
    real = [l.strip() for l in lines if l and l.strip()]
    if len(real) < 8:
        return False
    ended = sum(1 for l in real if l[-1] in _SENT_END)
    return ended / len(real) < 0.3


def _repair_window(chunk: list[str], lname: str) -> list[str]:
    numbered = "\n".join(f"{i + 1}. {l}" for i, l in enumerate(chunk))
    prompt = (
        f"Dưới đây là phụ đề tự động (ASR) {lname} của một video. Nó bị cắt vụn giữa câu, "
        "không có dấu câu, và có thể nghe nhầm từ.\n"
        "Hãy ghép lại thành các câu hoàn chỉnh. Yêu cầu:\n"
        f"- GIỮ NGUYÊN ngôn ngữ {lname}, TUYỆT ĐỐI không dịch.\n"
        "- Mỗi phần tử trả về phải là MỘT CÂU TRỌN VẸN, có dấu câu, viết hoa đúng.\n"
        "- KHÔNG được cắt giữa một cụm từ cố định (ví dụ 'all of a sudden' phải nằm nguyên trong một câu).\n"
        "- Giữ nguyên thứ tự lời thoại và ĐẦY ĐỦ nội dung; chỉ sửa từ khi chắc chắn ASR nghe nhầm.\n"
        "- Không thêm nội dung không có trong bản gốc.\n"
        "- Đoạn không phải lời thoại thì ghi [nhạc] hoặc [tiếng động].\n"
        "- Trả về một mảng JSON gồm các chuỗi câu, không kèm số thứ tự.\n\n"
        + numbered
    )
    arr = llm.gemini_json(prompt, _ARRAY_OF_STRINGS)
    if not isinstance(arr, list):
        return []
    return [str(x).strip() for x in arr if str(x).strip()]


def _align_sentences(sents: list[str], chunk: list[dict]) -> list[dict]:
    src: list[tuple[str, int]] = []
    for i, seg in enumerate(chunk):
        for tok in _tokens(seg.get("ko", "")):
            src.append((tok, i))
    if not src:
        return []
    out: list[dict] = []
    cursor = 0
    for sent in sents:
        toks = _tokens(sent)
        if not toks:
            continue
        pos = None
        for probe in toks[:3]:
            limit = min(len(src), cursor + 60)
            for p in range(cursor, limit):
                if src[p][0] == probe:
                    pos = p
                    break
            if pos is not None:
                break
        if pos is None:
            pos = min(cursor, len(src) - 1)
        out.append({"start": chunk[src[pos][1]]["start"], "ko": sent})
        cursor = min(len(src) - 1, pos + max(1, len(toks) - 1))
    return _spread_ties(out)


def _spread_ties(rows: list[dict]) -> list[dict]:
    n = len(rows)
    i = 0
    while i < n:
        j = i
        while j + 1 < n and rows[j + 1]["start"] == rows[i]["start"]:
            j += 1
        if j > i:
            head = rows[i]["start"]
            nxt = rows[j + 1]["start"] if j + 1 < n else head + 2.0
            span = max(0.0, nxt - head)
            step = span / (j - i + 1)
            for k in range(i + 1, j + 1):
                rows[k]["start"] = round(head + step * (k - i), 2)
        i = j + 1
    return rows


def repair_segments(segments: list[dict], lang: str = "en", window: int = 80) -> list[dict]:
    lines = [s.get("ko", "") for s in segments]
    if not needs_repair(lines):
        return segments
    lname = study_name(lang)
    merged: list[dict] = []
    for i in range(0, len(segments), window):
        chunk = segments[i:i + window]
        raw = [c.get("ko", "") for c in chunk]
        try:
            sents = _repair_window(raw, lname)
        except Exception:
            sents = []
        src_len = sum(len(x) for x in raw)
        new_len = sum(len(s) for s in sents)
        aligned = _align_sentences(sents, chunk) if sents else []
        if not aligned or new_len < src_len * 0.6:
            merged.extend(chunk)
            continue
        merged.extend(aligned)
    return merged or segments


def _translate_ordered(
    lines: list[str], lname: str, nname: str, note: str = "", batch: int = 30, ctx: int = 4
) -> list[str]:
    results: list[str] = []
    for i in range(0, len(lines), batch):
        chunk = lines[i:i + batch]
        before = lines[max(0, i - ctx):i]
        ctx_txt = ""
        if before:
            ctx_txt = (
                "Các câu NGAY TRƯỚC đoạn này (chỉ để hiểu mạch, KHÔNG dịch, KHÔNG đưa vào kết quả):\n"
                + "\n".join(before)
                + "\n\n"
            )
        numbered = "\n".join(f"{k + 1}. {l}" for k, l in enumerate(chunk))
        prompt = (
            "Bạn là người dịch phụ đề chuyên nghiệp. Đây là phụ đề liên tục của MỘT video, "
            f"hãy dịch từ {lname} sang {nname} sao cho mạch hội thoại liền lạc, xưng hô nhất quán "
            "giữa các câu, giọng tự nhiên đúng văn nói.\n"
            + (note.strip() + "\n" if note else "")
            + f"Giữ ĐÚNG thứ tự và ĐÚNG {len(chunk)} dòng. "
            f"Trả về một mảng JSON gồm {len(chunk)} chuỗi {nname}.\n\n"
            + ctx_txt
            + "Các câu CẦN DỊCH:\n"
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

def translate_segments(segments: list[dict], lang: str = "ko", note: str = "") -> list[dict]:
    kos = [s["ko"] for s in segments]
    conn = db.get_conn()
    try:
        cached = _cache_get(conn, kos)
        if any(k not in cached for k in kos):
            vis = _translate_ordered(kos, study_name(lang), native_name("vi"), note)
            fresh = {k: v for k, v in zip(kos, vis) if v}
            _cache_put(conn, fresh)
            cached = dict(cached)
            cached.update(fresh)
            for seg, vi in zip(segments, vis):
                seg["vi"] = vi or cached.get(seg["ko"], "")
            return segments
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
