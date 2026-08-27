from __future__ import annotations

from .conftest import auth_headers, register


def test_guest_cannot_save_cards(client):
    r = client.post("/api/srs/add", json={"front": "안녕", "back": "xin chào", "source": "test"})
    assert r.status_code == 401
    assert r.json()["code"] == "SIGNUP_REQUIRED"

    due = client.get("/api/srs/due").json()
    assert due["cards"] == []
    assert due["total"] == 0

    assert client.get("/api/srs/all").json()["cards"] == []


def test_add_due_review_stats(client):
    s = register(client, "srs-flow@test.vn")
    h = auth_headers(s["token"])

    r = client.post("/api/srs/add", json={"front": "안녕", "back": "xin chào", "source": "test"}, headers=h)
    assert r.status_code == 200

    due = client.get("/api/srs/due", headers=h).json()
    assert due["total"] == 1
    card = due["cards"][0]
    assert card["front"] == "안녕"
    assert card["lang"] == "ko"

    r = client.post("/api/srs/review", json={"card_id": card["id"], "rating": 3}, headers=h)
    assert r.status_code == 200

    stats = client.get("/api/srs/stats", headers=h).json()
    assert stats["total"] == 1
    assert stats["reviewed_today"] == 1
    assert stats["due"] == 0


def test_user_cards_separate_from_guest(client):
    s = register(client, "srs@test.vn")
    h = auth_headers(s["token"])

    client.post("/api/srs/add", json={"front": "사과", "back": "táo"}, headers=h)

    assert client.get("/api/srs/stats", headers=h).json()["total"] == 1
    assert client.get("/api/srs/stats").json()["total"] == 0


def test_cards_are_private_between_users(client):
    a = register(client, "srs-a@test.vn")
    b = register(client, "srs-b@test.vn")

    client.post("/api/srs/add", json={"front": "물", "back": "nước"}, headers=auth_headers(a["token"]))

    assert client.get("/api/srs/stats", headers=auth_headers(a["token"])).json()["total"] == 1
    assert client.get("/api/srs/stats", headers=auth_headers(b["token"])).json()["total"] == 0
    assert client.get("/api/srs/all", headers=auth_headers(b["token"])).json()["cards"] == []


def test_review_invalid_rating(client):
    r = client.post("/api/srs/review", json={"card_id": 1, "rating": 9})
    assert r.status_code == 400
