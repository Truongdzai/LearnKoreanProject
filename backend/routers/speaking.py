from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas.speaking import SpeakIn
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


@router.post("/api/speaking/reply")
def api_speaking_reply(body: SpeakIn):
    lname = _LANG_NAMES.get(body.lang, "tiếng Hàn")
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
        raise HTTPException(status_code=502, detail=f"AI không phản hồi: {exc}")
    return {
        "reply_ko": data.get("reply_ko", ""),
        "reply_vi": data.get("reply_vi", ""),
        "feedback": data.get("feedback", ""),
        "suggestions": data.get("suggestions", []),
        "done": bool(data.get("done", False)),
        "model": llm.current_model(),
    }
