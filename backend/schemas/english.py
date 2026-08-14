from __future__ import annotations

from pydantic import BaseModel


class CoachIn(BaseModel):
    task: str = "use"
    target: str = ""
    pattern: str = ""
    meaning: str = ""
    cue: str = ""
    prompt: str = ""
    say: str = ""
    level: str = "a2b1"
    seconds: float = 0.0
