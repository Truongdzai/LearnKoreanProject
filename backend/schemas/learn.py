from __future__ import annotations

from pydantic import BaseModel

class TranscriptIn(BaseModel):
    url: str
    lang: str = "ko"
