from __future__ import annotations


class AppError(Exception):

    def __init__(self, code: str, detail: str, status: int = 400) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail
        self.status = status


def upstream_ai(message: str, exc: Exception) -> AppError:
    """Lỗi khi gọi AI bên ngoài: chi tiết kỹ thuật (URL nhà cung cấp, tên model,
    mã HTTP) chỉ ghi vào log máy chủ, người dùng chỉ thấy câu dễ hiểu."""
    if isinstance(exc, AppError):
        return exc
    from .services import logs

    logs.log(f"[UPSTREAM_AI] {message}: {type(exc).__name__}: {exc}")
    return AppError("UPSTREAM_AI", f"{message}. Bạn thử lại sau ít phút nhé.", 502)
