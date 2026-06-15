from __future__ import annotations

from pydantic import BaseModel

class TranscriptIn(BaseModel):
    url: str

class MineIn(BaseModel):
    ko: str
    vi: str = ""
    source: str = ""
