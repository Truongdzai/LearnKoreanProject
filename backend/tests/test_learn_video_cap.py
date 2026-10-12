from __future__ import annotations

from ..services import quota
from .conftest import auth_headers, register


def _vid(n: int) -> dict:
    return {"id": f"vid{n:08d}", "title": f"Video {n}", "lang": "ko"}


def test_free_video_cap_returns_plus_required(client):
    # LibraryPage/loadLesson dựa vào code PLUS_REQUIRED + thông báo tiếng Việt khi chạm trần
    h = auth_headers(register(client, "learn-cap@test.vn")["token"])
    for n in range(quota.FREE_VIDEOS):
        r = client.post("/api/me/videos/save", json=_vid(n), headers=h)
        assert r.status_code == 200, r.text

    r = client.post("/api/me/videos/save", json=_vid(quota.FREE_VIDEOS), headers=h)
    assert r.status_code == 403
    body = r.json()
    assert body["code"] == "PLUS_REQUIRED"
    assert "Xoá bớt" in body["detail"]

    # Lưu lại video đã có vẫn được (tự lưu khi mở lại video cũ không lỗi)
    r = client.post("/api/me/videos/save", json=_vid(0), headers=h)
    assert r.status_code == 200
    assert len(r.json()["savedVideos"]) == quota.FREE_VIDEOS

    r = client.post("/api/me/videos/remove", json={"id": _vid(0)["id"]}, headers=h)
    assert r.status_code == 200
    r = client.post("/api/me/videos/save", json=_vid(quota.FREE_VIDEOS), headers=h)
    assert r.status_code == 200


def test_guest_cannot_save_video(client):
    r = client.post("/api/me/videos/save", json=_vid(1))
    assert r.status_code == 401
