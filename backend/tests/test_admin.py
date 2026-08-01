from __future__ import annotations

from .. import db
from ..services import catalog
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


def test_admin_catalog_edits_survive_seed(client):
    s = register(client, "boss2@test.vn")
    make_admin(s["user"]["id"])
    token = client.post("/api/auth/login", json={"email": "boss2@test.vn", "password": "matkhau6"}).json()["token"]
    h = auth_headers(token)

    seeded = client.get("/api/content/videos?lang=ko").json()["videos"][0]["id"]
    r = client.post("/api/admin/catalog/save",
                    json={"kind": "videos", "data": {"id": seeded, "title": "Tiêu đề quản trị"}}, headers=h)
    assert r.status_code == 200, r.text
    r = client.post(
        "/api/admin/catalog/save",
        json={"kind": "videos", "data": {"id": "vid-admin-them", "title": "Video tự thêm", "lang": "ko", "level": "A1"}},
        headers=h,
    )
    assert r.status_code == 200, r.text

    catalog.seed()

    vids = {v["id"]: v for v in client.get("/api/content/videos?lang=ko").json()["videos"]}
    assert vids[seeded]["title"] == "Tiêu đề quản trị"
    assert "vid-admin-them" in vids


def test_seed_still_repairs_untouched_rows(client):
    seeded = client.get("/api/content/videos?lang=ko").json()["videos"][0]
    conn = db.get_conn()
    try:
        conn.execute("UPDATE catalog_videos SET title = 'hỏng' WHERE id = ?", (seeded["id"],))
        conn.commit()
    finally:
        conn.close()

    catalog.seed()

    vids = {v["id"]: v for v in client.get("/api/content/videos?lang=ko").json()["videos"]}
    assert vids[seeded["id"]]["title"] == seeded["title"]
