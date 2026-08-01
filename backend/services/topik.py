from __future__ import annotations

from . import llm

TASK_INFO = {
    "51": {"max": 10, "name": "Câu 51 — điền 2 câu vào văn bản thực dụng (thông báo, tin nhắn)"},
    "52": {"max": 10, "name": "Câu 52 — điền 2 câu vào đoạn văn giải thích"},
    "53": {"max": 30, "name": "Câu 53 — viết đoạn 200-300 chữ mô tả biểu đồ / số liệu"},
    "54": {"max": 50, "name": "Câu 54 — viết luận 600-700 chữ nêu quan điểm"},
}

SCHEMA = {
    "type": "object",
    "properties": {
        "score": {"type": "integer"},
        "max": {"type": "integer"},
        "level_hint": {"type": "string"},
        "summary": {"type": "string"},
        "criteria": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "score": {"type": "integer"},
                    "max": {"type": "integer"},
                    "comment": {"type": "string"},
                },
                "required": ["name", "score", "max", "comment"],
            },
        },
        "errors": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "wrong": {"type": "string"},
                    "fix": {"type": "string"},
                    "why": {"type": "string"},
                },
                "required": ["wrong", "fix", "why"],
            },
        },
        "improved": {"type": "string"},
        "next_steps": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["score", "max", "summary", "criteria", "errors", "improved"],
}


def _system(task: str) -> str:
    info = TASK_INFO.get(task, TASK_INFO["53"])
    return (
        "Bạn là giám khảo chấm phần VIẾT (쓰기) của kỳ thi TOPIK, chấm nghiêm nhưng công tâm, "
        "nhận xét bằng tiếng Việt để người học Việt Nam hiểu ngay.\n"
        f"Dạng bài: {info['name']} — thang điểm tối đa {info['max']}.\n"
        "Cách chấm:\n"
        "- Bám đúng tiêu chí TOPIK: (1) Nội dung & nhiệm vụ đề bài, (2) Bố cục & mạch lạc, "
        "(3) Từ vựng & ngữ pháp (độ chính xác + độ đa dạng), (4) Văn phong đúng thể loại "
        "(bài 53/54 BẮT BUỘC dùng thể văn viết 문어체 '-(ㄴ/는)다', không dùng '-아요/어요').\n"
        "- Trừ điểm thật khi sai: sai trợ từ, sai chia đuôi, lặp từ, lạc đề, thiếu ý bắt buộc, sai số chữ.\n"
        "- 'errors': liệt kê tối đa 6 lỗi CỤ THỂ, mỗi lỗi trích đúng đoạn sai (wrong), câu sửa (fix) và lý do ngắn (why).\n"
        "- 'improved': viết lại bài của người học cho đúng chuẩn TOPIK, GIỮ nguyên ý của họ, đúng số chữ yêu cầu.\n"
        "- 'level_hint': ước lượng bài viết này tương đương cấp TOPIK nào (ví dụ '3급 수준').\n"
        "- Nếu bài quá ngắn hoặc lạc đề thì cho điểm thấp và nói thẳng lý do, không khen xã giao.\n"
        "Chỉ trả JSON đúng cấu trúc."
    )


def grade(task: str, prompt_text: str, answer: str) -> dict:
    info = TASK_INFO.get(task, TASK_INFO["53"])
    user = (
        f"ĐỀ BÀI:\n{prompt_text}\n\n"
        f"BÀI LÀM CỦA NGƯỜI HỌC ({len(answer)} ký tự):\n{answer}\n\n"
        f"Hãy chấm trên thang {info['max']} điểm theo đúng JSON yêu cầu."
    )
    data = llm.gemini_json(user, SCHEMA, system=_system(task), temperature=0.2)
    score = int(data.get("score") or 0)
    data["max"] = info["max"]
    data["score"] = max(0, min(score, info["max"]))
    data["model"] = llm.current_model()
    return data
