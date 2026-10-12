from __future__ import annotations

import pytest

from ..config import settings
from ..services import lingo, pinyin, quota
from .conftest import auth_headers, register


@pytest.fixture()
def fake_llm(monkeypatch):
    calls: list[int] = []
    monkeypatch.setitem(settings["llm"], "provider", "gemini")

    def gen():
        calls.append(1)
        return [dict(lingo.CURATED[0], term=f"새말{len(calls)}")]

    monkeypatch.setattr(lingo, "_generate", gen)
    return calls


def test_lingo_guest_refresh_returns_cache_without_llm(client, fake_llm):
    first = client.get("/api/lingo").json()
    assert first["source"] == "ai" and len(fake_llm) == 1
    for _ in range(5):
        r = client.get("/api/lingo?refresh=1")
        assert r.status_code == 200
        assert r.json()["items"] == first["items"]
    assert len(fake_llm) == 1
    assert quota.status(None, "testclient")["used"] == 0


def test_lingo_user_refresh_consumes_quota(client, fake_llm, monkeypatch):
    monkeypatch.setitem(settings["quota"], "user_per_day", 2 * quota.COST["lingo"])
    s = register(client)
    h = auth_headers(s["token"])
    client.get("/api/lingo")
    assert len(fake_llm) == 1

    for n in (2, 3):
        r = client.get("/api/lingo?refresh=1", headers=h)
        assert r.status_code == 200
        assert r.json()["items"][0]["term"] == f"새말{n}"
    assert len(fake_llm) == 3
    assert quota.status(s["user"], "")["used"] == 2 * quota.COST["lingo"]

    r = client.get("/api/lingo?refresh=1", headers=h)
    assert r.status_code == 429
    assert r.json()["code"] == "RATE_LIMITED"
    assert len(fake_llm) == 3

    assert client.get("/api/lingo", headers=h).json()["items"][0]["term"] == "새말3"


def test_lingo_refresh_without_ai_is_free(client, monkeypatch):
    monkeypatch.setitem(settings["llm"], "provider", "none")
    s = register(client)
    r = client.get("/api/lingo?refresh=1", headers=auth_headers(s["token"]))
    assert r.status_code == 200
    assert r.json()["source"] == "curated"
    assert quota.status(s["user"], "")["used"] == 0


def test_pinyin_erhua_merges_into_previous_syllable():
    pytest.importorskip("pypinyin")
    out = pinyin.readings(["哪儿", "一点儿", "这儿", "一会儿", "有点儿", "在哪儿", "玩儿", "小孩儿"])
    assert out["哪儿"] == "nǎr"
    assert out["一点儿"] == "yì diǎnr"
    assert out["这儿"] == "zhèr"
    assert out["一会儿"].endswith(" huìr") and len(out["一会儿"].split()) == 2
    assert out["有点儿"] == "yǒu diǎnr"
    assert out["在哪儿"] == "zài nǎr"
    assert out["玩儿"] == "wánr"
    assert out["小孩儿"] == "xiǎo háir"


def test_pinyin_keeps_full_er_syllable():
    pytest.importorskip("pypinyin")
    out = pinyin.readings(["女儿", "儿子", "儿童", "婴儿", "幼儿园", "儿", "然而"])
    assert out["女儿"] == "nǚ ér"
    assert out["儿子"] == "ér zi"
    assert out["儿童"] == "ér tóng"
    assert out["婴儿"] == "yīng ér"
    assert out["幼儿园"] == "yòu ér yuán"
    assert out["儿"] == "ér"
    assert out["然而"] == "rán ér"


def test_pinyin_erhua_with_punctuation_and_endpoint(client):
    pytest.importorskip("pypinyin")
    assert pinyin.readings(["哪儿?"])["哪儿?"] == "nǎr ?"
    r = client.post("/api/define/pinyin", json={"words": ["点儿", "女儿"]})
    assert r.json()["readings"] == {"点儿": "diǎnr", "女儿": "nǚ ér"}
