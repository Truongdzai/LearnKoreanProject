from __future__ import annotations


def test_videos_all_languages(client):
    data = client.get("/api/content/videos").json()
    assert len(data["videos"]) > 0
    assert all("lang" in v and "id" in v and "title" in v for v in data["videos"])


def test_videos_filter_by_lang(client):
    data = client.get("/api/content/videos?lang=en").json()
    assert len(data["videos"]) > 0
    assert all(v["lang"] == "en" for v in data["videos"])


def test_quests_shop_plans_leaderboard(client):
    quests = client.get("/api/content/quests").json()["quests"]
    assert quests and {"id", "title", "period", "target", "reward"} <= set(quests[0])

    shop = client.get("/api/content/shop").json()["shop"]
    assert shop and {"id", "name", "price", "category"} <= set(shop[0])

    r = client.get("/api/content/plans")
    assert r.status_code == 200

    r = client.get("/api/content/leaderboard")
    assert r.status_code == 200
    assert "entries" in r.json()
