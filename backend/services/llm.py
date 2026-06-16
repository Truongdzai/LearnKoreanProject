from __future__ import annotations

import json
import threading

import httpx

from ..config import settings

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"

DEFAULT_LADDER = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

RETRYABLE_STATUS = {429, 500, 503}
SKIP_STATUS = {400, 404}

_lock = threading.Lock()
_state = {"idx": 0}

def _headers() -> dict:
    return {"x-goog-api-key": settings["llm"]["api_key"]}

def _models() -> list[str]:
    cfg = settings["llm"]
    models = cfg.get("models") or []
    if isinstance(models, str):
        models = [m.strip() for m in models.split(",") if m.strip()]
    if not models:
        single = cfg.get("model")
        models = [single] if single else list(DEFAULT_LADDER)
    return models

def current_model() -> str:
    models = _models()
    with _lock:
        idx = min(_state["idx"], len(models) - 1)
    return models[idx]

def _generate(body: dict, timeout: float) -> dict:
    models = _models()
    n = len(models)
    with _lock:
        start = min(_state["idx"], n - 1)

    last_error: Exception | None = None
    for step in range(n):
        idx = (start + step) % n
        model = models[idx]
        url = f"{GEMINI_BASE}/models/{model}:generateContent"
        try:
            resp = httpx.post(url, headers=_headers(), json=body, timeout=timeout)
            resp.raise_for_status()
            with _lock:
                _state["idx"] = idx
            return resp.json()
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            last_error = exc
            if status in RETRYABLE_STATUS or status in SKIP_STATUS:
                continue
            raise
        except httpx.HTTPError as exc:
            last_error = exc
            continue

    raise RuntimeError(
        f"Tất cả model đều không phản hồi (đã thử {n} model). Lỗi cuối: {last_error}"
    )

def gemini_list_models() -> list[str]:
    resp = httpx.get(f"{GEMINI_BASE}/models", headers=_headers(), timeout=20.0)
    resp.raise_for_status()
    data = resp.json()
    return [
        m["name"].split("/")[-1]
        for m in data.get("models", [])
        if "generateContent" in m.get("supportedGenerationMethods", [])
    ]

def gemini_chat(prompt: str, system: str | None = None, temperature: float = 0.7) -> str:
    body: dict = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature},
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    data = _generate(body, timeout=60.0)
    return data["candidates"][0]["content"]["parts"][0]["text"]

def gemini_json(prompt: str, schema: dict, system: str | None = None, temperature: float = 0.2):
    body: dict = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
            "responseSchema": schema,
        },
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    data = _generate(body, timeout=120.0)
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return json.loads(text)

def chat(prompt: str, system: str | None = None, **kwargs) -> str:
    provider = settings["llm"]["provider"]
    if provider == "gemini":
        return gemini_chat(prompt, system=system, **kwargs)
    raise NotImplementedError(f"Provider chưa hỗ trợ: {provider}")

def test_connection():
    provider = settings["llm"]["provider"]
    if provider == "none":
        return False, "Chưa cấu hình provider"
    try:
        if provider == "gemini":
            models = gemini_list_models()
            reply = gemini_chat("Dịch sang tiếng Hàn, chỉ trả về đúng phần dịch: 'Xin chào'")
            return True, {"models": len(models), "active": current_model(), "reply": reply.strip()[:60]}
        return False, f"Provider chưa hỗ trợ: {provider}"
    except httpx.HTTPStatusError as exc:
        return False, f"HTTP {exc.response.status_code}: {exc.response.text[:200]}"
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"
