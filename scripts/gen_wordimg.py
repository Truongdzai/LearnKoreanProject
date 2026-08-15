from __future__ import annotations

import argparse
import base64
import io
import json
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

from PIL import Image, ImageDraw  # noqa: E402

from backend.config import settings  # noqa: E402
from backend.services import wordimg  # noqa: E402

UNITS = ROOT / "frontend" / "src" / "data" / "english" / "units"
OUT_DIR = ROOT / "frontend" / "public" / "wordimg"
LIST_PATH = ROOT / "frontend" / "src" / "data" / "english" / "wordImages.json"
SCENE_PATH = ROOT / "scripts" / "wordscenes.json"

WIDTH = 480
GEN_SIZE = 512
QUALITY = 86

TOGETHER_URL = "https://api.together.xyz/v1/images/generations"
TOGETHER_MODELS_URL = "https://api.together.xyz/v1/models"
TOGETHER_PREFER = ("flux.1-schnell-free", "flux.1-schnell", "flux-1-schnell")

CF_BASE = "https://api.cloudflare.com/client/v4"
CF_MODEL = "@cf/black-forest-labs/flux-1-schnell"

POLLINATIONS = "https://image.pollinations.ai/prompt/"

POS_ORDER = ["adj", "adverb", "verb", "prep", "noun", "phrase", "question"]

QUOTA_HINTS = ("exceed", "quota", "daily", "neuron", "3036")

_lock = threading.Lock()
_last_call = [0.0]
_stop = threading.Event()


def load_words() -> dict[str, tuple[str, str]]:
    out: dict[str, tuple[str, str]] = {}
    for f in sorted(UNITS.glob("*.json")):
        for w in json.loads(f.read_text(encoding="utf-8")).get("words") or []:
            term = (w.get("en") or "").strip().lower()
            if term and term not in out:
                out[term] = (w.get("vi") or "", w.get("pos") or "noun")
    return out


def listed() -> list[str]:
    try:
        data = json.loads(LIST_PATH.read_text(encoding="utf-8"))
    except Exception:
        return []
    return [str(w).strip().lower() for w in (data.get("words") or []) if str(w).strip()]


def on_disk() -> set[str]:
    if not OUT_DIR.exists():
        return set()
    return {p.stem.lower() for p in OUT_DIR.glob("*.webp")}


def update_list() -> int:
    words = sorted(on_disk())
    data = {
        "version": 1,
        "note": "Danh sach tu da co anh trong frontend/public/wordimg/<tu>.webp",
        "words": words,
    }
    LIST_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(words)


SCENE_SYSTEM = (
    "You write one-sentence visual briefs for children's vocabulary flashcards. "
    "For each English word you return one short English sentence describing a concrete scene "
    "that makes the MEANING unmistakable to someone who does not speak English. "
    "Hard rules: never write the word itself or any other word inside the picture; never describe "
    "signs, labels, captions, price tags, receipts, screens, numbers, digits, clock faces or open "
    "books with writing on them, because the drawing must stay completely wordless. This bans a "
    "whole family of props that always drag writing into the picture: calendars, newspapers, "
    "letters being read, banners, finish lines, scoreboards, shop signs, medals or podiums with a "
    "place number, posters and certificates. Choose a different way to show the idea instead. "
    "Never draw "
    "something that "
    "merely sounds like the word or shares its spelling (for 'big' never Big Ben, for 'hot' never a "
    "hot dog, for 'fast' never fast food); keep it drawable as simple flat clipart with one clear "
    "subject. The audience is adult learners, so draw ordinary adult life plainly when the word "
    "calls for it: alcohol, cigarettes, weapons, illness, hospitals, funerals, crime, arguments and "
    "injury are all fine as cartoon drawings, and dodging them gives a wrong picture. Keep it "
    "non-explicit: no nudity, no sexual content, no graphic gore. "
    "Nouns: show the thing itself. Verbs: a person caught in the middle of the action. "
    "Adjectives and adverbs: a scene where that quality or manner is the most obvious thing. "
    "Prepositions: two simple objects in exactly that spatial relation. "
    "Phrases: one everyday situation where people would say it. "
    "Maximum 22 words per sentence, no quotation marks."
)

