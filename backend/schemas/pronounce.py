from __future__ import annotations

from pydantic import BaseModel

class PronounceIn(BaseModel):
    target: str
    heard: str = ""
    score: int = 0
    vi: str = ""
    lang: str = "ko"
    native: str = "vi"
