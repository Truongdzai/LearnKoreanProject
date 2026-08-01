from __future__ import annotations

import smtplib
import ssl
from email.message import EmailMessage

from ..config import settings
from .logs import log


def _cfg() -> dict:
    return settings.get("smtp", {}) or {}


def configured() -> bool:
    c = _cfg()
    return bool(c.get("host") and c.get("user") and c.get("password"))


def send_email(to: str, subject: str, body: str) -> bool:
    c = _cfg()
    if not configured():
        log(f"\n[MAILER · dev — chưa cấu hình SMTP]\n  Gửi tới: {to}\n  Tiêu đề: {subject}\n  {body}\n")
        return False
    sender = c.get("sender") or c["user"]
    name = c.get("sender_name") or "VyLing"
    msg = EmailMessage()
    msg["From"] = f"{name} <{sender}>"
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(body)
    host = c["host"]
    port = int(c.get("port") or 587)
    try:
        ctx = ssl.create_default_context()
        if port == 465:
            with smtplib.SMTP_SSL(host, port, context=ctx, timeout=20) as s:
                s.login(c["user"], c["password"])
                s.send_message(msg)
        else:
            with smtplib.SMTP(host, port, timeout=20) as s:
                s.starttls(context=ctx)
                s.login(c["user"], c["password"])
                s.send_message(msg)
        return True
    except Exception as exc:
        log(f"[MAILER] Gửi email thất bại: {exc}")
        return False


def send_code(to: str, code: str, purpose: str) -> bool:
    if purpose == "verify":
        subject = "VyLing — Xác minh địa chỉ email"
        intro = (
            "Chào mừng bạn đến VyLing! Xác minh email để giữ được tài khoản khi quên mật khẩu "
            "và nhận nhắc học đúng lúc."
        )
    elif purpose == "reset":
        subject = "VyLing — Mã đặt lại mật khẩu"
        intro = "Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu tài khoản VyLing."
    else:
        subject = "VyLing — Mã đổi mật khẩu"
        intro = "Bạn vừa yêu cầu đổi mật khẩu tài khoản VyLing."
    body = (
        f"{intro}\n\n"
        f"Mã xác nhận của bạn là: {code}\n\n"
        "Mã có hiệu lực trong 10 phút. Nhập mã này vào trang để tiếp tục.\n"
        "Nếu không phải bạn, hãy bỏ qua email này — mật khẩu của bạn không thay đổi.\n\n"
        "— VyLing"
    )
    return send_email(to, subject, body)
