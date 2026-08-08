from __future__ import annotations

import gzip
import sys
from pathlib import Path

import cmudict

OUT = Path(__file__).resolve().parents[1] / "backend" / "data" / "ipa_en.txt.gz"

ARPA_IPA = {
    "AA": "ɑ", "AE": "æ", "AH": "ʌ", "AO": "ɔ", "AW": "aʊ", "AY": "aɪ",
    "EH": "ɛ", "ER": "ɜr", "EY": "eɪ", "IH": "ɪ", "IY": "iː", "OW": "oʊ",
    "OY": "ɔɪ", "UH": "ʊ", "UW": "uː",
    "B": "b", "CH": "tʃ", "D": "d", "DH": "ð", "F": "f", "G": "ɡ", "HH": "h",
    "JH": "dʒ", "K": "k", "L": "l", "M": "m", "N": "n", "NG": "ŋ", "P": "p",
    "R": "r", "S": "s", "SH": "ʃ", "T": "t", "TH": "θ", "V": "v", "W": "w",
    "Y": "j", "Z": "z", "ZH": "ʒ",
}

VOWELS = {"AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY",
          "OW", "OY", "UH", "UW"}

ONSETS = {
    "pr", "br", "tr", "dr", "kr", "ɡr", "fr", "θr", "ʃr",
    "pl", "bl", "kl", "ɡl", "fl", "sl",
    "sp", "st", "sk", "sm", "sn", "sw", "spr", "str", "skr", "spl",
    "tw", "dw", "kw", "ɡw", "θw", "hw",
    "pj", "bj", "kj", "fj", "vj", "mj", "hj",
}


def convert(phones: list[str]) -> tuple[str, str]:
    plain: list[str] = []
    stress: list[int] = []
    for p in phones:
        base = p.rstrip("012")
        mark = 0
        if p[-1].isdigit():
            mark = int(p[-1])
        if base == "AH" and mark == 0:
            sym = "ə"
        elif base == "ER" and mark == 0:
            sym = "ər"
        elif base == "IY" and mark == 0:
            sym = "i"
        elif base == "UW" and mark == 0:
            sym = "u"
        else:
            sym = ARPA_IPA.get(base, base.lower())
        plain.append(sym)
        stress.append(mark if base in VOWELS else -1)

    syllables = sum(1 for s in stress if s >= 0)
    out: list[str] = []
    for idx, sym in enumerate(plain):
        if stress[idx] in (1, 2) and syllables > 1:
            mark = "ˈ" if stress[idx] == 1 else "ˌ"
            back = 0
            while back < 3 and idx - back - 1 >= 0 and stress[idx - back - 1] == -1:
                cluster = "".join(plain[idx - back - 1: idx])
                if back and cluster not in ONSETS:
                    break
                back += 1
            pos = len(out) - back
            out.insert(pos, mark)
        out.append(sym)
    ipa = "".join(out)
    arpa = " ".join(p.rstrip("012") for p in phones)
    return ipa, arpa


def main() -> None:
    entries = cmudict.dict()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    rows = 0
    with gzip.open(OUT, "wt", encoding="utf-8", compresslevel=9) as f:
        for word in sorted(entries):
            if not word.replace("'", "").replace("-", "").replace(".", "").isalpha():
                continue
            ipa, arpa = convert(entries[word][0])
            if not ipa:
                continue
            f.write(f"{word}\t{ipa}\t{arpa}\n")
            rows += 1
    size = OUT.stat().st_size
    print(f"{rows} từ → {OUT} ({size / 1024:.0f} KB)", file=sys.stderr)


if __name__ == "__main__":
    main()
