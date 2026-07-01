from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas.pronounce import PronounceIn
from ..services import llm

router = APIRouter()

_LANG_NAMES = {
    "ko": "tiếng Hàn", "en": "tiếng Anh", "ja": "tiếng Nhật",
    "zh": "tiếng Trung", "de": "tiếng Đức", "vi": "tiếng Việt",
}
_NATIVE_NAMES = {
    "vi": "tiếng Việt", "en": "tiếng Anh", "ja": "tiếng Nhật", "zh": "tiếng Trung",
    "ko": "tiếng Hàn", "id": "tiếng Indonesia", "es": "tiếng Tây Ban Nha",
    "fr": "tiếng Pháp", "de": "tiếng Đức", "ru": "tiếng Nga", "it": "tiếng Ý",
    "pt": "tiếng Bồ Đào Nha",
}


def _system(lang: str, native: str) -> str:
    lname = _LANG_NAMES.get(lang, "tiếng Hàn")
    nname = _NATIVE_NAMES.get(native, "tiếng Việt")
    return (
        f"Bạn là giáo viên luyện phát âm {lname} thân thiện. "
        f"Dựa trên câu mẫu {lname}, nội dung học viên thực sự nói (từ nhận diện giọng nói), "
        f"và điểm chính xác, hãy nhận xét NGẮN GỌN bằng {nname}: khen điểm đã tốt, "
        "chỉ ra âm/từ cần sửa, và đưa 2-3 mẹo cụ thể, dễ làm. Giọng điệu tích cực, khích lệ."
    )

_SCHEMA = {
    "type": "object",
    "properties": {
        "feedback": {"type": "string"},
        "tips": {"type": "array", "items": {"type": "string"}},
        "encouragement": {"type": "string"},
    },
    "required": ["feedback", "tips", "encouragement"],
}


@router.post("/api/pronounce")
def api_pronounce(body: PronounceIn):
    if not body.target.strip():
        raise HTTPException(status_code=400, detail="Thiếu câu mẫu.")
    lname = _LANG_NAMES.get(body.lang, "tiếng Hàn")
    prompt = (
        f"Câu mẫu ({lname}): {body.target}\n"
        f"Nghĩa: {body.vi or '(không có)'}\n"
        f"Học viên đã nói (nhận diện được): {body.heard or '(không nghe rõ)'}\n"
        f"Điểm chính xác: {body.score}/100\n\n"
        "Hãy nhận xét và đưa mẹo phát âm theo đúng định dạng JSON yêu cầu."
    )
    try:
        data = llm.gemini_json(prompt, _SCHEMA, system=_system(body.lang, body.native), temperature=0.4)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI không phản hồi: {exc}")
    return {
        "feedback": data.get("feedback", ""),
        "tips": data.get("tips", []),
        "encouragement": data.get("encouragement", ""),
        "model": llm.current_model(),
    }
