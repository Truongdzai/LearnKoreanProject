from __future__ import annotations

from . import llm

TASKS = {
    "use": (
        "Người học vừa TỰ ĐẶT MỘT CÂU MỚI bằng cụm mục tiêu. "
        "Việc của bạn: kiểm tra câu đó có dùng ĐÚNG cụm mục tiêu không, có đúng ngữ pháp không, "
        "và người bản xứ có nói như vậy không."
    ),
    "respond": (
        "Người học vừa NGHE MỘT CÂU HỎI và trả lời ngay trong vài giây. "
        "Việc của bạn: xét câu trả lời có hợp lý với câu hỏi không, có tự nhiên không. "
        "Ưu tiên phản xạ và sự tự nhiên hơn là ngữ pháp hoàn hảo."
    ),
    "retell": (
        "Người học vừa KỂ LẠI bằng lời của mình một đoạn hội thoại hoặc một cảnh vừa xem. "
        "Việc của bạn: xét xem họ có truyền đạt được nội dung chính không, câu có mạch lạc không."
    ),
    "email": (
        "Người học vừa VIẾT MỘT EMAIL hoặc TIN NHẮN CÔNG VIỆC bằng tiếng Anh. "
        "Việc của bạn: xét văn phong có đúng mức trang trọng không, bố cục có rõ không, ngữ pháp có sai không."
    ),
    "free": (
        "Người học vừa NÓI TỰ DO về một tình huống, không có gợi ý. "
        "Việc của bạn: xét ý có rõ không, câu có nối được với nhau không."
    ),
}

LEVELS = {
    "a1a2": "mới bắt đầu — chỉ yêu cầu câu đơn đúng, đừng bắt bẻ sắc thái",
    "a2b1": "đã có nền — yêu cầu câu đúng thì, đúng giới từ, bắt đầu chú ý sự tự nhiên",
    "b1b2": "khá — yêu cầu diễn đạt tự nhiên, đúng văn phong, tránh dịch máy móc từ tiếng Việt",
}

SCHEMA = {
    "type": "object",
    "properties": {
        "ok": {"type": "boolean"},
        "score": {"type": "integer"},
        "used_target": {"type": "boolean"},
        "fixed": {"type": "string"},
        "natural": {"type": "string"},
        "praise": {"type": "string"},
        "tip": {"type": "string"},
        "followup": {"type": "string"},
        "errors": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "kind": {"type": "string"},
                    "wrong": {"type": "string"},
                    "right": {"type": "string"},
                    "note": {"type": "string"},
                },
                "required": ["kind", "wrong", "right", "note"],
            },
        },
    },
    "required": ["ok", "score", "fixed", "praise", "errors"],
}

KINDS = {"pron", "grammar", "word", "fluency"}


def _system(level: str) -> str:
    return (
        "Bạn là giáo viên tiếng Anh giao tiếp cho người Việt, chấm bài NGAY sau khi người học vừa nói hoặc viết. "
        "Bạn giải thích hoàn toàn bằng tiếng Việt, ví dụ bằng tiếng Anh.\n"
        "Nguyên tắc chấm:\n"
        f"- Trình độ người học: {LEVELS.get(level, LEVELS['a2b1'])}.\n"
        "- Mục tiêu cuối cùng của người học là DÙNG ĐƯỢC, không phải viết đúng như sách. "
        "Câu hơi vụng nhưng người bản xứ hiểu được thì vẫn cho qua (ok=true).\n"
        "- 'fixed' là câu của họ đã sửa lỗi, giữ nguyên ý và giữ nguyên độ dài. Nếu câu đã đúng thì chép lại y nguyên.\n"
        "- 'natural' là cách một người bản xứ hay nói hơn cả (có thể khác cấu trúc). Để trống nếu câu họ đã tự nhiên.\n"
        "- 'errors' chỉ chứa lỗi THẬT SỰ đáng ghi vào sổ, tối đa 3 lỗi, xếp loại kind trong đúng 4 giá trị: "
        "'grammar' (thì, số ít số nhiều, trợ động từ), 'word' (dùng sai từ, dịch word-by-word), "
        "'pron' (chính tả phản ánh phát âm sai, âm cuối bị rơi), 'fluency' (lủng củng, thừa từ, ngắt sai chỗ). "
        "Câu đã ổn thì trả mảng rỗng — đừng bịa lỗi cho có.\n"
        "- 'wrong' là ĐÚNG đoạn sai trích từ câu của họ; 'right' là đoạn đã sửa; 'note' giải thích trong MỘT câu tiếng Việt.\n"
        "- 'praise' là một câu tiếng Việt khen đúng một điểm cụ thể họ làm được, không khen chung chung.\n"
        "- 'tip' là một mẹo ngắn để lần sau nói tốt hơn, tối đa 25 chữ, có thể để trống.\n"
        "- 'followup' là MỘT câu hỏi tiếng Anh ngắn để họ nói tiếp ngay, đúng trình độ của họ.\n"
        "- 'score' từ 0 đến 100: 85+ là dùng được ngoài đời, 60-84 là hiểu được nhưng còn gợn, dưới 60 là người nghe sẽ khó hiểu.\n"
        "Chỉ trả về JSON đúng cấu trúc yêu cầu."
    )


def _prompt(body) -> str:
    task = TASKS.get(body.task, TASKS["use"])
    lines = [f"NHIỆM VỤ: {task}", ""]
    if body.target:
        lines.append(f"CỤM MỤC TIÊU: {body.target}")
    if body.pattern:
        lines.append(f"KHUÔN: {body.pattern}")
    if body.meaning:
        lines.append(f"NGHĨA TIẾNG VIỆT: {body.meaning}")
    if body.cue:
        lines.append(f"TÌNH HUỐNG ĐƯA RA: {body.cue}")
    if body.prompt:
        lines.append(f"CÂU HỎI / ĐỀ BÀI: {body.prompt}")
    if body.seconds:
        lines.append(f"THỜI GIAN HỌ MẤT ĐỂ TRẢ LỜI: {body.seconds:.1f} giây")
    lines += [
        "",
        f"NGƯỜI HỌC VIẾT/NÓI: {body.say}",
        "",
        "Hãy chấm theo đúng JSON yêu cầu.",
    ]
    return "\n".join(lines)


def _clean_errors(raw) -> list[dict]:
    out = []
    for e in raw or []:
        if not isinstance(e, dict):
            continue
        kind = str(e.get("kind") or "grammar").strip().lower()
        if kind not in KINDS:
            kind = "grammar"
        wrong = str(e.get("wrong") or "").strip()
        right = str(e.get("right") or "").strip()
        if not wrong or not right or wrong == right:
            continue
        out.append({
            "kind": kind,
            "wrong": wrong,
            "right": right,
            "note": str(e.get("note") or "").strip(),
        })
        if len(out) >= 3:
            break
    return out


def coach(body) -> dict:
    data = llm.gemini_json(
        _prompt(body), SCHEMA, system=_system(body.level), temperature=0.3
    )
    score = data.get("score")
    score = int(score) if isinstance(score, (int, float)) else 0
    score = max(0, min(100, score))
    return {
        "ok": bool(data.get("ok")) and score >= 60,
        "score": score,
        "used_target": bool(data.get("used_target", True)),
        "fixed": (data.get("fixed") or "").strip(),
        "natural": (data.get("natural") or "").strip(),
        "praise": (data.get("praise") or "").strip(),
        "tip": (data.get("tip") or "").strip(),
        "followup": (data.get("followup") or "").strip(),
        "errors": _clean_errors(data.get("errors")),
        "model": llm.current_model(),
    }
