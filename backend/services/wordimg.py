from __future__ import annotations

import hashlib
import io
import json
import re
import urllib.parse
import urllib.request

from .. import db
from ..config import DATA_DIR, settings

IMG_DIR = DATA_DIR / "wordimg"
THUMB_W = 480

OPENVERSE = "https://api.openverse.org/v1/images/"
TIMEOUT = 12
UA = "VyLing/1.0 (language learning app; contact: support@vyling.local)"

GOOD_LICENSES = ("cc0", "pdm", "by", "by-sa")

STOP = {"a", "an", "the", "to", "of", "in", "on", "at", "for", "and", "or", "be", "is", "are"}

QUERY_HINTS: dict[str, str] = {
    "back": "back body human",
    "ear": "ear human body",
    "hair": "hair hairstyle woman",
    "head": "head human person",
    "nose": "nose face human",
    "eye": "eye human vision",
    "neck": "neck human body",
    "chest": "chest human body",
    "skin": "skin human care",
    "foot": "foot human barefoot",
    "hand": "hand palm human",
    "leg": "leg human body",
    "nail": "nail finger hand",
    "fall": "fall autumn leaves",
    "date": "date calendar day",
    "orange": "orange fruit",
    "light": "light lamp bulb",
    "match": "match matchstick fire",
    "letter": "letter envelope mail",
    "board": "board wooden plank",
    "class": "class classroom students",
    "right": "right arrow direction",
    "left": "left arrow direction",
    "second": "second stopwatch time",
    "minute": "minute clock time",
    "current": "current electric power",
    "present": "present gift box",
    "train": "train railway transport",
    "plant": "plant pot green",
    "watch": "watch wrist clock",
    "glass": "glass drinking water",
    "mouse": "mouse animal rodent",
    "bank": "bank building money",
    "well": "well water hole",
    "pool": "pool swimming water",
    "square": "square plaza town",
    "star": "star night sky",
    "point": "point finger direction",
    "transit": "transit bus public transport",
}


def _clean(word: str) -> str:
    return re.sub(r"[^a-zA-Z' -]", "", (word or "")).strip().lower()[:40]


def _table(conn) -> None:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS word_images ("
        "key TEXT PRIMARY KEY, word TEXT NOT NULL, data TEXT NOT NULL, "
        "created_at TEXT DEFAULT (datetime('now','localtime')))"
    )


def get_cached(key: str) -> dict | None:
    conn = db.get_conn()
    try:
        _table(conn)
        row = conn.execute("SELECT data FROM word_images WHERE key=?", (key,)).fetchone()
    finally:
        conn.close()
    if not row:
        return None
    try:
        return json.loads(row["data"])
    except Exception:
        return None


def save(key: str, word: str, data: dict) -> None:
    conn = db.get_conn()
    try:
        _table(conn)
        conn.execute(
            "INSERT INTO word_images (key, word, data) VALUES (?,?,?) "
            "ON CONFLICT(key) DO UPDATE SET data=excluded.data",
            (key, word, json.dumps(data, ensure_ascii=False)),
        )
        conn.commit()
    finally:
        conn.close()


BLOCK = (
    "nude", "nudes", "naked", "nudity", "topless", "bare chest", "bare breast",
    "breast", "boob", "nipple", "erotic", "erotica", "sensual", "seductive",
    "lingerie", "underwear", "bikini", "swimsuit", "bathing", "bath", "shower",
    "boudoir", "pin-up", "pinup", "burlesque", "striptease", "porn", "nsfw",
    "intimate", "sexy", "sexual", "sex ", "lover", "kiss", "venus", "aphrodite",
    "odalisque", "bordello", "brothel", "anatomy", "torso", "buttock", "thigh",
    "blood", "wound", "corpse", "weapon", "gun", "knife", "cigarette", "alcohol",
    "beer", "wine", "whisky", "drug", "syringe",
)

BAD_WORDS = (
    "chart", "map", "graph", "diagram", "logo", "poster", "stamp", "cover",
    "screenshot", "font", "coat of arms", "flag of", "seal of", "sheet music",
    "table of", "statistics", "infographic", "portrait of", "album",
)


def _blocked(item: dict) -> bool:
    haystack = " ".join([
        (item.get("title") or ""),
        " ".join(t.get("name", "") for t in (item.get("tags") or [])),
    ]).lower()
    return any(b in haystack for b in BLOCK)

GOOD_PROVIDERS = {"rawpixel": 6, "stocksnap": 6, "flickr": 1, "wikimedia": 1}

MIN_RELEVANCE = 3


def _relevance(item: dict, terms: list[str]) -> int:
    title = (item.get("title") or "").lower()
    tags = " ".join(t.get("name", "") for t in (item.get("tags") or [])).lower()
    rel = sum(3 for t in terms if t in title) + sum(1 for t in terms if t in tags)
    if terms and terms[0] in title:
        rel += 3
    if any(b in title for b in BAD_WORDS):
        rel -= 10
    return rel


