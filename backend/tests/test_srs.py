from __future__ import annotations

from .conftest import auth_headers, register


def test_guest_add_due_review_stats(client):
    r = client.post("/api/srs/add", json={"front": "안녕", "back": "xin chào", "source": "test"})
    assert r.status_code == 200

    due = client.get("/api/srs/due").json()
    assert due["total"] == 1
    card = due["cards"][0]
    assert card["front"] == "안녕"

    r = client.post("/api/srs/review", json={"card_id": card["id"], "rating": 3})
    assert r.status_code == 200

    stats = client.get("/api/srs/stats").json()
    assert stats["total"] == 1
    assert stats["reviewed_today"] == 1


def test_user_cards_separate_from_guest(client):
    s = register(client, "srs@test.vn")
    h = auth_headers(s["token"])

    client.post("/api/srs/add", json={"front": "사과", "back": "táo"}, headers=h)

    assert client.get("/api/srs/stats", headers=h).json()["total"] == 1
    assert client.get("/api/srs/stats").json()["total"] == 0


def test_review_invalid_rating(client):
    r = client.post("/api/srs/review", json={"card_id": 1, "rating": 9})
    assert r.status_code == 400
