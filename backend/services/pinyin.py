from __future__ import annotations

import re

from .logs import log

_HAN = re.compile(r"[㐀-鿿豈-﫿]")
_MAX_WORDS = 400

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
            out[w] = " ".join(x[0] for x in to_pinyin(w, style=style))
        except Exception:
            continue
    return out
