from __future__ import annotations

import gzip
import re
from pathlib import Path

from .logs import log

DATA = Path(__file__).resolve().parents[1] / "data" / "ipa_en.txt.gz"
MAX_WORDS = 600

_table: dict[str, tuple[str, str]] | None = None
_missing = False

_STRIP = re.compile(r"^[^a-z']+|[^a-z']+$")


def _load() -> dict[str, tuple[str, str]]:
    global _table, _missing
    if _table is not None or _missing:
        return _table or {}
    try:
        table: dict[str, tuple[str, str]] = {}
        with gzip.open(DATA, "rt", encoding="utf-8") as f:
            for line in f:
                parts = line.rstrip("\n").split("\t")
                if len(parts) == 3:
                    table[parts[0]] = (parts[1], parts[2])
        _table = table
        log(f"[phonetics] Nap {len(table)} tu IPA tieng Anh.")
    except Exception as e:
        _missing = True
        log(f"[phonetics] Khong doc duoc {DATA.name} ({e}) — bo qua phien am tieng Anh.")
    return _table or {}


def available() -> bool:
    return bool(_load())


def _norm(word: str) -> str:
    return _STRIP.sub("", (word or "").lower().replace("’", "'"))


def _entry(table: dict[str, tuple[str, str]], key: str) -> tuple[str, str] | None:
    if key in table:
        return table[key]
    if key.endswith("'s") and key[:-2] in table:
        base = table[key[:-2]]
        tail = "s" if base[1].split()[-1] in ("P", "T", "K", "F", "TH") else "z"
        return base[0] + tail, base[1] + " " + tail.upper()
    if "-" in key:
        parts = [table[p] for p in key.split("-") if p in table]
        if len(parts) == len(key.split("-")):
            return "".join(p[0] for p in parts), " ".join(p[1] for p in parts)
    return None


def readings(words: list[str]) -> dict[str, dict[str, str]]:
    table = _load()
    if not table:
        return {}
    out: dict[str, dict[str, str]] = {}
    for raw in words[:MAX_WORDS]:
        key = _norm(raw)
        if not key or raw in out:
            continue
        hit = _entry(table, key)
        if hit:
            out[raw] = {"ipa": hit[0], "ph": hit[1]}
    return out


_VOWELS = {"AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY",
           "OW", "OY", "UH", "UW"}


def is_vowel(phone: str) -> bool:
    return phone in _VOWELS
