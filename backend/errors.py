from __future__ import annotations


class AppError(Exception):
    """Lỗi nghiệp vụ có mã máy đọc được — response {detail, code} theo API.md §2.

    HTTPException cũ chưa gắn code vẫn hợp lệ (frontend coi là UNKNOWN).
    Thêm mã mới phải bổ sung bảng mã trong docs/API.md cùng commit.
    """

    def __init__(self, code: str, detail: str, status: int = 400) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail
        self.status = status
