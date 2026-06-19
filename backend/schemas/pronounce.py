from __future__ import annotations

from pydantic import BaseModel

class PronounceIn(BaseModel):
    target: str          # câu tiếng Hàn mẫu
    heard: str = ""       # nội dung nhận diện được từ giọng nói người học
    score: int = 0        # điểm chính xác 0-100 do client tính
    vi: str = ""          # nghĩa tiếng Việt (nếu có) để AI hiểu ngữ cảnh
