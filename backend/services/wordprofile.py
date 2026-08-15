from __future__ import annotations

import re

from ..config import settings
from . import cache, llm

CACHE_PREFIX = "enprofile:vi:"

WORD_RE = re.compile(r"^[a-zA-Z][a-zA-Z' -]{0,39}$")

POS_KEYS = ["noun", "verb", "adj", "adverb", "prep", "phrase", "other"]

_SENSE = {
    "type": "object",
    "properties": {
        "pos": {"type": "string", "enum": POS_KEYS},
        "vi": {"type": "string"},
        "en": {"type": "string"},
        "freq": {"type": "integer"},
        "reg": {"type": "string"},
        "ex": {"type": "string"},
        "exVi": {"type": "string"},
        "ex2": {"type": "string"},
        "ex2Vi": {"type": "string"},
    },
    "required": ["pos", "vi", "en", "freq", "ex", "exVi"],
}

_FORM_ITEM = {
    "type": "object",
    "properties": {
        "form": {"type": "string"},
        "vi": {"type": "string"},
        "ex": {"type": "string"},
    },
    "required": ["form", "vi"],
}

SENSE_SCHEMA = {
    "type": "object",
    "properties": {
        "ipa": {"type": "string"},
        "level": {"type": "string"},
        "core": {"type": "string"},
        "grammar": {"type": "string"},
        "senses": {"type": "array", "items": _SENSE},
    },
    "required": ["ipa", "level", "core", "grammar", "senses"],
}

USE_SCHEMA = {
    "type": "object",
    "properties": {
        "family": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "form": {"type": "string"},
                    "pos": {"type": "string"},
                    "vi": {"type": "string"},
                },
                "required": ["form", "pos", "vi"],
            },
        },
        "combos": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "note": {"type": "string"},
                    "items": {"type": "array", "items": _FORM_ITEM},
                },
                "required": ["label", "items"],
            },
        },
        "phrasals": {"type": "array", "items": _FORM_ITEM},
        "idioms": {"type": "array", "items": _FORM_ITEM},
        "synonyms": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "word": {"type": "string"},
                    "vi": {"type": "string"},
                    "diff": {"type": "string"},
                },
                "required": ["word", "vi", "diff"],
            },
        },
        "antonyms": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"word": {"type": "string"}, "vi": {"type": "string"}},
                "required": ["word", "vi"],
            },
        },
        "confuse": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "word": {"type": "string"},
                    "vi": {"type": "string"},
                    "why": {"type": "string"},
                },
                "required": ["word", "why"],
            },
        },
        "mistakes": {"type": "array", "items": {"type": "string"}},
    },
    "required": [
        "family", "combos", "phrasals", "idioms",
        "synonyms", "antonyms", "confuse", "mistakes",
    ],
}

SYSTEM = (
    "Bạn là người biên soạn từ điển Anh–Việt dành cho người Việt học tiếng Anh giao tiếp. "
    "Bạn viết như một cuốn từ điển học tập (learner's dictionary): đủ nghĩa, sắp theo mức phổ biến, "
    "ví dụ ngắn và đời thường, giải thích bằng tiếng Việt dễ hiểu, không dùng thuật ngữ hàn lâm."
)


def _hint(pos: str, vi: str) -> str:
    return f"Trong kho học của chúng tôi từ này ghi là “{vi}” ({pos})." if vi else ""


def _sense_prompt(term: str, pos: str, vi: str) -> str:
    return (
        f"Liệt kê ĐẦY ĐỦ các nghĩa của từ tiếng Anh “{term}”. {_hint(pos, vi)}\n"
        "Người học mở trang này để hiểu HẾT nghĩa của từ, nên phần senses là quan trọng nhất — "
        "bỏ sót một nghĩa hay gặp là hỏng cả trang.\n"
        "- senses: mọi nghĩa thông dụng, kể cả khi từ đổi từ loại (danh từ, động từ, tính từ…). "
        "Xếp nghĩa hay gặp nhất lên đầu. Mỗi mục gồm: pos (một trong "
        f"{', '.join(POS_KEYS)}), vi (nghĩa tiếng Việt ngắn gọn), en (định nghĩa tiếng Anh đơn giản, "
        "chỉ dùng từ dễ hơn chính từ đang tra), freq (1–5, 5 = cực kỳ hay gặp), "
        "reg (sắc thái: trang trọng / thân mật / trung tính / lóng / chuyên ngành…), "
        "ex + exVi (câu ví dụ và bản dịch), ex2 + ex2Vi (ví dụ thứ hai ở ngữ cảnh khác — luôn viết, đừng bỏ trống).\n"
        "Từ phổ thông nhiều nghĩa như run, set, get, light thường có 8–14 mục; từ hẹp nghĩa thì 2–4 mục là đủ. "
        "Đừng gộp hai nghĩa khác nhau vào một mục, cũng đừng bịa nghĩa không có thật.\n"
        "- core: một câu tiếng Việt nêu Ý LÕI xuyên suốt mọi nghĩa, cho người học thấy các nghĩa không rời rạc "
        "mà mọc ra từ một gốc. Bắt đầu bằng “Ý lõi: ”.\n"
        "- grammar: đoạn ngắn về mẫu ngữ pháp đi kèm (theo sau là V-ing hay to V, đếm được hay không, "
        "giới từ bắt buộc, vị trí trong câu…).\n"
        "- ipa: phiên âm giọng Mỹ, có dấu gạch chéo hai đầu. level: bậc CEFR (A1–C2).\n"
        "Giải thích bằng tiếng Việt; ví dụ viết bằng tiếng Anh tự nhiên, ngắn, đời thường."
    )


