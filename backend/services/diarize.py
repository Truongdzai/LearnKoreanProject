from __future__ import annotations

from ..config import settings
from . import llm

_SCHEMA = {
    "type": "object",
    "properties": {
        "speakers": {"type": "array", "items": {"type": "integer"}},
        "names": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["speakers"],
}

def _alternating(n: int) -> list[int]:
    return [i % 2 for i in range(n)]

def _fmt(lines: list[str], starts: list[float] | None) -> str:
    rows = []
    for i, ln in enumerate(lines):
        if starts and i < len(starts):
            t = starts[i]
            gap = t - starts[i - 1] if i > 0 and i - 1 < len(starts) else 0.0
            mm, ss = int(t // 60), int(t % 60)
            rows.append(f"{i + 1}. [{mm:02d}:{ss:02d}] (+{gap:.1f}s) {ln}")
        else:
            rows.append(f"{i + 1}. {ln}")
    return "\n".join(rows)

def label_speakers(lines: list[str], starts: list[float] | None = None) -> dict:
    n = len(lines)
    if n == 0:
        return {"speakers": [], "names": [], "source": "alt"}

    fallback = {"speakers": _alternating(n), "names": ["Nhân vật A", "Nhân vật B"], "source": "alt"}
    if settings["llm"].get("provider", "none") == "none":
        return fallback

    prompt = (
        "Đây là phụ đề tiếng Hàn theo thứ tự thời gian của một video hội thoại. "
        "Hãy xác định AI nói mỗi dòng: gán cho mỗi dòng một số người nói (bắt đầu từ 0), cùng người nói thì cùng số.\n"
        "Cách suy luận:\n"
        "- Dựa vào NỘI DUNG: ai hỏi – ai trả lời, ai được gọi tên, ai xưng hô thế nào, mức độ kính ngữ "
        "(합니다/해요/반말) thường nhất quán theo từng người.\n"
        "- Mốc thời gian [phút:giây] và (+Xs) là khoảng nghỉ so với dòng trước: khoảng nghỉ dài thường là lúc đổi "
        "người nói; nhiều dòng sát nhau (+ nhỏ) thường là CÙNG một người đang nói tiếp.\n"
        "- Một người CÓ THỂ nói nhiều dòng liên tiếp. TUYỆT ĐỐI KHÔNG luân phiên máy móc mỗi dòng đổi người. "
        "Thường là hội thoại 2 người, nhưng có thể nhiều hơn nếu nội dung cho thấy vậy.\n"
        f"Trả về 'speakers' gồm ĐÚNG {n} số nguyên theo đúng thứ tự, và 'names' là tên gợi nhớ cho từng nhân vật "
        "(suy ra tên thật nếu có, nếu không thì 'Nhân vật A', 'Nhân vật B'...).\n\n"
        + _fmt(lines, starts)
    )
    try:
        data = llm.gemini_json(prompt, _SCHEMA, temperature=0.1)
        spk = data.get("speakers") if isinstance(data, dict) else None
        if not isinstance(spk, list) or len(spk) != n:
            return fallback
        spk = [int(x) for x in spk]
        uniq = sorted(set(spk))
        remap = {v: i for i, v in enumerate(uniq)}
        spk = [remap[v] for v in spk]
        names = data.get("names") if isinstance(data.get("names"), list) else []
        names = [str(x) for x in names][: len(uniq)]
        while len(names) < len(uniq):
            names.append(f"Nhân vật {chr(65 + len(names))}")
        return {"speakers": spk, "names": names, "source": "ai"}
    except Exception:
        return fallback
