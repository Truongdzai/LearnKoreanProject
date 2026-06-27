from __future__ import annotations

from pydantic import BaseModel

class PronounceIn(BaseModel):
    target: str          # câu mẫu ở ngôn ngữ đang học
    heard: str = ""       # nội dung nhận diện được từ giọng nói người học
    score: int = 0        # điểm chính xác 0-100 do client tính
    vi: str = ""          # nghĩa ở ngôn ngữ mẹ đẻ (nếu có) để AI hiểu ngữ cảnh
    lang: str = "ko"      # ngôn ngữ đang học
    native: str = "vi"    # ngôn ngữ mẹ đẻ để nhận xét
