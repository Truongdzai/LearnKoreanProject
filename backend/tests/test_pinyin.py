from __future__ import annotations

from ..services import pinyin


def test_pinyin_endpoint(client):
    r = client.post("/api/define/pinyin", json={"words": ["你好", "今天", "hello", "，"]})
    assert r.status_code == 200
    data = r.json()["readings"]
    if not pinyin.available():
        assert data == {}
        return
    assert data["你好"] == "nǐ hǎo"
    assert data["今天"] == "jīn tiān"
    assert "hello" not in data and "，" not in data


def test_pinyin_picks_right_sound_for_polyphone():
    if not pinyin.available():
        return
    out = pinyin.readings(["银行", "行长"])
    assert out["银行"] == "yín háng"
    assert out["行长"] == "háng zhǎng"
