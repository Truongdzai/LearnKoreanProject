from __future__ import annotations

import httpx

from .conftest import auth_headers, register
from ..errors import AppError
from ..services import llm


def _fail_with_url(*args, **kwargs):
    req = httpx.Request("POST", "https://generativelanguage.googleapis.com/v1beta/models/secret-model:generateContent")
    raise httpx.HTTPStatusError("403 Forbidden", request=req, response=httpx.Response(403, request=req))


def test_ai_failure_hides_provider_details(client, monkeypatch):
    monkeypatch.setattr(llm, "gemini_json", _fail_with_url)
    token = register(client)["token"]
    r = client.post("/api/speaking/reply", json={"situation": "cafe"}, headers=auth_headers(token))
    assert r.status_code == 502
    body = r.json()
    assert body["code"] == "UPSTREAM_AI"
    assert "googleapis" not in body["detail"]
    assert "secret-model" not in body["detail"]
    assert "403" not in body["detail"]


def test_friendly_app_error_inside_ai_call_is_kept(client, monkeypatch):
    def quota_hit(*args, **kwargs):
        raise AppError("QUOTA", "Hết lượt hôm nay.", 429)

    monkeypatch.setattr(llm, "gemini_json", quota_hit)
    token = register(client)["token"]
    r = client.post("/api/speaking/reply", json={"situation": "cafe"}, headers=auth_headers(token))
    assert r.status_code == 429
    assert r.json()["detail"] == "Hết lượt hôm nay."
