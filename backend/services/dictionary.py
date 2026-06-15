from __future__ import annotations

import html
import json
import re
import zipfile
from pathlib import Path

from ..config import ROOT
from .. import db

DICT_ZIP = ROOT / "dictionaries" / "KO-VI.KRDICT.zip"

_HANJA_RE = re.compile(r"〔(.+?)〕")
_WS_RE = re.compile(r"\s+")

def _collect_text(node, *, skip_details: bool = True) -> str:
    if node is None:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return " ".join(_collect_text(n, skip_details=skip_details) for n in node)
    if isinstance(node, dict):
        if skip_details and node.get("tag") == "details":
            return ""
        return _collect_text(node.get("content"), skip_details=skip_details)
    return ""

def _parse_definition(sc: dict) -> str:
    content = sc.get("content")
    if isinstance(content, list) and content:
        body = content[1:] if len(content) > 1 else content
    else:
        body = content
    text = _collect_text(body)
    text = html.unescape(text)
    return _WS_RE.sub(" ", text).strip()

def _parse_row(row: list) -> dict | None:
    term = row[0]
    if not term:
        return None
    pos = (row[2] or "").strip()
    defs = row[5] if len(row) > 5 else []
    hanja = ""
    meanings: list[str] = []
    for d in defs or []:
        if isinstance(d, dict) and d.get("type") == "structured-content":
            if not hanja:
                head = _collect_text(d.get("content"), skip_details=True)
                m = _HANJA_RE.search(head)
                if m:
                    hanja = m.group(1).strip()
            meaning = _parse_definition(d)
            if meaning:
                meanings.append(meaning)
        elif isinstance(d, str):
            meanings.append(d)
    meaning = " / ".join(meanings).strip()
    if not meaning:
        return None
    meaning = _HANJA_RE.sub("", meaning).strip(" /·")
    return {"term": term, "hanja": hanja, "pos": pos, "meaning": meaning}

_SCHEMA = """
CREATE TABLE IF NOT EXISTS dict_entries (
    term    TEXT NOT NULL,
    hanja   TEXT,
    pos     TEXT,
    meaning TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_dict_term ON dict_entries(term);
"""

def count() -> int:
    conn = db.get_conn()
    try:
        cur = conn.execute("SELECT COUNT(*) AS n FROM dict_entries")
        return cur.fetchone()["n"]
    except Exception:
        return 0
    finally:
        conn.close()

def import_zip(zip_path: Path | None = None) -> int:
    zip_path = Path(zip_path or DICT_ZIP)
    if not zip_path.exists():
        raise FileNotFoundError(f"Không thấy từ điển: {zip_path}")

    rows: list[tuple] = []
    with zipfile.ZipFile(zip_path) as z:
        banks = sorted(n for n in z.namelist() if n.startswith("term_bank"))
        for name in banks:
            for raw in json.loads(z.read(name)):
                parsed = _parse_row(raw)
                if parsed:
                    rows.append((parsed["term"], parsed["hanja"], parsed["pos"], parsed["meaning"]))

    conn = db.get_conn()
    try:
        conn.executescript(_SCHEMA)
        conn.execute("DELETE FROM dict_entries")
        conn.executemany(
            "INSERT INTO dict_entries (term, hanja, pos, meaning) VALUES (?,?,?,?)", rows
        )
        conn.commit()
    finally:
        conn.close()
    return len(rows)

def ensure_imported() -> None:
    conn = db.get_conn()
    try:
        conn.executescript(_SCHEMA)
        conn.commit()
    finally:
        conn.close()
    if count() == 0 and DICT_ZIP.exists():
        try:
            import_zip()
        except Exception:
            pass

_PARTICLES = [
    "으로서", "으로써", "에서는", "에게서", "이라고", "라고", "에서", "에게", "한테",
    "까지", "부터", "처럼", "보다", "마다", "조차", "밖에", "으로", "이나", "나",
    "은", "는", "이", "가", "을", "를", "에", "와", "과", "도", "만", "요", "의",
]
_VERB_ENDINGS = [
    "하셨습니다", "으십니다", "으세요", "십니다", "십시오", "하세요", "했습니다",
    "습니다", "ㅂ니다", "했어요", "았어요", "었어요", "거든요", "는데요", "은데요",
    "네요", "세요", "지만", "는데", "은데", "여요", "해요", "아요", "어요", "해서",
    "해", "한", "하는", "하고", "하지", "하다",
]

_HADA_ENDINGS = [
    "하셨습니다", "하십니다", "하세요", "했습니다", "합니다", "했어요", "해요",
    "하는", "하고", "하지", "해서", "해", "함", "한",
]

def _candidates(word: str) -> list[str]:
    word = word.strip()
    out = [word]
    for p in _PARTICLES:
        if word.endswith(p) and len(word) > len(p):
            out.append(word[: -len(p)])
    for e in _HADA_ENDINGS:
        if word.endswith(e) and len(word) > len(e):
            out.append(word[: -len(e)] + "하다")
    for e in _VERB_ENDINGS:
        if word.endswith(e) and len(word) > len(e):
            stem = word[: -len(e)]
            out.append(stem + "다")
            out.append(stem)
    seen, uniq = set(), []
    for w in out:
        if w and w not in seen:
            seen.add(w)
            uniq.append(w)
    return uniq

def _fetch(conn, term: str) -> list[dict]:
    cur = conn.execute(
        "SELECT term, hanja, pos, meaning FROM dict_entries WHERE term = ? LIMIT 8", (term,)
    )
    return [dict(r) for r in cur.fetchall()]

def lookup(word: str) -> dict:
    word = (word or "").strip()
    word = word.strip(" .,!?\"'()[]{}…·~—-、。！？​")
    if not word:
        return {"word": word, "matched": "none", "entries": []}

    conn = db.get_conn()
    try:
        entries = _fetch(conn, word)
        if entries:
            return {"word": word, "matched": "exact", "entries": entries}
        for cand in _candidates(word)[1:]:
            entries = _fetch(conn, cand)
            if entries:
                return {"word": cand, "matched": "base", "entries": entries}
    finally:
        conn.close()
    return {"word": word, "matched": "none", "entries": []}
