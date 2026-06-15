from __future__ import annotations

import httpx

def invoke(action: str, url: str, **params):
    payload = {"action": action, "version": 6, "params": params}
    resp = httpx.post(url, json=payload, timeout=5.0)
    resp.raise_for_status()
    data = resp.json()
    if data.get("error"):
        raise RuntimeError(data["error"])
    return data.get("result")

def check(url: str):
    try:
        version = invoke("version", url)
        return True, version
    except Exception as exc:
        return False, str(exc)

def add_note(url: str, deck: str, note_type: str, fields: dict, tags=None):
    note = {
        "deckName": deck,
        "modelName": note_type,
        "fields": fields,
        "tags": tags or ["hanquan"],
        "options": {"allowDuplicate": False},
    }
    return invoke("addNote", url, note=note)

def ensure_deck(url: str, deck: str):
    return invoke("createDeck", url, deck=deck)

HANQUAN_MODEL = "HanQuan"
HANQUAN_FIELDS = ["Korean", "Vietnamese", "Source"]

def ensure_model(url: str, model_name: str = HANQUAN_MODEL):
    if model_name in (invoke("modelNames", url) or []):
        return
    invoke(
        "createModel",
        url,
        modelName=model_name,
        inOrderFields=HANQUAN_FIELDS,
        css=(
            ".card{font-family:'Malgun Gothic',sans-serif;text-align:center;"
            "color:#1a1a1a;background:#fff;padding:18px}"
            ".ko{font-size:26px}.vi{color:#444;font-size:19px;margin-top:6px}"
            ".src{color:#999;font-size:12px;margin-top:14px}"
        ),
        cardTemplates=[{
            "Name": "Hàn → Việt",
            "Front": "<div class='ko'>{{Korean}}</div>",
            "Back": "{{FrontSide}}<hr id=answer>"
                    "<div class='vi'>{{Vietnamese}}</div>"
                    "<div class='src'>{{Source}}</div>",
        }],
    )
