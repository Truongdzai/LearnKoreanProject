from __future__ import annotations

import hashlib

from fastapi import APIRouter, Depends, HTTPException, Request

from ..errors import AppError
from ..schemas.learn import (
    TranscriptIn, ExplainIn, ExplainOut, LevelIn, LevelOut, TranslateIn, TranslateOut,
)
from ..services import asr, auth, youtube, translate, cache, jobs, llm, quota
from ..services.langs import study_name, native_name

router = APIRouter(prefix="/api/transcript", tags=["Bài học"])
OptAuth = Depends(auth.get_optional_user)

def _attach_speakers(lesson: dict) -> dict:
    spk = cache.get_speakers(lesson.get("id", ""))
    if spk and len(spk["speakers"]) == len(lesson["segments"]):
        for seg, s in zip(lesson["segments"], spk["speakers"]):
            seg["speaker"] = s
    return lesson

@router.post("")
def api_transcript(body: TranscriptIn, request: Request, user: dict | None = OptAuth):
    vid = youtube.extract_id(body.url)

    if not vid:
        raise AppError("INVALID_URL", "Hãy dán một link video YouTube hợp lệ.", 400)

    cached = cache.get_lesson(vid)
    if cached and cached["segments"]:
        return _attach_speakers(cached)

    quota.consume("transcript", user, quota.client_ip(request))
    try:
        with jobs.heavy_slot(timeout=45.0):
            try:
                data = youtube.get_segments(f"https://www.youtube.com/watch?v={vid}", body.lang)
            except Exception as exc:
                try:
                    data = {
                        "id": vid,
                        "title": "",
                        "channel": "",
                        "source": "tự nghe bằng AI",
                        "segments": asr.transcribe(vid, body.lang),
                    }
                except Exception:
                    raise AppError("SUBTITLE_NOT_FOUND", str(exc), 404)
            if not data["segments"]:
                raise AppError("SUBTITLE_NOT_FOUND", "Không tìm thấy nội dung phụ đề.", 404)
            if "tự động" in (data.get("source") or ""):
                try:
                    data["segments"] = translate.repair_segments(data["segments"], body.lang)
                except Exception:
                    pass
            note = ""
            if data.get("title"):
                note = f"Bối cảnh: video \"{data['title']}\" của kênh {data.get('channel') or ''}.".strip()
            try:
                translate.translate_segments(data["segments"], body.lang, note)
            except Exception:
                for seg in data["segments"]:
                    seg.setdefault("vi", "")
            if data.get("id"):
                cache.save_lesson(data)
            return _attach_speakers(data)
    except jobs.Busy:
        raise HTTPException(status_code=503, detail="Máy chủ đang bận xử lý video khác, vui lòng thử lại sau giây lát.")


_EXPLAIN_SCHEMA = {
    "type": "object",
    "properties": {
        "structure": {"type": "string"},
        "points": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"piece": {"type": "string"}, "explain": {"type": "string"}},
                "required": ["piece", "explain"],
            },
        },
        "tip": {"type": "string"},
    },
    "required": ["structure", "points", "tip"],
}


@router.post("/explain", response_model=ExplainOut)
def api_explain(body: ExplainIn):
    sentence = body.sentence.strip()
    if not sentence:
        raise HTTPException(status_code=400, detail="Thiếu câu cần giải thích.")
    key = f"grammar:{body.lang}:{body.native}:{hashlib.sha1(sentence.encode()).hexdigest()}"
    hit = cache.get_dict(key)
    if hit:
        return hit
    lname = study_name(body.lang)
    nname = native_name(body.native)
    system = (
        f"Bạn là giáo viên ngữ pháp {lname} cho người mới học, giải thích bằng {nname}. "
        "Phân tích NGẮN GỌN, dễ hiểu, tránh thuật ngữ hàn lâm; mỗi điểm 1-2 câu."
    )
    prompt = (
        f"Câu {lname}: {sentence}\n"
        + (f"Nghĩa: {body.vi}\n" if body.vi else "")
        + "\nHãy phân tích ngữ pháp câu này:\n"
        f"- structure: khung câu (chủ ngữ / động từ / thành phần chính) viết bằng {nname}.\n"
        "- points: 2-4 điểm ngữ pháp đáng học trong câu (piece = cụm trích nguyên văn, explain = giải thích cách dùng).\n"
        "- tip: 1 mẹo áp dụng để tự đặt câu tương tự.\n"
        "Chỉ trả về JSON đúng cấu trúc."
    )
    try:
        data = llm.gemini_json(prompt, _EXPLAIN_SCHEMA, system=system, temperature=0.3)
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"AI không phản hồi: {exc}", 502)
    out = {
        "structure": data.get("structure", ""),
        "points": [p for p in data.get("points", []) if p.get("piece")][:4],
        "tip": data.get("tip", ""),
    }
    cache.save_dict(key, out)
    return out


_LEVEL_SCHEMA = {
    "type": "object",
    "properties": {"level": {"type": "string"}, "reason": {"type": "string"}},
    "required": ["level", "reason"],
}

_CEFR = {"A1", "A2", "B1", "B2", "C1", "C2"}


@router.post("/level", response_model=LevelOut)
def api_level(body: LevelIn):
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Thiếu nội dung bài học.")
    key = f"cefr:{body.lang}:{body.video_id}"
    hit = cache.get_dict(key)
    if hit:
        return hit
    lname = study_name(body.lang)
    system = (
        f"Bạn là chuyên gia đánh giá độ khó văn bản {lname} theo khung CEFR. "
        "Trả lời bằng tiếng Việt, ngắn gọn."
    )
    prompt = (
        f"Đây là phụ đề một video {lname} (trích tối đa 1500 ký tự):\n{text[:1500]}\n\n"
        "Ước lượng trình độ CEFR phù hợp để HỌC video này:\n"
        "- level: một trong A1/A2/B1/B2/C1/C2.\n"
        "- reason: 1-2 câu vì sao (tốc độ từ vựng/cấu trúc), kèm gợi ý người học mức nào nên xem.\n"
        "Chỉ trả về JSON."
    )
    try:
        data = llm.gemini_json(prompt, _LEVEL_SCHEMA, system=system, temperature=0.2)
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"AI không phản hồi: {exc}", 502)
    level = str(data.get("level", "")).upper().strip()
    out = {"level": level if level in _CEFR else "B1", "reason": data.get("reason", "")}
    cache.save_dict(key, out)
    return out


@router.post("/translate", response_model=TranslateOut)
def api_translate(body: TranslateIn):
    lines = [str(x) for x in (body.lines or [])]
    if not lines:
        return {"lines": []}
    if body.native == body.lang:
        return {"lines": lines}
    try:
        out = translate.translate_lines_native(lines, body.lang, body.native)
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"AI không phản hồi: {exc}", 502)
    return {"lines": out}
