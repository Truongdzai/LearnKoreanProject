from __future__ import annotations

import json
import re
from datetime import date

from .. import db
from . import llm, srs
from .accounts import level_for
from .langs import study_name, native_name

LEVEL_NAMES = {
    "starter": "mới bắt đầu (chưa thuộc bảng chữ / dưới 100 từ)",
    "beginner": "sơ cấp (100-500 từ, nói được câu ngắn)",
    "intermediate": "trung cấp (trên 500 từ, hội thoại đời sống)",
}

GOAL_NAMES = {
    "giao-tiep": "giao tiếp đời sống",
    "cong-viec": "dùng trong công việc",
    "du-lich": "đi du lịch",
    "luyen-thi": "luyện thi chứng chỉ",
}


def _plan_data(conn, user_id: str, plan_id: str) -> dict:
    row = conn.execute(
        "SELECT data FROM user_plans WHERE user_id=? AND plan_id=?", (user_id, plan_id)
    ).fetchone()
    if not row:
        return {}
    try:
        data = json.loads(row["data"])
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def known_words(user_id: str, lang: str) -> set[str]:
    conn = db.get_conn()
    try:
        words = _plan_data(conn, user_id, f"{lang}words").get("words") or []
        out = {str(w).strip() for w in words if str(w).strip()}
        rows = conn.execute("SELECT front FROM srs_cards WHERE user_id=?", (user_id,)).fetchall()
        for r in rows:
            front = (r["front"] or "").strip()
            if front:
                out.add(front)
        return out
    finally:
        conn.close()


def profile(user: dict | None, lang: str) -> dict:
    if not user:
        return {"authed": False, "known": 0, "lang": lang}

    uid = user["id"]
    conn = db.get_conn()
    try:
        plan = _plan_data(conn, uid, f"{lang}90")
        pron = _plan_data(conn, uid, f"{lang}pron")
        grammar = _plan_data(conn, uid, f"{lang}grammar")
    finally:
        conn.close()

    day = 0
    if plan.get("start"):
        try:
            started = date.fromisoformat(str(plan["start"]))
            day = min(90, (date.today() - started).days + 1)
        except Exception:
            day = 0

    card_stats = srs.stats(uid)
    return {
        "authed": True,
        "name": user.get("name") or "bạn",
        "lang": lang,
        "goal": user.get("goal"),
        "level": level_for(user.get("xp", 0)),
        "streak": user.get("streak", 0),
        "known": len(known_words(uid, lang)),
        "cards_total": card_stats["total"],
        "cards_due": card_stats["due"],
        "cards_learned": card_stats["learned"],
        "plan_day": day,
        "plan_week": (day - 1) // 7 + 1 if day else 0,
        "quiz_best": plan.get("quiz") or {},
        "pron_passed": sum(1 for v in (pron.get("best") or {}).values() if v >= 70),
        "grammar_passed": sum(1 for v in (grammar.get("best") or {}).values() if v >= 70),
    }


def _level_hint(p: dict) -> str:
    known = p.get("known", 0)
    if known < 100:
        return "starter"
    if known < 500:
        return "beginner"
    return "intermediate"


def _profile_text(p: dict, lang: str) -> str:
    if not p.get("authed"):
        return (
            "Người học chưa đăng nhập nên chưa có dữ liệu tiến độ. "
            "Cứ mặc định họ ở trình độ sơ cấp và trả lời thẳng vào câu hỏi — KHÔNG hỏi ngược lại trình độ của họ."
        )
    parts = [
        f"Tên: {p['name']}",
        f"Trình độ ước lượng: {LEVEL_NAMES[_level_hint(p)]} — đã thuộc khoảng {p['known']} từ {study_name(lang)}",
        f"Thẻ ôn tập: {p['cards_total']} thẻ, {p['cards_due']} thẻ đến hạn hôm nay, {p['cards_learned']} thẻ đã nhớ chắc",
    ]
    if p.get("goal"):
        parts.append(f"Mục tiêu học: {GOAL_NAMES.get(p['goal'], p['goal'])}")
    if p.get("plan_day"):
        parts.append(f"Lộ trình 90 ngày: đang ở ngày {p['plan_day']} (tuần {p['plan_week']})")
    else:
        parts.append("Chưa bắt đầu lộ trình 90 ngày")
    if p.get("streak"):
        parts.append(f"Chuỗi ngày học liên tiếp: {p['streak']}")
    if p.get("pron_passed"):
        parts.append(f"Đã đạt {p['pron_passed']} nhóm phát âm")
    if p.get("grammar_passed"):
        parts.append(f"Đã đạt {p['grammar_passed']} bài ngữ pháp")
    return "\n".join(f"- {x}" for x in parts)


