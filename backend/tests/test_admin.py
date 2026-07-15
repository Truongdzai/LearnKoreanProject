from __future__ import annotations

from .conftest import auth_headers, make_admin, register


def test_admin_forbidden_for_user(client):
    s = register(client, "user@test.vn")
    r = client.get("/api/admin/stats", headers=auth_headers(s["token"]))
    assert r.status_code == 403
    assert r.json()["code"] == "FORBIDDEN"


def test_admin_stats_for_admin(client):
    s = register(client, "boss@test.vn")
    make_admin(s["user"]["id"])
    r = client.post("/api/auth/login", json={"email": "boss@test.vn", "password": "matkhau6"})
    token = r.json()["token"]
    r = client.get("/api/admin/stats", headers=auth_headers(token))
    assert r.status_code == 200
