from __future__ import annotations

from .conftest import auth_headers, register


def test_state_shape(client):
    s = register(client, "state@test.vn")
    r = client.get("/api/me/state", headers=auth_headers(s["token"]))
    assert r.status_code == 200
    data = r.json()
    for key in ("user", "owned", "garden", "paths", "savedVideos", "todayXp", "goalBonusClaimed"):
        assert key in data
    for key in ("id", "name", "coins", "xp", "level", "streak", "isPlus"):
        assert key in data["user"]


def test_state_requires_auth(client):
    r = client.get("/api/me/state")
    assert r.status_code == 401
    assert r.json()["code"] == "AUTH_REQUIRED"


def test_buy_insufficient_coins(client):
    s = register(client, "buy@test.vn")
    shop = client.get("/api/content/shop").json()["shop"]
    coins = s["user"]["coins"]
    item = next(i for i in shop if not i["plus"] and i["price"] > coins)
    r = client.post("/api/me/buy", json={"item_id": item["id"]}, headers=auth_headers(s["token"]))
    assert r.status_code == 400
    assert r.json()["code"] == "INSUFFICIENT_COINS"


def test_goal_bonus_claimed_once_per_day(client):
    s = register(client, "goal@test.vn")
    h = auth_headers(s["token"])

    r = client.post("/api/me/event", json={"type": "lesson", "amount": 1}, headers=h)
    assert r.status_code == 200

    first = client.post("/api/me/goal-bonus", json={"goal": 30}, headers=h)
    assert first.status_code == 200

    second = client.post("/api/me/goal-bonus", json={"goal": 30}, headers=h)
    assert second.status_code == 409
    assert second.json()["code"] == "ALREADY_CLAIMED"