SCENE_SCHEMA = {
    "type": "object",
    "properties": {
        "scenes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {"word": {"type": "string"}, "scene": {"type": "string"}},
                "required": ["word", "scene"],
            },
        }
    },
    "required": ["scenes"],
}


def load_scenes() -> dict[str, str]:
    try:
        data = json.loads(SCENE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}
    return {str(k).lower(): str(v) for k, v in (data.get("scenes") or {}).items() if v}


def save_scenes(scenes: dict[str, str]) -> None:
    data = {
        "version": 1,
        "note": "Cau ta canh cho tung tu, dung lam prompt ve anh trong scripts/gen_wordimg.py",
        "scenes": dict(sorted(scenes.items())),
    }
    SCENE_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


RETRY_NOTE = (
    "\n\nIMPORTANT: an earlier brief for every one of these words produced a picture with writing "
    "in it. Pick completely different props this time — objects that physically cannot carry text, "
    "such as animals, food, tools, weather, body language or plain geometric shapes."
)


def make_scenes(
    need: list[str],
    words: dict[str, tuple[str, str]],
    scenes: dict[str, str],
    retry: bool = False,
) -> int:
    from backend.services import llm

    added = 0
    for i in range(0, len(need), 40):
        chunk = need[i: i + 40]
        lines = "\n".join(f"- {w} ({words[w][1]}) = {words[w][0]}" for w in chunk)
        prompt = f"Write one visual brief for each of these English words:\n{lines}"
        if retry:
            prompt += RETRY_NOTE
        try:
            out = llm.gemini_json(prompt, SCENE_SCHEMA, system=SCENE_SYSTEM, temperature=0.6)
        except Exception as exc:
            print(f"  Khong viet duoc canh cho {len(chunk)} tu: {str(exc)[:140]}")
            continue
        for row in out.get("scenes") or []:
            word = str(row.get("word") or "").strip().lower()
            scene = str(row.get("scene") or "").strip()
            if word in words and scene:
                scenes[word] = scene
                added += 1
        save_scenes(scenes)
        print(f"  Da viet canh cho {min(i + 40, len(need))}/{len(need)} tu")
    return added


USAGE_PATH = ROOT / "scripts" / "wordimg_usage.json"

FREE_NEURONS = 10000
NEURON_PER_TILE = 4.8
NEURON_PER_STEP = 9.6
NEURON_SAFETY = 1.25
USD_PER_NEURON = 0.011 / 1000


def utc_day() -> str:
    return time.strftime("%Y-%m-%d", time.gmtime())


