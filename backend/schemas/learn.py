from __future__ import annotations

from pydantic import BaseModel

class TranscriptIn(BaseModel):
    url: str
    lang: str = "ko"


class ExplainIn(BaseModel):
    sentence: str
    vi: str = ""
    lang: str = "en"
    native: str = "vi"


class GrammarPoint(BaseModel):
    piece: str
    explain: str


class ExplainOut(BaseModel):
    structure: str
    points: list[GrammarPoint]
    tip: str


class LevelIn(BaseModel):
    video_id: str
    lang: str = "en"
    text: str


class LevelOut(BaseModel):
    level: str
    reason: str


class TranslateIn(BaseModel):
    lines: list[str]
    lang: str = "en"
    native: str = "vi"


class TranslateOut(BaseModel):
    lines: list[str]
