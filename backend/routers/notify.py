from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from .. import db
from ..services import notify

router = APIRouter(prefix="/api/email", tags=["Email hệ thống"])


def _page(title: str, message: str) -> HTMLResponse:
    return HTMLResponse(
        "<!doctype html><html lang='vi'><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'>"
        "<meta name='robots' content='noindex'>"
        f"<title>{title} · VyLing</title>"
        "<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#e2e8f0;"
        "font-family:'Be Vietnam Pro',system-ui,sans-serif;padding:24px}"
        ".box{max-width:420px;text-align:center}h1{font-size:21px;margin:0 0 10px}"
        "p{color:#94a3b8;line-height:1.65;margin:0 0 20px}"
        "a{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:11px 20px;border-radius:11px;"
        "font-weight:600}</style></head><body><div class='box'>"
        f"<h1>{title}</h1><p>{message}</p><a href='/'>Về trang chủ VyLing</a></div></body></html>"
    )


@router.get("/unsubscribe", include_in_schema=False)
def unsubscribe(u: str = "", t: str = ""):
    if not u or not notify.check_unsub(u, t):
        return _page("Link không hợp lệ", "Link huỷ nhận thư này đã hỏng hoặc không đúng. Bạn có thể tắt thư trong trang Hoạt động sau khi đăng nhập.")
    conn = db.get_conn()
    try:
        row = conn.execute("SELECT id FROM users WHERE id = ?", (u,)).fetchone()
        if not row:
            return _page("Không tìm thấy tài khoản", "Tài khoản này không còn tồn tại.")
        conn.execute("UPDATE users SET email_optout = 1 WHERE id = ?", (u,))
        conn.commit()
    finally:
        conn.close()
    return _page(
        "Đã tắt thư nhắc học",
        "Từ giờ VyLing sẽ không gửi thư nhắc học cho bạn nữa. Thư liên quan tới tài khoản "
        "(đổi mật khẩu, xác minh email) vẫn được gửi khi bạn yêu cầu. Muốn bật lại: vào trang Hoạt động.",
    )
