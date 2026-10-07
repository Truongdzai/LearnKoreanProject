from __future__ import annotations

import re
from pathlib import Path

from ..routers import srs as srs_router
from .conftest import auth_headers, register

LEARN_PAGE = Path(__file__).resolve().parents[2] / "frontend" / "src" / "features" / "learn" / "LearnPage.tsx"
TAG = " (youtube:abcdefghijk)"


def test_frontend_source_cap_matches_backend():
    src = LEARN_PAGE.read_text(encoding="utf-8")
    m = re.search(r"const SOURCE_MAX = (\d+)", src)
    assert m, "LearnPage.tsx phải khai báo SOURCE_MAX"
    assert int(m.group(1)) == srs_router.MAX_SOURCE


def test_clamped_youtube_source_is_accepted(client):
    h = auth_headers(register(client, "learn-src@test.vn")["token"])
    room = srs_router.MAX_SOURCE - len(TAG)
    # Tiêu đề bị cắt kiểu LearnPage: (room - 1) ký tự + '…' + hậu tố, kể cả emoji
    for k, title in enumerate(["x" * (room - 1) + "…", "😀" * (room - 1) + "…"]):
        source = title + TAG
        assert len(source) == srs_router.MAX_SOURCE
        r = client.post("/api/srs/add", json={"front": f"단어{k}", "back": "x", "source": source}, headers=h)
        assert r.status_code == 200, r.text

    cards = client.get("/api/srs/all", headers=h).json()["cards"]
    assert all(c["source"].endswith(TAG) for c in cards)


def test_unclamped_youtube_source_is_rejected(client):
    h = auth_headers(register(client, "learn-src-long@test.vn")["token"])
    source = "Friends: Ross and Rachel's First Kiss (Season 2 Clip) | TBS" + TAG
    assert len(source) > srs_router.MAX_SOURCE
    r = client.post("/api/srs/add", json={"front": "안녕", "back": "x", "source": source}, headers=h)
    assert r.status_code == 422