def _score(item: dict, terms: list[str]) -> int:
    lic = (item.get("license") or "").lower()
    bonus = 4 if lic in ("cc0", "pdm") else 1 if lic == "by" else 0
    bonus += GOOD_PROVIDERS.get((item.get("provider") or "").lower(), 0)
    return _relevance(item, terms) * 4 + bonus


def file_path(name: str):
    safe = re.sub(r"[^a-f0-9]", "", (name or "").split(".")[0])[:40]
    if not safe:
        return None
    p = IMG_DIR / f"{safe}.webp"
    return p if p.exists() else None


def _store(url: str, key: str) -> str:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    name = hashlib.sha1(url.encode("utf-8")).hexdigest()[:32]
    out = IMG_DIR / f"{name}.webp"
    if out.exists() and out.stat().st_size > 0:
        return name

    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
        raw = res.read(6_000_000)

    from PIL import Image

    im = Image.open(io.BytesIO(raw))
    im = im.convert("RGBA" if "A" in im.getbands() or im.mode == "P" else "RGB")
    if im.width > THUMB_W:
        im = im.resize((THUMB_W, max(1, round(im.height * THUMB_W / im.width))), Image.LANCZOS)
    im.save(out, "WEBP", quality=84, method=4)
    return name


AI_STYLE = (
    "Flat vector clipart illustration in a friendly educational flashcard style. "
    "One single centered subject, bold simple shapes, bright cheerful colours, "
    "soft rounded edges, solid plain white background. "
    "Absolutely no text, no letters, no numbers, no watermark, no signature, no border. "
    "Fully clothed, modest, suitable for children."
)

AI_BY_POS = {
    "noun": "Show the object or thing itself, clearly recognisable on its own.",
    "verb": "Show a person in the middle of doing this action, so the action is obvious.",
    "adj": "Show a simple scene where this quality is the most obvious thing in the picture.",
    "adverb": "Show a simple scene where this manner is the most obvious thing in the picture.",
    "prep": "Show two simple objects arranged so the spatial relation is unmistakable.",
}


def ai_prompt(word: str, meaning: str = "", pos: str = "noun", hint: str = "") -> str:
    what = hint or AI_BY_POS.get(pos, AI_BY_POS["noun"])
    mean = f' which means "{meaning}"' if meaning else ""
    return (
        f'An illustration teaching the English word "{word}"{mean}. {what} '
        f"Do not draw anything that merely sounds like the word or shares its spelling — "
        f"draw the meaning itself. {AI_STYLE}"
    )


def _store_bytes(raw: bytes, tag: str) -> str:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    name = hashlib.sha1(raw[:4096] + tag.encode("utf-8")).hexdigest()[:32]
    out = IMG_DIR / f"{name}.webp"
    if out.exists() and out.stat().st_size > 0:
        return name

    from PIL import Image

    im = Image.open(io.BytesIO(raw))
    im = im.convert("RGBA" if "A" in im.getbands() or im.mode == "P" else "RGB")
    if im.width > THUMB_W:
        im = im.resize((THUMB_W, max(1, round(im.height * THUMB_W / im.width))), Image.LANCZOS)
    im.save(out, "WEBP", quality=86, method=4)
    return name


def generate(word: str, meaning: str = "", pos: str = "noun", hint: str = "") -> dict:
    from . import llm

    clean, _, key = _key(word)
    if not clean:
        return {"word": word, "image": None, "error": "bad_word"}

    prompt = ai_prompt(clean, meaning, pos, hint)
    try:
        raw, mime, model = llm.gemini_image(prompt)
    except Exception as exc:
        return {"word": clean, "image": None, "error": str(exc)[:200]}

    try:
        name = _store_bytes(raw, f"{clean}|{model}")
    except Exception as exc:
        return {"word": clean, "image": None, "error": f"store: {exc}"}

    image = {
        "url": f"/api/en/image/file/{name}.webp",
        "file": name,
        "title": f"AI vẽ cho “{clean}”",
        "author": "",
        "author_url": "",
        "license": "AI",
        "license_url": "",
        "source": "",
        "provider": model,
        "query": prompt[:120],
        "ai": True,
        "mime": mime,
    }
    save(key, clean, {"candidates": [], "idx": 0, "image": image, "rejected": [], "ai": True})
    return {"word": clean, "image": image}


