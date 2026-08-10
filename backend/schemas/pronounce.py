from __future__ import annotations

from pydantic import BaseModel, Field

class PronounceIn(BaseModel):
    target: str
    heard: str = ""
    score: int = 0
    vi: str = ""
    lang: str = "ko"
    native: str = "vi"
    issues: list[str] = Field(default_factory=list, max_length=8)
    weak_words: list[str] = Field(default_factory=list, max_length=12, alias="weakWords")

    model_config = {"populate_by_name": True}
