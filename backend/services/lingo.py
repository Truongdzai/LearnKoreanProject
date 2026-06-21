from __future__ import annotations

import json
import time

from ..config import settings
from .. import db
from . import llm

CACHE_KEY = "lingo_cache"
TTL = 24 * 3600

CURATED = [
    {"term": "갓생", "read": "gat-saeng", "meaning": "cuộc sống \"đỉnh\", sống kỷ luật và năng suất", "example": "나 요즘 갓생 살아.", "exampleVi": "Dạo này tớ sống rất kỷ luật.", "trend": 98, "platform": "TikTok"},
    {"term": "꿀잼", "read": "kkul-jaem", "meaning": "cực kỳ thú vị, vui \"mê\" (ngọt như mật)", "example": "이 영화 진짜 꿀잼이야!", "exampleVi": "Phim này vui cực kỳ luôn!", "trend": 95, "platform": "YouTube"},
    {"term": "핵인싸", "read": "haek-in-ssa", "meaning": "người cực kỳ hoà đồng, \"trùm\" giao tiếp", "example": "걔는 핵인싸야.", "exampleVi": "Nó là trùm hoà đồng luôn.", "trend": 90, "platform": "Instagram"},
    {"term": "존맛탱", "read": "jon-mat-taeng", "meaning": "ngon \"bá cháy\" (JMT)", "example": "이거 존맛탱!", "exampleVi": "Món này ngon bá cháy!", "trend": 88, "platform": "TikTok"},
    {"term": "머쓱", "read": "meo-sseuk", "meaning": "ngượng ngùng, quê quê một chút", "example": "괜히 머쓱하네.", "exampleVi": "Tự nhiên thấy hơi quê.", "trend": 82, "platform": "YouTube"},
    {"term": "맞팔", "read": "mat-pal", "meaning": "follow lại nhau (mutual follow)", "example": "우리 맞팔해요!", "exampleVi": "Mình follow lại nhau nhé!", "trend": 80, "platform": "Instagram"},
    {"term": "낄낄", "read": "kkil-kkil", "meaning": "cười khúc khích (hihi/haha)", "example": "그 짤 보고 낄낄거렸어.", "exampleVi": "Xem cái ảnh đó mà cười khúc khích.", "trend": 76, "platform": "TikTok"},
    {"term": "쩐다", "read": "jjeon-da", "meaning": "đỉnh quá, \"cháy\" quá", "example": "와, 진짜 쩐다!", "exampleVi": "Oa, đỉnh thật sự!", "trend": 73, "platform": "YouTube"},
]

_PLATFORMS = {"YouTube", "TikTok", "Instagram"}

_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "term": {"type": "string"},
            "read": {"type": "string"},
            "meaning": {"type": "string"},
            "example": {"type": "string"},
            "exampleVi": {"type": "string"},
            "platform": {"type": "string"},
            "trend": {"type": "integer"},
        },
        "required": ["term", "read", "meaning", "example", "exampleVi", "platform", "trend"],
    },
}

def _generate() -> list[dict]:
    prompt = (
        "Liệt kê 8 từ lóng / cụm từ tiếng Hàn đang thịnh hành mà giới trẻ Hàn Quốc dùng nhiều trên mạng xã hội. "
        "Mỗi mục gồm: term (viết bằng tiếng Hàn), read (romaja), meaning (giải thích nghĩa bằng tiếng Việt, ngắn gọn tự nhiên), "
        "example (một câu ví dụ ngắn bằng tiếng Hàn), exampleVi (bản dịch tiếng Việt của câu ví dụ), "
        "platform (một trong: YouTube, TikTok, Instagram), trend (độ hot từ 60 đến 99). "
        "Tránh từ tục tĩu/thô lỗ. Chọn các từ đa dạng, thực sự phổ biến."
    )
    data = llm.gemini_json(prompt, _SCHEMA, temperature=0.6)
    out: list[dict] = []
    for it in data if isinstance(data, list) else []:
        if not isinstance(it, dict) or not it.get("term") or not it.get("meaning"):
            continue
        plat = it.get("platform") if it.get("platform") in _PLATFORMS else "YouTube"
        try:
            trend = max(60, min(99, int(it.get("trend", 80))))
        except Exception:
            trend = 80
        out.append({
            "term": str(it["term"]).strip(),
            "read": str(it.get("read", "")).strip(),
            "meaning": str(it["meaning"]).strip(),
            "example": str(it.get("example", "")).strip(),
            "exampleVi": str(it.get("exampleVi", "")).strip(),
            "platform": plat,
            "trend": trend,
        })
    return out

def get(refresh: bool = False) -> dict:
    ai_on = settings["llm"].get("provider", "none") != "none"

    if not refresh:
        raw = db.get_setting(CACHE_KEY)
        if raw:
            try:
                cached = json.loads(raw)
                if time.time() - cached.get("ts", 0) < TTL and cached.get("items"):
                    return {"items": cached["items"], "source": cached.get("source", "ai"), "updated": cached["ts"]}
            except Exception:
                pass

    if ai_on:
        try:
            items = _generate()
            if items:
                payload = {"ts": time.time(), "items": items, "source": "ai"}
                db.set_setting(CACHE_KEY, json.dumps(payload, ensure_ascii=False))
                return {"items": items, "source": "ai", "updated": payload["ts"]}
        except Exception:
            pass

    return {"items": CURATED, "source": "curated", "updated": 0}
