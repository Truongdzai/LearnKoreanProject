from __future__ import annotations


STUDY_LANGS = {
    "ko": "tiếng Hàn", "en": "tiếng Anh", "ja": "tiếng Nhật", "zh": "tiếng Trung",
}

NATIVE_LANGS = {
    "vi": "tiếng Việt",
}


def study_name(code: str) -> str:
    return STUDY_LANGS.get(code, "tiếng Hàn")


def native_name(code: str) -> str:
    return NATIVE_LANGS.get(code, "tiếng Việt")
