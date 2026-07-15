from __future__ import annotations


def test_feedback_ok_then_rate_limited(client):
    for i in range(20):
        r = client.post("/api/feedback", json={"kind": "idea", "message": f"góp ý {i}", "page": "test"})
        assert r.status_code == 200, r.text
    r = client.post("/api/feedback", json={"kind": "idea", "message": "quá tay", "page": "test"})
    assert r.status_code == 429
    assert r.json()["code"] == "RATE_LIMITED"


def test_feedback_empty_message(client):
    r = client.post("/api/feedback", json={"kind": "bug", "message": "  "})
    assert r.status_code == 400
