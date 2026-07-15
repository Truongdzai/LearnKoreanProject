from __future__ import annotations

from .. import db
from .conftest import auth_headers, register


def test_register_login_me(client):
    s = register(client, "a@test.vn")
    assert s["token"] and s["user"]["email"] == "a@test.vn"

    r = client.post("/api/auth/login", json={"email": "a@test.vn", "password": "matkhau6"})
    assert r.status_code == 200
    token = r.json()["token"]

    me = client.get("/api/auth/me", headers=auth_headers(token))
    assert me.status_code == 200
    assert me.json()["user"]["id"] == s["user"]["id"]


def test_login_wrong_password(client):
    register(client, "b@test.vn")
    r = client.post("/api/auth/login", json={"email": "b@test.vn", "password": "saimatkhau"})
    assert r.status_code == 401


def test_garbage_token(client):
    r = client.get("/api/auth/me", headers=auth_headers("xxx.yyy"))
    assert r.status_code == 401


def test_login_rate_limited_after_10_fails(client):
    register(client, "c@test.vn")
    for _ in range(10):
        r = client.post("/api/auth/login", json={"email": "c@test.vn", "password": "saimatkhau"})
        assert r.status_code == 401
    r = client.post("/api/auth/login", json={"email": "c@test.vn", "password": "matkhau6"})
    assert r.status_code == 429
    assert r.json()["code"] == "RATE_LIMITED"


def test_token_version_revokes_old_tokens(client):
    s = register(client, "d@test.vn")
    token = s["token"]
    assert client.get("/api/auth/me", headers=auth_headers(token)).status_code == 200

    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET token_version = token_version + 1 WHERE id = ?", (s["user"]["id"],))
        conn.commit()
    finally:
        conn.close()

    r = client.get("/api/auth/me", headers=auth_headers(token))
    assert r.status_code == 401
    assert r.json()["code"] == "AUTH_EXPIRED"
