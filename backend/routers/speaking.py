from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from ..errors import AppError
from ..schemas.speaking import SpeakIn
from ..services import auth, llm, quota
from ..services.langs import study_name, native_name

router = APIRouter(prefix="/api/speaking", tags=["Luyện nói"])
OptAuth = Depends(auth.get_optional_user)


def _system(lang: str, native: str) -> str:
    lname = study_name(lang)
    nname = native_name(native)
    return (
        f"Bạn là bạn đồng hành luyện hội thoại {lname} cho người mới học (giải thích bằng {nname}). "
        f"Bạn nhập vai một nhân vật trong tình huống được mô tả và trò chuyện thật TỰ NHIÊN bằng {lname}.\n"
        "Quy tắc:\n"
        f"- Lời thoại {lname} NGẮN, đơn giản, hợp trình độ người mới (1-2 câu), lịch sự.\n"
        "- Bám sát nhân vật và tình huống, dẫn dắt hội thoại tiến triển một cách hợp lý.\n"
        f"- Trường reply_ko chứa câu {lname}; reply_vi là bản dịch sát nghĩa, tự nhiên sang {nname}.\n"
        f"- Gợi ý 2-3 câu trả lời mẫu bằng {lname} (trường 'ko') kèm bản dịch {nname} (trường 'vi') để người học nói ở lượt tiếp theo.\n"
        f"- Nếu người học vừa nói, hãy nhận xét RẤT NGẮN bằng {nname} (khen điểm tốt, sửa lỗi nhẹ nếu có); để trống nếu họ chưa nói gì.\n"
        "- Khi hội thoại đã đạt mục tiêu hoặc đã đủ vài lượt, đặt done=true và kết thúc lịch sự.\n"
        "Chỉ trả về JSON đúng cấu trúc yêu cầu."
    )

_SCHEMA = {
    "type": "object",
    "properties": {
        "reply_ko": {"type": "string"},
        "reply_vi": {"type": "string"},
        "feedback": {"type": "string"},
        "suggestions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"ko": {"type": "string"}, "vi": {"type": "string"}},
                "required": ["ko", "vi"],
            },
        },
        "done": {"type": "boolean"},
    },
    "required": ["reply_ko", "reply_vi", "suggestions", "done"],
}


def _history_text(turns) -> str:
    if not turns:
        return "(chưa có)"
    lines = []
    for t in turns:
        who = "Nhân vật" if t.role == "bot" else "Người học"
        lines.append(f"{who}: {t.ko}")
    return "\n".join(lines)


@router.post("/reply")
def api_speaking_reply(body: SpeakIn, request: Request, user: dict | None = OptAuth):
    quota.consume("speaking", user, quota.client_ip(request))
    lname = study_name(body.lang)
    prompt = (
        f"TÌNH HUỐNG: {body.situation or '(không rõ)'}\n"
        f"VAI CỦA BẠN: {body.persona or 'một người bản xứ thân thiện'}\n"
        f"Ngôn ngữ hội thoại: {lname}\n"
        f"Trình độ người học: {body.level}\n\n"
        f"Lịch sử hội thoại:\n{_history_text(body.history)}\n\n"
        f"Người học vừa nói: {body.user_say or '(chưa nói gì)'}\n\n"
        "Hãy trả lời lượt tiếp theo của nhân vật theo đúng JSON yêu cầu."
    )
    try:
        data = llm.gemini_json(prompt, _SCHEMA, system=_system(body.lang, body.native), temperature=0.7)
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"AI không phản hồi: {exc}", 502)
    return {
        "reply_ko": data.get("reply_ko", ""),
        "reply_vi": data.get("reply_vi", ""),
        "feedback": data.get("feedback", ""),
        "suggestions": data.get("suggestions", []),
        "done": bool(data.get("done", False)),
        "model": llm.current_model(),
    }
