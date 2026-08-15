from __future__ import annotations

import json
import threading
import time

import httpx

from ..config import settings

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"

DEFAULT_LADDER = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-2.5-flash",
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

def _sweep(models: list[str], start: int, body: dict, timeout: float) -> tuple[dict | None, Exception | None, bool]:
    n = len(models)
    last_error: Exception | None = None
    busy = False
    for step in range(n):
        idx = (start + step) % n
        model = models[idx]
        url = f"{GEMINI_BASE}/models/{model}:generateContent"
        try:
            resp = httpx.post(url, headers=_headers(), json=body, timeout=timeout)
            resp.raise_for_status()
            with _lock:
                _state["idx"] = idx
            return resp.json(), None, False
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            last_error = exc
            if status in RETRYABLE_STATUS:
                busy = True
                continue
            if status in SKIP_STATUS:
                continue
            raise
        except httpx.HTTPError as exc:
            last_error = exc
            busy = True
            continue
    return None, last_error, busy


def _generate(body: dict, timeout: float) -> dict:
    models = _models()
    n = len(models)
    with _lock:
        start = min(_state["idx"], n - 1)

    last_error: Exception | None = None
    for wait in (0.0, 4.0, 12.0):
        if wait:
            time.sleep(wait)
        data, last_error, busy = _sweep(models, start, body, timeout)
        if data is not None:
            return data
        if not busy:
            break

    raise RuntimeError(
        f"Tất cả model đều không phản hồi (đã thử {n} model). Lỗi cuối: {last_error}"
    )

IMAGE_LADDER = [
    "gemini-3.1-flash-lite-image",
    "gemini-3.1-flash-image",
    "gemini-2.5-flash-image",
    "gemini-3-pro-image",
]


def _image_models() -> list[str]:
    cfg = settings["llm"]
    models = cfg.get("image_models") or []
    if isinstance(models, str):
        models = [m.strip() for m in models.split(",") if m.strip()]
    return models or list(IMAGE_LADDER)


def gemini_image(prompt: str) -> tuple[bytes, str, str]:
    import base64

    last_error = "chưa gọi được model nào"
    for model in _image_models():
        url = f"{GEMINI_BASE}/models/{model}:generateContent"
        try:
            resp = httpx.post(
                url,
                headers={**_headers(), "Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=180.0,
            )
        except Exception as exc:
            last_error = f"{model}: {exc}"
            continue

        if resp.status_code in SKIP_STATUS or resp.status_code in RETRYABLE_STATUS:
            last_error = f"{model}: HTTP {resp.status_code} {resp.text[:120]}"
            continue
        if resp.status_code != 200:
            last_error = f"{model}: HTTP {resp.status_code} {resp.text[:120]}"
            continue

        data = resp.json()
        for cand in data.get("candidates", []):
            for part in cand.get("content", {}).get("parts", []):
                inline = part.get("inlineData") or part.get("inline_data")
                if inline and inline.get("data"):
                    return base64.b64decode(inline["data"]), inline.get("mimeType", "image/png"), model
        last_error = f"{model}: phản hồi không có ảnh"

    raise RuntimeError(f"Không tạo được ảnh. Lỗi cuối: {last_error}")


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

def gemini_vision_json(
    prompt: str,
    images: list[tuple[bytes, str]],
    schema: dict,
    system: str | None = None,
    temperature: float = 0.1,
):
    import base64

    parts: list[dict] = [{"text": prompt}]
    for raw, mime in images:
        parts.append({"inlineData": {"mimeType": mime, "data": base64.b64encode(raw).decode("ascii")}})
    body: dict = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
            "responseSchema": schema,
        },
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    data = _generate(body, timeout=180.0)
    return json.loads(data["candidates"][0]["content"]["parts"][0]["text"])

def gemini_audio_json(
    prompt: str,
    audio: bytes,
    mime: str,
    schema: dict,
    system: str | None = None,
    temperature: float = 0.1,
):
    import base64

    parts: list[dict] = [
        {"text": prompt},
        {"inlineData": {"mimeType": mime, "data": base64.b64encode(audio).decode("ascii")}},
    ]
    body: dict = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "temperature": temperature,
            "responseMimeType": "application/json",
            "responseSchema": schema,
        },
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    data = _generate(body, timeout=300.0)
    return json.loads(data["candidates"][0]["content"]["parts"][0]["text"])


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
