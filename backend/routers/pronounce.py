from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from ..errors import AppError
from ..schemas.pronounce import PronounceIn
from ..services import auth, llm, quota
from ..services.langs import study_name, native_name

router = APIRouter(prefix="/api/pronounce", tags=["Phát âm"])
OptAuth = Depends(auth.get_optional_user)


def _system(lang: str, native: str) -> str:
    lname = study_name(lang)
    nname = native_name(native)
    return (
        f"Bạn là giáo viên luyện phát âm {lname} thân thiện. "
        f"Dựa trên câu mẫu {lname}, nội dung học viên thực sự nói (từ nhận diện giọng nói), "
        "điểm chính xác và danh sách âm bị lệch mà hệ thống đã đo được, "
        f"hãy nhận xét NGẮN GỌN bằng {nname}: khen điểm đã tốt, "
        "chỉ ra âm/từ cần sửa, và đưa 2-3 mẹo cụ thể, dễ làm. "
        "Nếu có danh sách âm bị lệch thì mẹo phải bám đúng những âm đó, mô tả bằng thao tác "
        "lưỡi/môi/hơi chứ đừng nói chung chung. Giọng điệu tích cực, khích lệ."
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
def api_pronounce(body: PronounceIn, request: Request, user: dict | None = OptAuth):
    if not body.target.strip():
        raise HTTPException(status_code=400, detail="Thiếu câu mẫu.")
    quota.consume("pronounce", user, quota.client_ip(request))
    lname = study_name(body.lang)
    issues = "; ".join(s.strip() for s in body.issues if s.strip())
    weak = ", ".join(w.strip() for w in body.weak_words if w.strip())
    prompt = (
        f"Câu mẫu ({lname}): {body.target}\n"
        f"Nghĩa: {body.vi or '(không có)'}\n"
        f"Học viên đã nói (nhận diện được): {body.heard or '(không nghe rõ)'}\n"
        f"Điểm chính xác: {body.score}/100\n"
        f"Âm bị lệch (hệ thống đo theo từng âm vị): {issues or '(không đo được)'}\n"
        f"Từ đọc chưa tới: {weak or '(không có)'}\n\n"
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