def system_prompt(lang: str, native: str, p: dict) -> str:
    lname = study_name(lang)
    nname = native_name(native)
    return (
        f"Bạn là GIA SƯ {lname.upper()} riêng của người học, kiên nhẫn và thực tế. "
        f"Bạn giải thích bằng {nname}, ví dụ bằng {lname}.\n"
        "Nguyên tắc:\n"
        f"- Trả lời ĐÚNG TRỌNG TÂM câu hỏi, ngắn gọn (dưới 180 từ), không lan man, không liệt kê dài lê thê.\n"
        f"- Luôn bám trình độ thật của người học ở phần HỒ SƠ: người mới thì dùng câu đơn giản, "
        f"người trung cấp thì được dùng cấu trúc khó hơn.\n"
        f"- Mọi ví dụ {lname} PHẢI kèm bản dịch {nname}; câu ví dụ phải dùng được trong đời thật.\n"
        "- Nếu người học viết sai, sửa nhẹ nhàng: chỉ ra chỗ sai, đưa câu đúng, giải thích bằng một câu.\n"
        "- Nếu câu hỏi mơ hồ, cứ chọn cách hiểu hợp lý nhất rồi trả lời, đừng hỏi lại lòng vòng.\n"
        "- Gợi ý 2-3 câu hỏi tiếp theo NGẮN (dưới 8 chữ) để người học bấm nhanh.\n"
        f"- Trường 'words' chỉ chứa từ/cụm {lname} đáng lưu thẻ ôn tập từ chính câu trả lời (tối đa 4, có thể để trống).\n"
        "- Khi người học hỏi 'hôm nay học gì' hoặc xin kế hoạch: bám HỒ SƠ bên dưới — nhắc đúng số thẻ đang đến hạn, "
        "ngày/tuần lộ trình họ đang ở, rồi giao việc cụ thể làm được ngay trong web (học 1 nhóm từ, luyện 1 nhóm âm, "
        "xem 1 video ngắn, ôn thẻ đến hạn).\n"
        "- Không bịa thông tin văn hoá; không chắc thì nói thẳng là không chắc.\n"
        "HỒ SƠ NGƯỜI HỌC:\n" + _profile_text(p, lang)
    )


SCHEMA = {
    "type": "object",
    "properties": {
        "reply": {"type": "string"},
        "examples": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"target": {"type": "string"}, "vi": {"type": "string"}},
                "required": ["target", "vi"],
            },
        },
        "words": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"target": {"type": "string"}, "vi": {"type": "string"}},
                "required": ["target", "vi"],
            },
        },
        "suggestions": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["reply", "suggestions"],
}


def _history_text(turns) -> str:
    if not turns:
        return "(chưa có)"
    lines = []
    for t in turns[-8:]:
        who = "Gia sư" if t.role == "bot" else "Người học"
        lines.append(f"{who}: {t.text}")
    return "\n".join(lines)


def chat(body, user: dict | None) -> dict:
    p = profile(user, body.lang)
    prompt = (
        f"Lịch sử trò chuyện:\n{_history_text(body.history)}\n\n"
        f"Câu hỏi mới của người học: {body.message}\n\n"
        "Trả lời theo đúng JSON yêu cầu."
    )
    data = llm.gemini_json(
        prompt, SCHEMA, system=system_prompt(body.lang, body.native, p), temperature=0.5
    )
    return {
        "reply": (data.get("reply") or "").strip(),
        "examples": data.get("examples") or [],
        "words": data.get("words") or [],
        "suggestions": [s for s in (data.get("suggestions") or []) if s][:3],
        "model": llm.current_model(),
    }


HANGUL = re.compile(r"[가-힣]+")
LATIN = re.compile(r"[a-zA-Z']+")
CJK = re.compile(r"[\u3040-\u30ff\u4e00-\u9fff]+")


def _tokens(text: str, lang: str) -> list[str]:
    if lang == "ko":
        return HANGUL.findall(text)
    if lang in ("ja", "zh"):
        return CJK.findall(text)
    return [w.lower() for w in LATIN.findall(text)]


def _known_set(words: set[str], lang: str) -> set[str]:
    out: set[str] = set()
    for w in words:
        w = w.strip()
        if not w:
            continue
        if lang == "ko":
            for chunk in HANGUL.findall(w):
                out.add(chunk)
                if len(chunk) >= 2 and chunk.endswith("다"):
                    out.add(chunk[:-1])
        elif lang in ("ja", "zh"):
            out.update(CJK.findall(w))
        else:
            out.update(x.lower() for x in LATIN.findall(w))
    return out


KO_ENDINGS = {
    "다", "요", "야", "아", "어", "아요", "어요", "여요", "해요", "예요", "이에요",
    "았어요", "었어요", "했어요", "겠어요", "습니다", "ㅂ니다", "네요", "지요", "죠",
    "고", "서", "면", "니까", "지만", "는데", "러", "려고",
    "은", "는", "이", "가", "을", "를", "에", "에서", "에게", "한테", "의",
    "와", "과", "랑", "이랑", "도", "만", "부터", "까지", "으로", "로", "보다",
    "들", "님", "씨", "적", "성", "중", "이나", "나",
}


def _is_known(token: str, known: set[str], lang: str) -> bool:
    if token in known:
        return True
    if lang == "ko":
        for cut in range(len(token) - 1, 0, -1):
            stem = token[:cut]
            if stem not in known:
                continue
            if cut >= 2 or token[cut:] in KO_ENDINGS:
                return True
    return False


def fit_score(text: str, known: set[str], lang: str) -> dict:
    tokens = _tokens(text, lang)
    total = len(tokens)
    if not total:
        return {"words": 0, "unique": 0, "known_pct": 0, "band": "unknown", "new_words": []}
    kset = _known_set(known, lang)
    hit = 0
    new_counter: dict[str, int] = {}
    for t in tokens:
        if _is_known(t, kset, lang):
            hit += 1
        else:
            new_counter[t] = new_counter.get(t, 0) + 1
    pct = round(hit / total * 100)
    band = "hard" if pct < 80 else ("fit" if pct <= 97 else "easy")
    if not kset:
        band = "unknown"
    top_new = sorted(new_counter.items(), key=lambda kv: -kv[1])[:12]
    return {
        "words": total,
        "unique": len(set(tokens)),
        "known_pct": pct,
        "band": band,
        "new_words": [w for w, _ in top_new],
    }