def _use_prompt(term: str, pos: str, vi: str, senses: list[dict]) -> str:
    known = "; ".join(_clean_str(s.get("vi"), 80) for s in senses[:8] if isinstance(s, dict))
    seen = f"Các nghĩa đã có: {known}.\n" if known else ""
    return (
        f"Soạn phần CÁCH DÙNG cho từ tiếng Anh “{term}”. {_hint(pos, vi)}\n{seen}"
        "- family: 3–8 từ cùng gốc (danh/động/tính/trạng từ) kèm từ loại và nghĩa tiếng Việt. "
        "Từ không sinh ra phái sinh nào thì để mảng rỗng.\n"
        "- combos: 2–4 nhóm cụm hay đi với từ này, MỖI NHÓM 4–8 mục. Nhóm gồm label (tên nhóm bằng tiếng Việt, "
        "ví dụ “động từ + từ này”, “tính từ đứng trước”, “từ này + giới từ”), note (một câu mách nước) và "
        "items (form = cụm tiếng Anh, vi = nghĩa, ex = câu ngắn).\n"
        "- phrasals: cụm động từ, chỉ khi từ này là động từ — động từ phổ thông thường có 5–10 cụm. "
        "Không phải động từ thì để mảng rỗng.\n"
        "- idioms: 2–6 thành ngữ / cách nói quen thuộc chứa từ này. Không có thì để rỗng.\n"
        "- synonyms: 3–6 từ gần nghĩa, mỗi từ nêu rõ diff = khác chỗ nào so với từ đang học.\n"
        "- antonyms: 2–4 từ trái nghĩa (nếu có).\n"
        "- confuse: 2–4 từ người Việt hay nhầm với từ này (viết giống, đọc giống, hoặc dịch ra cùng một chữ "
        "tiếng Việt). Mỗi mục: word = từ dễ nhầm, vi = nghĩa tiếng Việt NGẮN của từ đó (2–5 chữ, không phải "
        "câu giải thích), why = vì sao hay nhầm và cách phân biệt.\n"
        "- mistakes: 2–4 lỗi cụ thể người Việt hay mắc với từ này, mỗi lỗi một dòng dạng "
        "“Sai: … → Đúng: … (vì …)”.\n"
        "Giải thích bằng tiếng Việt; ví dụ viết bằng tiếng Anh tự nhiên, ngắn, đời thường."
    )


def _clean_str(v, limit: int = 400) -> str:
    return str(v).strip()[:limit] if isinstance(v, (str, int, float)) else ""


def _clean_items(raw, limit: int) -> list[dict]:
    out: list[dict] = []
    for it in raw if isinstance(raw, list) else []:
        if not isinstance(it, dict):
            continue
        form = _clean_str(it.get("form"), 80)
        if not form:
            continue
        out.append({"form": form, "vi": _clean_str(it.get("vi"), 200), "ex": _clean_str(it.get("ex"), 200)})
        if len(out) >= limit:
            break
    return out