def neurons_per_image(steps: int, size: int) -> float:
    tiles = max(1, -(-size // 512)) ** 2
    return (tiles * NEURON_PER_TILE + steps * NEURON_PER_STEP) * NEURON_SAFETY


def usage_today() -> float:
    try:
        data = json.loads(USAGE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return 0.0
    return float((data.get("days") or {}).get(utc_day()) or 0.0)


def overage_spent() -> float:
    try:
        data = json.loads(USAGE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return 0.0
    return float(data.get("overage_neurons") or 0.0)


_usage_lock = threading.Lock()


def add_usage(neurons: float) -> float:
    with _usage_lock:
        return _add_usage(neurons)


def _add_usage(neurons: float) -> float:
    try:
        data = json.loads(USAGE_PATH.read_text(encoding="utf-8"))
    except Exception:
        data = {"version": 1, "days": {}}
    days = data.setdefault("days", {})
    day = utc_day()
    before = float(days.get(day) or 0.0)
    after = before + neurons
    days[day] = round(after, 1)
    billed = max(0.0, after - FREE_NEURONS) - max(0.0, before - FREE_NEURONS)
    if billed > 0:
        data["overage_neurons"] = round(float(data.get("overage_neurons") or 0.0) + billed, 1)
    data["overage_usd"] = round(float(data.get("overage_neurons") or 0.0) * USD_PER_NEURON, 4)
    data["days"] = {k: v for k, v in sorted(days.items())[-30:]}
    USAGE_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return days[day]


AUDIT_PATH = ROOT / "scripts" / "wordimg_audit.json"

AUDIT_SYSTEM = (
    "You inspect illustrations for a children's vocabulary flashcard app. "
    "You receive a numbered word list and then the images in exactly that order. "
    "For each image report: has_text = true when ANY letters, words, numbers or digits are visible "
    "anywhere in the picture, even tiny, blurred, misspelled or on a sign, tag, book or screen; "
    "matches = true whenever a learner who is told the meaning would accept the picture as a "
    "reasonable illustration of it. Be generous here: a picture only fails when it plainly shows "
    "something else, when it is so vague it would fit almost any word, or when it illustrates a "
    "different sense of the word than the given meaning. A simple, plain or unexciting picture that "
    "still fits the meaning passes. "
    "note = at most twelve Vietnamese words saying what is wrong, empty when the image is fine."
)

AUDIT_SCHEMA = {
    "type": "object",
    "properties": {
        "results": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "word": {"type": "string"},
                    "has_text": {"type": "boolean"},
                    "matches": {"type": "boolean"},
                    "note": {"type": "string"},
                },
                "required": ["word", "has_text", "matches", "note"],
            },
        }
    },
    "required": ["results"],
}


def audit(words: dict[str, tuple[str, str]], batch: list[str], group: int) -> dict[str, dict]:
    from backend.services import llm

    try:
        out = json.loads(AUDIT_PATH.read_text(encoding="utf-8")).get("images") or {}
    except Exception:
        out = {}

    for i in range(0, len(batch), group):
        chunk = batch[i: i + group]
        images = [((OUT_DIR / f"{file_name(w)}.webp").read_bytes(), "image/webp") for w in chunk]
        lines = "\n".join(f"{n + 1}. {w} = {words.get(w, ('', ''))[0]}" for n, w in enumerate(chunk))
        prompt = f"Check these {len(chunk)} flashcard images:\n{lines}"
        try:
            res = llm.gemini_vision_json(prompt, images, AUDIT_SCHEMA, system=AUDIT_SYSTEM)
        except Exception as exc:
            print(f"  Khong soi duoc {len(chunk)} anh: {str(exc)[:140]}")
            continue
        for row in res.get("results") or []:
            word = str(row.get("word") or "").strip().lower()
            if word in words:
                out[word] = {
                    "has_text": bool(row.get("has_text")),
                    "matches": bool(row.get("matches")),
                    "note": str(row.get("note") or "").strip(),
                }
        AUDIT_PATH.write_text(
            json.dumps({"version": 1, "images": dict(sorted(out.items()))}, ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
        print(f"  Da soi {min(i + group, len(batch))}/{len(batch)} anh")
    return out


def together_key() -> str:
    key = (os.environ.get("TOGETHER_API_KEY") or "").strip()
    if key:
        return key
    return str((settings.get("together") or {}).get("api_key") or "").strip()


def together_models(key: str) -> list[str]:
    req = urllib.request.Request(
        TOGETHER_MODELS_URL,
        headers={"Authorization": f"Bearer {key}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=40) as res:
        data = json.loads(res.read().decode("utf-8", "replace"))
    rows = data if isinstance(data, list) else data.get("data") or []
    return [str(m.get("id") or "") for m in rows if (m.get("type") or "") == "image"]


def pick_model(key: str, wanted: str = "") -> str:
    if wanted:
        return wanted
    try:
        ids = together_models(key)
    except Exception:
        return "black-forest-labs/FLUX.1-schnell-Free"
    for tag in TOGETHER_PREFER:
        for mid in ids:
            if tag in mid.lower():
                return mid
    return ids[0] if ids else "black-forest-labs/FLUX.1-schnell-Free"


def cf_creds() -> tuple[str, str]:
    cfg = settings.get("cloudflare") or {}
    account = (os.environ.get("CLOUDFLARE_ACCOUNT_ID") or "").strip() or str(cfg.get("account_id") or "").strip()
    token = (os.environ.get("CLOUDFLARE_API_TOKEN") or "").strip() or str(cfg.get("api_token") or "").strip()
    return account, token


def cf_accounts(token: str) -> list[tuple[str, str]]:
    req = urllib.request.Request(
        f"{CF_BASE}/accounts",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=40) as res:
        data = json.loads(res.read().decode("utf-8", "replace"))
    return [(str(a.get("id") or ""), str(a.get("name") or "")) for a in (data.get("result") or [])]


def gen_cloudflare(prompt: str, account: str, token: str, model: str, steps: int, size: int = 0) -> bytes:
    payload: dict = {"prompt": prompt, "steps": max(1, min(8, steps))}
    if size:
        payload["width"] = size
        payload["height"] = size
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{CF_BASE}/accounts/{account}/ai/run/{model}",
        data=body,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as res:
            kind = (res.headers.get("Content-Type") or "").lower()
            raw = res.read(12_000_000)
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"HTTP {exc.code}: {detail}") from None
    if "json" not in kind:
        return raw
    data = json.loads(raw.decode("utf-8", "replace"))
    if not data.get("success", True):
        errs = "; ".join(str(e.get("message") or e) for e in (data.get("errors") or []))
        raise RuntimeError(errs or "cloudflare tu choi")
    img = (data.get("result") or {}).get("image")
    if not img:
        raise RuntimeError("phan hoi khong co anh")
    return base64.b64decode(img)


def out_of_quota(msg: str) -> bool:
    low = msg.lower()
    return any(h in low for h in QUOTA_HINTS)


def throttle(delay: float) -> None:
    if delay <= 0:
        return
    with _lock:
        wait = _last_call[0] + delay - time.monotonic()
        if wait > 0:
            time.sleep(wait)
        _last_call[0] = time.monotonic()


def fetch_url(url: str, timeout: int = 90) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read(12_000_000)


def gen_together(prompt: str, key: str, model: str, steps: int) -> bytes:
    body = json.dumps(
        {
            "model": model,
            "prompt": prompt,
            "width": GEN_SIZE,
            "height": GEN_SIZE,
            "steps": steps,
            "n": 1,
            "response_format": "base64",
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        TOGETHER_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=180) as res:
        data = json.loads(res.read().decode("utf-8", "replace"))
    items = data.get("data") or []
    if not items:
        raise RuntimeError("phan hoi khong co anh")
    first = items[0]
    if first.get("b64_json"):
        return base64.b64decode(first["b64_json"])
    if first.get("url"):
        return fetch_url(first["url"])
    raise RuntimeError("phan hoi khong co anh")


def gen_pollinations(prompt: str, seed: int) -> bytes:
    url = (
        POLLINATIONS
        + urllib.parse.quote(prompt)
        + f"?width={GEN_SIZE}&height={GEN_SIZE}&nologo=true&seed={seed}"
    )
    return fetch_url(url, timeout=180)


def file_name(word: str) -> str:
    return re.sub(r'[?:/\\*"<>|]', "", word).strip()


def save_webp(raw: bytes, word: str) -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    im = Image.open(io.BytesIO(raw))
    im = im.convert("RGBA" if "A" in im.getbands() or im.mode == "P" else "RGB")
    if im.width > WIDTH:
        im = im.resize((WIDTH, max(1, round(im.height * WIDTH / im.width))), Image.LANCZOS)
    out = OUT_DIR / f"{file_name(word)}.webp"
    im.save(out, "WEBP", quality=QUALITY, method=5)
    return out.stat().st_size


def pick_words(args, words: dict[str, tuple[str, str]]) -> list[str]:
    have = on_disk()
    skip = {w for w, s in load_scenes().items() if s.strip().lower() == "skip"}
    pool = [w for w in words if (args.force or file_name(w) not in have) and w not in skip]
    if args.only:
        pick = {x.strip().lower() for x in args.only.split(",") if x.strip()}
        return [w for w in words if w in pick]
    if args.pos:
        keep = {p.strip() for p in args.pos.split(",") if p.strip()}
        pool = [w for w in pool if words[w][1] in keep]
    else:
        rank = {p: i for i, p in enumerate(POS_ORDER)}
        pool.sort(key=lambda w: (rank.get(words[w][1], 99), w))
    return pool[args.skip: args.skip + args.limit]


def sheet(words: list[str], out_path: Path, meta: dict[str, tuple[str, str]]) -> None:
    cells = [w for w in words if (OUT_DIR / f"{file_name(w)}.webp").exists()]
    if not cells:
        print("Chua co anh nao de ghep bang.")
        return
    cols = min(6, len(cells))
    rows = (len(cells) + cols - 1) // cols
    cell, lab = 200, 34
    canvas = Image.new("RGB", (cols * cell, rows * (cell + lab)), (255, 255, 255))
    dr = ImageDraw.Draw(canvas)
    for i, w in enumerate(cells):
        x, y = (i % cols) * cell, (i // cols) * (cell + lab)
        im = Image.open(OUT_DIR / f"{file_name(w)}.webp").convert("RGBA")
        im.thumbnail((cell - 14, cell - 14), Image.LANCZOS)
        plate = Image.new("RGBA", (cell - 14, cell - 14), (255, 255, 255, 255))
        plate.paste(im, ((plate.width - im.width) // 2, (plate.height - im.height) // 2), im)
        canvas.paste(plate.convert("RGB"), (x + 7, y + 7))
        dr.rectangle([x, y, x + cell - 1, y + cell + lab - 1], outline=(205, 205, 205))
        vi, pos = meta.get(w, ("", ""))
        dr.text((x + 7, y + cell + 4), f"{i + 1}. {w} ({pos})", fill=(15, 15, 15))
        dr.text((x + 7, y + cell + 18), vi[:30], fill=(110, 110, 110))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG")
    print(f"Da ghep {len(cells)} anh vao {out_path}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Sinh anh minh hoa cho tu vung tieng Anh.")
    ap.add_argument("--provider", default="cloudflare", choices=["cloudflare", "together", "pollinations"])
    ap.add_argument("--model", default="", help="ID model, de trong thi dung ban mac dinh cua nha cung cap")
    ap.add_argument("--steps", type=int, default=2)
    ap.add_argument("--size", type=int, default=0, help="Canh anh goc, vi du 512. De 0 thi dung mac dinh cua model")
    ap.add_argument("--budget", type=float, default=FREE_NEURONS, help="Tran neuron mien phi trong ngay")
    ap.add_argument("--overage-usd", type=float, default=0.0, help="Tran tien that duoc phep tieu, tinh bang USD")
    ap.add_argument("--limit", type=int, default=25)
    ap.add_argument("--skip", type=int, default=0)
    ap.add_argument("--pos", default="", help="Loc theo tu loai: adj,adverb,verb,noun,prep,phrase")
    ap.add_argument("--only", default="", help="Chi lam cac tu nay, cach nhau dau phay")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--delay", type=float, default=1.2, help="Giay toi thieu giua hai lan goi")
    ap.add_argument("--retries", type=int, default=4)
    ap.add_argument("--force", action="store_true", help="Ve lai ca nhung tu da co anh")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--sheet", type=Path, help="Ghep anh cua me nay thanh 1 file PNG de duyet")
    ap.add_argument("--list-models", action="store_true")
    ap.add_argument("--check", action="store_true", help="Kiem tra khoa Cloudflare va lay account_id")
    ap.add_argument("--scenes-only", action="store_true", help="Chi viet cau ta canh, chua ve anh")
    ap.add_argument("--no-scenes", action="store_true", help="Ve thang tu ten tu, khong qua tang ta canh")
    ap.add_argument("--rebuild-list", action="store_true", help="Chi quet lai thu muc va cap nhat wordImages.json")
    ap.add_argument("--review", type=Path, help="Ghep bang anh tu nhung file da co san tren dia")
    ap.add_argument("--audit", action="store_true", help="Nho Gemini soi anh: co chu khong, co dung nghia khong")
    ap.add_argument("--group", type=int, default=6, help="So anh gui Gemini soi moi lan")
    ap.add_argument("--fix", action="store_true", help="Viet lai canh va ve lai nhung anh bi soi thay co chu")
    args = ap.parse_args()

    if args.rebuild_list:
        print(f"wordImages.json: {update_list()} tu")
        return 0

    if args.review:
        meta = load_words()
        have = sorted(on_disk())
        if args.only:
            pick = [x.strip().lower() for x in args.only.split(",") if x.strip()]
            have = [w for w in pick if w in set(have)]
        sheet(have[args.skip: args.skip + args.limit], args.review, meta)
        return 0

    if args.audit:
        meta = load_words()
        have = sorted(w for w in on_disk() if w in meta)
        if args.only:
            pick = {x.strip().lower() for x in args.only.split(",") if x.strip()}
            have = [w for w in have if w in pick]
        elif not args.force:
            try:
                seen = json.loads(AUDIT_PATH.read_text(encoding="utf-8")).get("images") or {}
            except Exception:
                seen = {}
            have = [w for w in have if w not in seen]
        have = have[args.skip: args.skip + args.limit]
        if not have:
            print("Khong con anh nao can soi.")
            return 0
        print(f"Soi {len(have)} anh bang Gemini...")
        out = audit(meta, have, args.group)
        bad_text = [w for w in have if out.get(w, {}).get("has_text")]
        bad_mean = [w for w in have if w in out and not out[w]["matches"] and w not in bad_text]
        print(f"\nCo chu trong anh: {len(bad_text)} — {', '.join(bad_text) or 'khong co'}")
        print(f"Sai nghia: {len(bad_mean)} — {', '.join(bad_mean) or 'khong co'}")
        for w in bad_mean:
            print(f"  {w:16} {out[w]['note'][:70]}")
        return 0

    key = together_key()
    account, token = cf_creds()

    if args.check:
        if not token:
            print("Chua co khoa Cloudflare.")
            return 1
        try:
            rows = cf_accounts(token)
        except Exception as exc:
            print(f"Khoa khong dung hoac thieu quyen: {str(exc)[:160]}")
            return 1
        for aid, name in rows:
            print(f"{aid}  {name}")
        if rows and not account and len(rows) == 1:
            print(f"\nThem vao config.toml:\n  [cloudflare]\n  account_id = \"{rows[0][0]}\"")
        if not rows:
            print("Khoa hop le nhung khong doc duoc danh sach tai khoan (mau token 'Workers AI' khong co quyen do).")
            print("Lay account_id thu cong: dash.cloudflare.com -> Workers & Pages -> cot phai 'Account ID'.")
        if account:
            print(f"account_id dang dung: {account}")
        return 0

    if args.list_models:
        if not key:
            print("Chua co TOGETHER_API_KEY.")
            return 1
        for mid in together_models(key):
            print(mid)
        return 0

    words = load_words()

    if args.fix:
        try:
            marks = json.loads(AUDIT_PATH.read_text(encoding="utf-8")).get("images") or {}
        except Exception:
            marks = {}
        flagged = sorted(w for w, v in marks.items() if v.get("has_text") and w in words)
        flagged = flagged[args.skip: args.skip + args.limit]
        if not flagged:
            print("Khong co anh nao bi danh dau la co chu.")
            return 0
        scenes0 = load_scenes()
        for w in flagged:
            scenes0.pop(w, None)
            marks.pop(w, None)
            f = OUT_DIR / f"{file_name(w)}.webp"
            if f.exists():
                f.unlink()
        save_scenes(scenes0)
        AUDIT_PATH.write_text(
            json.dumps({"version": 1, "images": marks}, ensure_ascii=False, indent=1) + "\n",
            encoding="utf-8",
        )
        print(f"Viet lai canh cho {len(flagged)} tu bi lot chu...")
        make_scenes(flagged, words, scenes0, retry=True)
        args.only = ",".join(flagged)
        args.skip = 0
        args.limit = len(flagged)

    batch = pick_words(args, words)
    if not batch:
        print("Khong con tu nao can ve.")
        return 0

    model = ""
    if args.provider == "cloudflare":
        if not token:
            print("Chua co khoa Cloudflare. Dat bien moi truong CLOUDFLARE_API_TOKEN hoac them vao config.toml:")
            print('  [cloudflare]\n  account_id = "..."\n  api_token = "..."')
            return 1
        if not account:
            try:
                rows = cf_accounts(token)
            except Exception:
                rows = []
            if len(rows) != 1:
                print("Chua biet account_id. Chay: python scripts/gen_wordimg.py --check")
                return 1
            account = rows[0][0]
        model = args.model or CF_MODEL
        print(f"Model: {model}")
    elif args.provider == "together":
        if not key:
            print("Chua co khoa Together. Dat bien moi truong TOGETHER_API_KEY hoac them vao config.toml:")
            print('  [together]\n  api_key = "..."')
            return 1
        model = pick_model(key, args.model)
        print(f"Model: {model}")

    print(f"Se ve {len(batch)} tu: {', '.join(batch[:12])}{' ...' if len(batch) > 12 else ''}")
    if args.dry_run:
        return 0

    scenes = load_scenes()
    need = [w for w in batch if w not in scenes]
    if need and not args.no_scenes:
        print(f"Viet cau ta canh cho {len(need)} tu bang Gemini...")
        make_scenes(need, words, scenes)
    if args.scenes_only:
        print(f"Da co canh cho {len(load_scenes())} tu.")
        return 0

    done: list[tuple[str, int]] = []
    failed: list[tuple[str, str]] = []
    cost = neurons_per_image(args.steps, args.size or 1024)
    used = usage_today()
    free_left = max(0.0, args.budget - used)
    over_cap = max(0.0, args.overage_usd / USD_PER_NEURON)
    over_left = max(0.0, over_cap - overage_spent())
    budget = [free_left + over_left]
    if args.provider == "cloudflare":
        print(
            f"Neuron hom nay: da dung ~{used:.0f}, mien phi con ~{free_left:.0f}"
            + (f", tra phi con ~{over_left:.0f} (~{over_left * USD_PER_NEURON:.2f} USD)" if over_cap else "")
        )
        print(
            f"Moi anh ~{cost:.0f} neuron -> toi da {int(budget[0] // cost)} anh me nay. "
            f"Uoc tien phai tra: {max(0.0, min(len(batch) * cost - free_left, over_left)) * USD_PER_NEURON:.2f} USD"
        )

    def run(word: str) -> None:
        if _stop.is_set():
            return
        vi, pos = words[word]
        scene = scenes.get(word)
        if not scene and not args.no_scenes:
            failed.append((word, "chua co cau ta canh"))
            return
        prompt = wordimg.scene_prompt(scene) if scene else wordimg.ai_prompt(word, vi, pos)
        for attempt in range(args.retries):
            if _stop.is_set():
                return
            throttle(args.delay)
            try:
                if args.provider == "cloudflare":
                    with _lock:
                        if budget[0] < cost:
                            if not _stop.is_set():
                                print("\nDa cham tran ngan sach. Dung lai, mai chay tiep.")
                            _stop.set()
                            return
                        budget[0] -= cost
                    raw = gen_cloudflare(prompt, account, token, model, args.steps, args.size)
                    add_usage(cost)
                elif args.provider == "together":
                    raw = gen_together(prompt, key, model, args.steps)
                else:
                    raw = gen_pollinations(prompt, abs(hash(word)) % 100000)
                size = save_webp(raw, word)
                done.append((word, size))
                print(f"  ok  {word:22} {size // 1024:3}KB")
                return
            except Exception as exc:
                msg = str(exc)[:160]
                if out_of_quota(msg):
                    failed.append((word, msg))
                    if not _stop.is_set():
                        print(f"\nHet han muc trong ngay ({msg}). Dung lai, mai chay tiep.")
                    _stop.set()
                    return
                if attempt + 1 >= args.retries:
                    failed.append((word, msg))
                    print(f"  LOI {word:22} {msg}")
                    return
                time.sleep(2 ** attempt * 2)

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as ex:
        list(ex.map(run, batch))

    total = update_list()
    added = sum(s for _, s in done)
    print(f"\nXong: {len(done)} anh moi, {len(failed)} loi, them {added // 1024}KB vao repo.")
    print(f"wordImages.json hien co {total} tu.")
    if failed:
        print("Tu bi loi: " + ", ".join(w for w, _ in failed[:30]))
    if args.sheet:
        sheet([w for w, _ in done] or batch, args.sheet, words)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
