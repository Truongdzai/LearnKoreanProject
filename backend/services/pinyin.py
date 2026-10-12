from __future__ import annotations

import re

from .logs import log

_HAN = re.compile(r"[㐀-鿿豈-﫿]")
_MAX_WORDS = 400

# 儿 hoá (âm cuốn lưỡi) dính vào âm tiết trước: 哪儿 nǎr, 一点儿 yì diǎnr. Chỉ gộp theo danh sách
# để 女儿/儿子/婴儿 vẫn đọc "ér".
_ERHUA = {
    "哪儿", "这儿", "那儿", "点儿", "会儿", "块儿", "玩儿", "边儿", "下儿", "事儿", "空儿",
    "味儿", "样儿", "劲儿", "天儿", "孩儿", "花儿", "画儿", "歌儿", "伴儿",
}

_engine = None
_missing = False


def _load():
    global _engine, _missing
    if _engine is not None or _missing:
        return _engine
    try:
        from pypinyin import Style, pinyin

        _engine = (pinyin, Style.TONE)
    except Exception as e:
        _missing = True
        log(f"[pinyin] Chua cai pypinyin ({e}) — bo qua phien am tieng Trung.")
    return _engine


def available() -> bool:
    return _load() is not None


def _join(word: str, syllables: list[str]) -> str:
    # pypinyin gộp cụm không phải chữ Hán thành một mục; chỉ gộp 儿 khi mỗi ký tự ứng đúng một âm tiết.
    if "儿" in word and len(syllables) == len(word):
        out: list[str] = []
        for i, s in enumerate(syllables):
            if i and word[i - 1:i + 1] in _ERHUA:
                out[-1] += "r"
            else:
                out.append(s)
        syllables = out
    return " ".join(syllables)


def readings(words: list[str]) -> dict[str, str]:
    eng = _load()
    if not eng:
        return {}
    to_pinyin, style = eng
    out: dict[str, str] = {}
    for w in words[:_MAX_WORDS]:
        w = (w or "").strip()
        if not w or w in out or not _HAN.search(w):
            continue
        try:
            out[w] = _join(w, [x[0] for x in to_pinyin(w, style=style)])
        except Exception:
            continue
    return out
