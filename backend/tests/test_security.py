from __future__ import annotations

import threading

from .conftest import auth_headers, register
from .. import db
from ..services import quota


def _lock(user_id: str) -> None:
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET status = 'locked' WHERE id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()


def test_malformed_token_is_401_not_500(client):
    bad_tokens = (
        "!!!garbage!!!",
        "no-dot-at-all",
        "",
        "aaa.bbb",
        "a.b",
        "aaa.a",
        "aaa.ab!c",
        "aaa.bbbbb",
        "aaa.b" * 40,
    )
    for bad in bad_tokens:
        r = client.get("/api/auth/me", headers=auth_headers(bad))
        assert r.status_code == 401, f"{bad!r} -> {r.status_code}"


def test_overlong_password_rejected_before_hashing(client):
    r = client.post("/api/auth/register", json={"email": "long@test.vn", "password": "a" * 5000})
    assert r.status_code == 422
    r = client.post("/api/auth/register", json={"email": "a" * 300 + "@test.vn", "password": "matkhau6"})
    assert r.status_code == 422


def test_short_password_rejected(client):
    r = client.post("/api/auth/register", json={"email": "short@test.vn", "password": "abc"})
    assert r.status_code == 400


def test_locked_account_cannot_reset_password(client):
    s = register(client, "locked@test.vn")
    _lock(s["user"]["id"])

    from ..services import verify

    code = verify.create_code("locked@test.vn", "reset")
    r = client.post(
        "/api/auth/password/reset",
        json={"email": "locked@test.vn", "code": code, "password": "matkhaumoi"},
    )
    assert r.status_code == 403
    assert r.json()["code"] == "ACCOUNT_LOCKED"


def test_locked_account_not_treated_as_authed(client):
    s = register(client, "locked2@test.vn")
    h = auth_headers(s["token"])
    assert client.get("/api/quota", headers=h).json()["authed"] is True

    _lock(s["user"]["id"])
    assert client.get("/api/quota", headers=h).json()["authed"] is False
    assert client.get("/api/auth/me", headers=h).status_code == 403


def test_admin_update_rejects_unknown_status(client):
    from .conftest import make_admin

    s = register(client, "adm@test.vn")
    make_admin(s["user"]["id"])
    h = auth_headers(s["token"])
    victim = register(client, "victim@test.vn")

    r = client.post(
        "/api/admin/users/update",
        json={"id": victim["user"]["id"], "status": "khong-ton-tai"},
        headers=h,
    )
    assert r.status_code == 400


def test_quota_consume_is_atomic_under_concurrency(client):
    user = {"id": "concurrency-user"}
    burst = int((quota._cfg() or {}).get("burst_per_minute", 12))

    passed: list[int] = []
    lock = threading.Lock()

    def hit() -> None:
        try:
            quota.consume("define", user, "")
            with lock:
                passed.append(1)
        except Exception:
            pass

    threads = [threading.Thread(target=hit) for _ in range(burst * 3)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT used FROM ai_usage WHERE subject = ?", (f"u:{user['id']}",)
        ).fetchone()
    finally:
        conn.close()

    assert len(passed) == burst
    assert row["used"] == len(passed)


def test_events_endpoint_is_throttled(client):
    saved = 0
    for _ in range(6):
        r = client.post("/api/events", json={"events": [{"event": "spam"}] * 40})
        saved += r.json()["saved"]
    assert saved <= 120
