from __future__ import annotations


STUDY_LANGS = {
    "ko": "tiếng Hàn", "en": "tiếng Anh", "ja": "tiếng Nhật",
    "zh": "tiếng Trung", "de": "tiếng Đức", "vi": "tiếng Việt",
}

NATIVE_LANGS = {
    "vi": "tiếng Việt", "en": "tiếng Anh", "ja": "tiếng Nhật", "zh": "tiếng Trung",
    "ko": "tiếng Hàn", "id": "tiếng Indonesia", "es": "tiếng Tây Ban Nha",
    "fr": "tiếng Pháp", "de": "tiếng Đức", "ru": "tiếng Nga", "it": "tiếng Ý",
    "pt": "tiếng Bồ Đào Nha",
}


def study_name(code: str) -> str:
    return STUDY_LANGS.get(code, "tiếng Hàn")


def native_name(code: str) -> str:
    return NATIVE_LANGS.get(code, "tiếng Việt")
