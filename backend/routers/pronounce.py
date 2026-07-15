from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..errors import AppError
from ..schemas.pronounce import PronounceIn
from ..services import llm
from ..services.langs import study_name, native_name

router = APIRouter(prefix="/api/pronounce")


def _system(lang: str, native: str) -> str:
    lname = study_name(lang)
    nname = native_name(native)
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


@router.post("")
def api_pronounce(body: PronounceIn):
    if not body.target.strip():
        raise HTTPException(status_code=400, detail="Thiếu câu mẫu.")
    lname = study_name(body.lang)
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
        raise AppError("UPSTREAM_AI", f"AI không phản hồi: {exc}", 502)
    return {
        "feedback": data.get("feedback", ""),
        "tips": data.get("tips", []),
        "encouragement": data.get("encouragement", ""),
        "model": llm.current_model(),
    }