def _search(query: str) -> dict | None:
    params = {
        "q": query,
        "page_size": "20",
        "license_type": "commercial",
        "mature": "false",
        "extension": "jpg,png",
        "category": "illustration",
        "source": "rawpixel",
    }
    url = OPENVERSE + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as res:
        payload = json.loads(res.read().decode("utf-8", "replace"))

    terms = [t for t in re.split(r"\s+", query.lower()) if t and t not in STOP]
    keep = []
    for item in payload.get("results") or []:
        if (item.get("license") or "").lower() not in GOOD_LICENSES:
            continue
        if not item.get("url"):
            continue
        if _blocked(item):
            continue
        if _relevance(item, terms) < MIN_RELEVANCE:
            continue
        keep.append((_score(item, terms), item))

    keep.sort(key=lambda x: -x[0])
    return [
        {
            "url": it.get("thumbnail") or it.get("url"),
            "full": it.get("url"),
            "title": it.get("title") or query,
            "author": it.get("creator") or "",
            "author_url": it.get("creator_url") or "",
            "license": (it.get("license") or "").upper(),
            "license_url": it.get("license_url") or "",
            "source": it.get("foreign_landing_url") or "",
            "provider": it.get("provider") or "openverse",
            "query": query,
        }
        for _, it in keep[:8]
    ]


def _key(word: str, query: str = "") -> tuple[str, str, str]:
    clean = _clean(word)
    explicit = (query or "").strip()[:60]
    if explicit and explicit.lower() != clean:
        q = explicit
    else:
        q = QUERY_HINTS.get(clean, clean)
    return clean, q, clean


def clear_non_ai() -> int:
    conn = db.get_conn()
    try:
        _table(conn)
        rows = conn.execute("SELECT key, data FROM word_images").fetchall()
        drop_keys = []
        for r in rows:
            try:
                data = json.loads(r["data"])
            except Exception:
                drop_keys.append(r["key"])
                continue
            if not (data.get("image") or {}).get("ai"):
                drop_keys.append(r["key"])
        for k in drop_keys:
            conn.execute("DELETE FROM word_images WHERE key=?", (k,))
        conn.commit()
        return len(drop_keys)
    finally:
        conn.close()


def forget(word: str) -> None:
    _, _, key = _key(word)
    conn = db.get_conn()
    try:
        _table(conn)
        conn.execute("DELETE FROM word_images WHERE key=?", (key,))
        conn.commit()
    finally:
        conn.close()


def _fetch_at(row: dict, key: str, idx: int) -> dict | None:
    cands = row.get("candidates") or []
    while idx < len(cands):
        cand = dict(cands[idx])
        try:
            name = _store(cand.get("url") or cand["full"], f"{key}#{idx}")
            cand["file"] = name
            cand["url"] = f"/api/en/image/file/{name}.webp"
            cand["idx"] = idx
            return cand
        except Exception:
            idx += 1
    return None


def source() -> str:
    return str((settings.get("wordimage") or {}).get("source") or "ai").lower()


def lookup(word: str, query: str = "", force: bool = False) -> dict:
    clean, q, key = _key(word, query)
    if not clean:
        return {"word": word, "image": None, "cached": False}

    mode = "openverse" if force else source()
    if mode != "openverse":
        row = get_cached(key)
        return {"word": clean, "image": (row or {}).get("image"), "cached": True, "left": 0}

    cached = get_cached(key)
    if cached is not None:
        return {
            "word": clean,
            "image": cached.get("image"),
            "cached": True,
            "left": max(0, len(cached.get("candidates") or []) - (cached.get("idx", 0) + 1)),
        }

    try:
        cands = _search(q)
    except Exception:
        return {"word": clean, "image": None, "cached": False, "error": "upstream"}

    row = {"candidates": cands, "idx": 0, "image": None, "rejected": []}
    row["image"] = _fetch_at(row, key, 0)
    if row["image"]:
        row["idx"] = row["image"]["idx"]
    save(key, clean, row)
    return {
        "word": clean,
        "image": row["image"],
        "cached": False,
        "left": max(0, len(cands) - (row["idx"] + 1)),
    }


def advance(word: str, query: str = "") -> dict:
    clean, q, key = _key(word, query)
    row = get_cached(key)
    if not row:
        return lookup(word, query)

    cur = row.get("idx", 0)
    rejected = list(row.get("rejected") or [])
    if row.get("image"):
        rejected.append({"idx": cur, "title": row["image"].get("title", "")})

    nxt = _fetch_at(row, key, cur + 1)
    row["rejected"] = rejected
    row["image"] = nxt
    row["idx"] = nxt["idx"] if nxt else len(row.get("candidates") or [])
    save(key, clean, row)
    return {
        "word": clean,
        "image": nxt,
        "left": max(0, len(row.get("candidates") or []) - (row["idx"] + 1)),
    }


def drop(word: str, query: str = "") -> dict:
    clean, q, key = _key(word, query)
    row = get_cached(key) or {"candidates": [], "idx": 0, "rejected": []}
    row["image"] = None
    row["blocked"] = True
    save(key, clean, row)
    return {"word": clean, "image": None, "left": 0}


def status(word: str, query: str = "") -> dict | None:
    _, _, key = _key(word, query)
    return get_cached(key)


def cached_only(word: str, query: str = "") -> dict | None:
    _, _, key = _key(word, query)
    row = get_cached(key)
    return row.get("image") if row else None
