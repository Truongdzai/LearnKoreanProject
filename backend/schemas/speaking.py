from __future__ import annotations

from pydantic import BaseModel

class SpeakTurn(BaseModel):
    role: str = "bot"     # 'bot' (nhân vật) hoặc 'me' (người học)
    ko: str = ""

class SpeakIn(BaseModel):
    persona: str = ""      # vai AI đóng + bối cảnh
    situation: str = ""    # mô tả tình huống (tiếng Việt) để AI hiểu ngữ cảnh
    user_say: str = ""     # câu người học vừa nói (ngôn ngữ đang học)
    history: list[SpeakTurn] = []
    level: str = "beginner"
    lang: str = "ko"       # ngôn ngữ đang học
    native: str = "vi"     # ngôn ngữ mẹ đẻ để dịch & nhận xét
