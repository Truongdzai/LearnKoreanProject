import argparse
import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.services import llm

LANGS = {
    "english": ("en", "English", "tiếng Anh"),
    "korean": ("ko", "Korean", "tiếng Hàn"),
    "chinese": ("zh", "Chinese (Simplified)", "tiếng Trung"),
}

SCHEMA = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "term": {"type": "string"},
                    "def": {"type": "string"},
                    "defVi": {"type": "string"},
                },
                "required": ["term", "def", "defVi"],
            },
        }
    },
    "required": ["items"],
}

SYSTEM = (
    "Bạn là biên tập viên từ điển cho người Việt học ngoại ngữ. "
    "Bạn viết định nghĩa đơn giản, dễ hiểu, đúng nghĩa được yêu cầu."
)

PROMPT = """Viết định nghĩa cho {n} từ {lang_en} dưới đây.

Với mỗi từ, trả về:
- "term": chép lại đúng từ gốc.
- "def": định nghĩa bằng {lang_en}, 1-2 câu hoàn chỉnh, dùng từ vựng ở trình độ A2-B1, giải thích đúng nghĩa tiếng Việt đã cho.
- "defVi": bản dịch tiếng Việt của "def", viết như người Việt nói, không dịch máy word-by-word.

Quy tắc bắt buộc:
- TUYỆT ĐỐI không được chứa chính từ đó hoặc bất kỳ biến thể nào của nó (số nhiều, chia thì, họ hàng từ) trong "def" và "defVi", vì người học phải đoán ra từ này.
- Không mở đầu bằng "This word means" hay "Từ này có nghĩa là". Hãy mô tả trực tiếp sự vật/hành động/tính chất đó, ví dụ: "This is a small, dark spot or mark that appears on someone's skin. Many people have several of these on their body."
- Với danh từ dùng "This is a...", với động từ dùng "You do this when...", với tính chất dùng "Something is like this when...".
- Không dùng dấu ngoặc kép bên trong câu.
- Giữ nguyên thứ tự các từ.

Danh sách:
{items}"""


CJK = re.compile(r"[぀-ヿ㐀-䶿一-鿿가-힯]")


def leak_re(term: str):
    safe = re.escape(term.strip())
    if CJK.search(term):
        return re.compile(safe)
    return re.compile(rf"\b{safe}\w*", re.IGNORECASE)


def scrub(text: str, term: str) -> str:
    return leak_re(term).sub("___", text)


def load(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def save(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def ask(words: list[dict], key: str, lang_en: str) -> dict[str, dict]:
    items = "\n".join(
        f'{i + 1}. {w[key]} ({w["pos"]}) = {w["vi"]} | ví dụ: {w["ex"]}'
        for i, w in enumerate(words)
    )
    prompt = PROMPT.format(n=len(words), lang_en=lang_en, items=items)
    data = llm.gemini_json(prompt, SCHEMA, system=SYSTEM, temperature=0.4)
    out = {}
    for row in data.get("items", []):
        term = str(row.get("term", "")).strip()
        if term:
            out[term.lower()] = {"def": row["def"].strip(), "defVi": row["defVi"].strip()}
    return out


def defs_path(lang: str) -> Path:
    return ROOT / "frontend" / "src" / "data" / lang / "defs.json"


def load_defs(lang: str) -> dict:
    path = defs_path(lang)
    return load(path) if path.exists() else {}


def all_words(lang: str, only: str | None) -> list[dict]:
    units = sorted((ROOT / "frontend" / "src" / "data" / lang / "units").glob("*.json"))
    if only:
        units = [u for u in units if u.stem in only.split(",")]
    out = []
    for path in units:
        for w in load(path).get("words", []):
            out.append(w)
    return out


def run(lang: str, batch: int, retries: int, only: str | None, force: bool) -> None:
    key, lang_en, _ = LANGS[lang]
    defs = load_defs(lang)
    words = [w for w in all_words(lang, only) if w.get(key)]
    todo = [w for w in words if force or not defs.get(w[key])]

    if not todo:
        print(f"[{lang}] đã đủ định nghĩa cho {len(words)} từ")
        return

    print(f"[{lang}] {len(todo)}/{len(words)} từ cần định nghĩa", flush=True)
    filled = 0
    leaks = 0
    for start in range(0, len(todo), batch):
        chunk = todo[start:start + batch]
        got = {}
        for attempt in range(retries):
            try:
                got = ask(chunk, key, lang_en)
                break
            except Exception as exc:
                wait = 5 * (attempt + 1)
                print(f"  lỗi ({type(exc).__name__}: {exc}) — thử lại sau {wait}s", flush=True)
                time.sleep(wait)
        for w in chunk:
            hit = got.get(w[key].strip().lower())
            if not hit:
                continue
            term = w[key]
            if leak_re(term).search(hit["def"]):
                leaks += 1
            defs[term] = {"def": scrub(hit["def"], term), "defVi": scrub(hit["defVi"], term)}
            filled += 1
        save(defs_path(lang), defs)
        print(f"  {filled}/{len(todo)}", flush=True)
        time.sleep(1.5)

    if leaks:
        print(f"  che {leaks} định nghĩa bị lộ từ khoá", flush=True)
    left = [w[key] for w in words if not defs.get(w[key])]
    if left:
        print(f"  còn thiếu {len(left)} từ: {', '.join(left[:8])}", flush=True)


def fix_leaks(lang: str) -> None:
    key, lang_en, _ = LANGS[lang]
    defs = load_defs(lang)
    words = [w for w in all_words(lang, None) if w.get(key) and defs.get(w[key])]

    bad = [
        w for w in words
        if leak_re(w[key]).search(defs[w[key]].get("def", ""))
        or leak_re(w[key]).search(defs[w[key]].get("defVi", ""))
    ]
    if not bad:
        print(f"[{lang}] không có định nghĩa nào lộ từ khoá")
        return

    print(f"[{lang}] {len(bad)} định nghĩa bị lộ từ khoá", flush=True)
    try:
        got = ask(bad, key, lang_en)
    except Exception as exc:
        print(f"  không sinh lại được ({type(exc).__name__}: {exc})", flush=True)
        got = {}

    for w in bad:
        term = w[key]
        hit = got.get(term.strip().lower())
        if hit and not leak_re(term).search(hit["def"]):
            defs[term] = {"def": hit["def"], "defVi": scrub(hit["defVi"], term)}
            print(f"  {term}: sinh lại sạch", flush=True)
            continue
        source = hit or defs[term]
        if len(term.strip()) > 1:
            defs[term] = {
                "def": scrub(source.get("def", ""), term),
                "defVi": scrub(source.get("defVi", ""), term),
            }
            print(f"  {term}: che chỗ lộ", flush=True)
        else:
            defs[term] = {"defVi": scrub(source.get("defVi", ""), term)}
            print(f"  {term}: bỏ định nghĩa {lang_en}, giữ định nghĩa tiếng Việt", flush=True)

    save(defs_path(lang), defs)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="english", choices=[*LANGS, "all"])
    ap.add_argument("--batch", type=int, default=20)
    ap.add_argument("--retries", type=int, default=3)
    ap.add_argument("--only", default=None)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--fix-leaks", action="store_true")
    args = ap.parse_args()

    langs = list(LANGS) if args.lang == "all" else [args.lang]
    for lang in langs:
        if args.fix_leaks:
            fix_leaks(lang)
        else:
            run(lang, args.batch, args.retries, args.only, args.force)


if __name__ == "__main__":
    main()
