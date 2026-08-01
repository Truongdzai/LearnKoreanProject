from __future__ import annotations

from pydantic import BaseModel

class SpeakTurn(BaseModel):
    role: str = "bot"
    ko: str = ""

class SpeakIn(BaseModel):
    persona: str = ""
    situation: str = ""
    user_say: str = ""
    history: list[SpeakTurn] = []
    level: str = "beginner"
    lang: str = "ko"
    native: str = "vi"
