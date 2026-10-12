"""Trang ngoại tuyến phải bấm được 'Thử lại' dưới CSP của backend.

CSP gắn vào mọi phản hồi không phải /api (kể cả /offline.html mà service worker lưu
kèm header), và script-src không có 'unsafe-inline' nên onclick=... bị chặn.
"""
from __future__ import annotations

import re
from pathlib import Path

PUBLIC = Path(__file__).resolve().parents[2] / "frontend" / "public"


def _directive(csp: str, name: str) -> str:
    return next(d.strip() for d in csp.split(";") if d.strip().startswith(name + " "))


def test_csp_on_pages_forbids_inline_scripts(client):
    r = client.get("/offline.html")
    script_src = _directive(r.headers["content-security-policy"], "script-src")
    assert "'self'" in script_src
    assert "'unsafe-inline'" not in script_src


def test_offline_page_has_no_inline_handlers_or_scripts():
    html = (PUBLIC / "offline.html").read_text(encoding="utf-8")
    assert not re.search(r"\son[a-z]+\s*=", html, re.I)
    scripts = re.findall(r"<script\b([^>]*)>(.*?)</script>", html, re.S | re.I)
    assert scripts, "nút Thử lại cần một script ngoài để gắn sự kiện"
    for attrs, body in scripts:
        assert not body.strip()
        src = re.search(r'src="/([^"]+)"', attrs)
        assert src and (PUBLIC / src.group(1)).is_file()


def test_offline_script_binds_the_retry_button():
    html = (PUBLIC / "offline.html").read_text(encoding="utf-8")
    js = (PUBLIC / "offline.js").read_text(encoding="utf-8")
    button_id = re.search(r'<button[^>]*\bid="([^"]+)"', html).group(1)
    assert f"getElementById('{button_id}')" in js
    assert "location.reload()" in js


def test_service_worker_precaches_offline_script():
    sw = (PUBLIC / "sw.js").read_text(encoding="utf-8")
    consts = dict(re.findall(r"const (\w+) = '([^']*)'", sw))
    install = re.search(r"addAll\(\[([^\]]*)\]\)", sw).group(1)
    names = [x.strip() for x in install.split(",")]
    cached = {consts.get(n, n.strip("'")) for n in names}
    assert {"/offline.html", "/offline.js"} <= cached
