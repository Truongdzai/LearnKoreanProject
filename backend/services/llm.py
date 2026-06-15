from __future__ import annotations

import json

import httpx

from ..config import settings

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"

def _gemini_headers() -> dict:
    return {"x-goog-api-key": settings["llm"]["api_key"]}

def _gemini_model() -> str:
    return settings["llm"]["model"] or "gemini-2.5-flash"

def gemini_list_models() -> list[str]:
    resp = httpx.get(f"{GEMINI_BASE}/models", headers=_gemini_headers(), timeout=20.0)
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
    url = f"{GEMINI_BASE}/models/{_gemini_model()}:generateContent"
    resp = httpx.post(url, headers=_gemini_headers(), json=body, timeout=60.0)
    resp.raise_for_status()
    data = resp.json()
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
    url = f"{GEMINI_BASE}/models/{_gemini_model()}:generateContent"
    resp = httpx.post(url, headers=_gemini_headers(), json=body, timeout=120.0)
    resp.raise_for_status()
    data = resp.json()
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
            return True, {"models": len(models), "reply": reply.strip()[:60]}
        return False, f"Provider chưa hỗ trợ: {provider}"
    except httpx.HTTPStatusError as exc:
        return False, f"HTTP {exc.response.status_code}: {exc.response.text[:200]}"
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"