def _normalize(term: str, raw: dict) -> dict | None:
    senses: list[dict] = []
    for s in raw.get("senses") if isinstance(raw.get("senses"), list) else []:
        if not isinstance(s, dict):
            continue
        vi = _clean_str(s.get("vi"), 160)
        if not vi:
            continue
        pos = _clean_str(s.get("pos"), 12).lower()
        freq = s.get("freq")
        senses.append({
            "pos": pos if pos in POS_KEYS else "other",
            "vi": vi,
            "en": _clean_str(s.get("en"), 260),
            "freq": max(1, min(5, int(freq))) if isinstance(freq, (int, float)) else 3,
            "reg": _clean_str(s.get("reg"), 60),
            "ex": _clean_str(s.get("ex"), 220),
            "exVi": _clean_str(s.get("exVi"), 220),
            "ex2": _clean_str(s.get("ex2"), 220),
            "ex2Vi": _clean_str(s.get("ex2Vi"), 220),
        })
        if len(senses) >= 14:
            break
    if not senses:
        return None

    family: list[dict] = []
    for f in raw.get("family") if isinstance(raw.get("family"), list) else []:
        if not isinstance(f, dict):
            continue
        form = _clean_str(f.get("form"), 60)
        if not form or form.lower() == term.lower():
            continue
        family.append({"form": form, "pos": _clean_str(f.get("pos"), 40), "vi": _clean_str(f.get("vi"), 160)})
        if len(family) >= 10:
            break

    combos: list[dict] = []
    for g in raw.get("combos") if isinstance(raw.get("combos"), list) else []:
        if not isinstance(g, dict):
            continue
        items = _clean_items(g.get("items"), 12)
        if not items:
            continue
        combos.append({
            "label": _clean_str(g.get("label"), 80) or "Cụm hay đi với từ này",
            "note": _clean_str(g.get("note"), 300),
            "items": items,
        })
        if len(combos) >= 5:
            break

    synonyms: list[dict] = []
    for s in raw.get("synonyms") if isinstance(raw.get("synonyms"), list) else []:
        if not isinstance(s, dict):
            continue
        word = _clean_str(s.get("word"), 60)
        if not word or word.lower() == term.lower():
            continue
        synonyms.append({"word": word, "vi": _clean_str(s.get("vi"), 160), "diff": _clean_str(s.get("diff"), 300)})
        if len(synonyms) >= 8:
            break

    antonyms: list[dict] = []
    for a in raw.get("antonyms") if isinstance(raw.get("antonyms"), list) else []:
        if not isinstance(a, dict):
            continue
        word = _clean_str(a.get("word"), 60)
        if word:
            antonyms.append({"word": word, "vi": _clean_str(a.get("vi"), 160)})
        if len(antonyms) >= 6:
            break

    confuse: list[dict] = []
    for c in raw.get("confuse") if isinstance(raw.get("confuse"), list) else []:
        if not isinstance(c, dict):
            continue
        word = _clean_str(c.get("word"), 60)
        why = _clean_str(c.get("why"), 300)
        if word and why:
            confuse.append({"word": word, "vi": _clean_str(c.get("vi"), 160), "why": why})
        if len(confuse) >= 6:
            break

    mistakes = [
        _clean_str(m, 300)
        for m in (raw.get("mistakes") if isinstance(raw.get("mistakes"), list) else [])
        if _clean_str(m, 300)
    ][:6]

    return {
        "term": term,
        "ipa": _clean_str(raw.get("ipa"), 60),
        "level": _clean_str(raw.get("level"), 10),
        "core": _clean_str(raw.get("core"), 400),
        "senses": senses,
        "family": family,
        "combos": combos,
        "phrasals": _clean_items(raw.get("phrasals"), 12),
        "idioms": _clean_items(raw.get("idioms"), 10),
        "synonyms": synonyms,
        "antonyms": antonyms,
        "confuse": confuse,
        "grammar": _clean_str(raw.get("grammar"), 600),
        "mistakes": mistakes,
        "ai": True,
    }


def _key(term: str) -> str:
    return CACHE_PREFIX + term.strip().lower()


def cached_only(term: str) -> dict | None:
    if not term.strip():
        return None
    return cache.get_dict(_key(term))


def has_cache(term: str) -> bool:
    return cached_only(term) is not None


def build(term: str, pos: str = "", vi: str = "") -> dict | None:
    if settings["llm"].get("provider", "none") == "none":
        return None

    head = llm.gemini_json(_sense_prompt(term, pos, vi), SENSE_SCHEMA, system=SYSTEM, temperature=0.25)
    if not isinstance(head, dict) or not head.get("senses"):
        return None

    senses = head.get("senses") if isinstance(head.get("senses"), list) else []
    try:
        use = llm.gemini_json(
            _use_prompt(term, pos, vi, senses), USE_SCHEMA, system=SYSTEM, temperature=0.3
        )
    except Exception:
        use = None

    return _normalize(term, {**head, **use} if isinstance(use, dict) else head)


def get(term: str, pos: str = "", vi: str = "", refresh: bool = False) -> dict:
    clean = (term or "").strip()
    if not WORD_RE.match(clean):
        return {"word": clean.lower(), "profile": None, "cached": False}

    if not refresh:
        hit = cached_only(clean)
        if hit:
            return {"word": clean.lower(), "profile": hit, "cached": True}

    profile = build(clean, pos, vi)
    if profile:
        cache.save_dict(_key(clean), profile)
    return {"word": clean.lower(), "profile": profile, "cached": False}
