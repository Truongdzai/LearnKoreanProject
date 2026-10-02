from __future__ import annotations

from .conftest import auth_headers, register
from ..services import gameplay


def test_plan_roundtrip(client):
    h = auth_headers(register(client)["token"])
    assert client.put("/api/me/plans/engrammar", json={"data": {"best": {"e01": 100}}}, headers=h).status_code == 200
    r = client.get("/api/me/plans/engrammar", headers=h)
    assert r.json()["data"] == {"best": {"e01": 100}}


def test_plan_id_must_be_simple(client):
    h = auth_headers(register(client)["token"])
    for bad in ("Engrammar", "a" * 33, "x.y", "%20"):
        assert client.put(f"/api/me/plans/{bad}", json={"data": {}}, headers=h).status_code == 422, bad


def test_plan_count_is_capped_but_existing_plans_stay_writable(client, monkeypatch):
    monkeypatch.setattr(gameplay, "MAX_PLANS_PER_USER", 3)
    h = auth_headers(register(client)["token"])
    for i in range(3):
        assert client.put(f"/api/me/plans/p{i}", json={"data": {"i": i}}, headers=h).status_code == 200
    assert client.put("/api/me/plans/p3", json={"data": {}}, headers=h).status_code == 422
    assert client.put("/api/me/plans/p0", json={"data": {"i": 9}}, headers=h).status_code == 200
