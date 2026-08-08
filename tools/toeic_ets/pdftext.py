import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "TailieuToeic"
LC_DIR = SRC / "KEY VÀ GIẢI THÍCH CHI TIẾT"
RC_DIR = LC_DIR
AUDIO_DIR = SRC / "AUDIO"

HEADER_LC = re.compile(r"ETS\s+20\d\d\s+LISTENING\s+TEST(\s+SCRIPT\s+AND\s+KEY)?")
HEADER_RC = re.compile(r"ETS\s+20\d\d\s+READING\s+TEST")
PAGE_NO = re.compile(r"^\s*\d{1,3}\s*$")

def lc_pdf(test: int) -> Path:
    return LC_DIR / f"ETS 2026 LISTENING TEST {test} (SCRIPT AND KEY).pdf"

def rc_pdf(test: int) -> Path:
    return RC_DIR / f"ETS 2026 READING TEST {test}- KEY.pdf"

def audio_dir(test: int) -> Path:
    return AUDIO_DIR / f"Test {test}"

def _clean_page(raw: str, header: re.Pattern) -> str:
    txt = header.sub(" ", raw or "")
    lines = [ln for ln in txt.split("\n") if not PAGE_NO.match(ln)]
    txt = "\n".join(lines)
    txt = txt.replace("ﬁ", "fi").replace("ﬂ", "fl")
    txt = txt.replace("’", "'").replace("‘", "'")
    txt = txt.replace("“", '"').replace("”", '"')
    txt = re.sub(r"[ \t]+", " ", txt)
    return txt

def page_texts(path: Path, kind: str) -> list[str]:
    header = HEADER_LC if kind == "lc" else HEADER_RC
    reader = PdfReader(str(path))
    return [_clean_page(p.extract_text() or "", header) for p in reader.pages]

def full_text(path: Path, kind: str) -> str:
    return "\n".join(page_texts(path, kind))
