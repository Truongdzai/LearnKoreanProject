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


_STRESS_PRIMARY = "ˈ"
_STRESS_SECONDARY = "ˌ"
_MIN_PART = 3


def _join(parts: list[tuple[str, str]]) -> tuple[str, str]:
    ipas: list[str] = []
    for n, (ipa, _) in enumerate(parts):
        if n == 0:
            ipas.append(ipa if _STRESS_PRIMARY in ipa else _STRESS_PRIMARY + ipa)
        else:
            ipas.append(ipa.replace(_STRESS_PRIMARY, _STRESS_SECONDARY, 1))
    return "".join(ipas), " ".join(p[1] for p in parts)


def _split_compound(table: dict[str, tuple[str, str]], key: str) -> tuple[str, str] | None:
    best: tuple[int, tuple[str, str]] | None = None
    for cut in range(_MIN_PART, len(key) - _MIN_PART + 1):
        head, tail = key[:cut], key[cut:]
        if head in table and tail in table:
            balance = min(len(head), len(tail))
            if best is None or balance > best[0]:
                best = (balance, _join([table[head], table[tail]]))
    return best[1] if best else None


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
            return _join(parts)

    hit = _split_compound(table, key)
    if hit:
        return hit

    if len(key) > 4 and key.endswith("s") and not key.endswith("ss"):
        base = _entry(table, key[:-1])
        if base:
            tail = "s" if base[1].split()[-1] in ("P", "T", "K", "F", "TH") else "z"
            return base[0] + tail, base[1] + " " + tail.upper()
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
