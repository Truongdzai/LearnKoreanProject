from __future__ import annotations

import json
import shutil
import subprocess
from datetime import date
from pathlib import Path

import pytest

from .. import db
from ..services.srs import schedule
from .conftest import auth_headers, register

FRONTEND = Path(__file__).resolve().parents[2] / "frontend"
ESBUILD = FRONTEND / "node_modules" / ".bin" / "esbuild"


def test_guest_review_is_rejected_so_frontend_schedules_locally(client):
    # Thẻ khách có id âm và chỉ nằm ở localStorage: máy chủ luôn từ chối,
    # nên frontend (guestDeck.reviewGuestCard) phải tự xếp lịch.
    r = client.post("/api/srs/review", json={"card_id": -1, "rating": 3})
    assert r.status_code == 401
    assert r.json()["code"] == "SIGNUP_REQUIRED"


def test_again_returns_reset_schedule_for_requeue(client):
    s = register(client, "srs-again@test.vn")
    h = auth_headers(s["token"])
    card = client.post("/api/srs/add", json={"front": "학교", "back": "trường"}, headers=h).json()

    conn = db.get_conn()
    try:
        conn.execute("UPDATE srs_cards SET reps = 3, ivl = 15, ease = 2.5 WHERE id = ?", (card["id"],))
        conn.commit()
    finally:
        conn.close()

    r = client.post("/api/srs/review", json={"card_id": card["id"], "rating": 1}, headers=h)
    assert r.status_code == 200
    upd = r.json()
    # ReviewPage đưa thẻ này vào lại hàng đợi: gợi ý "Tốt" phải là 1 ngày, không phải 38
    assert (upd["reps"], upd["ivl"], upd["ease"]) == (0, 0, 2.3)
    assert upd["due"] == date.today().isoformat()
    assert schedule(upd["reps"], upd["ivl"], upd["ease"], 3)[1] == 1


@pytest.mark.skipif(shutil.which("node") is None or not ESBUILD.exists(), reason="cần node + esbuild của frontend")
def test_guest_schedule_matches_backend(tmp_path):
    entry = tmp_path / "entry.ts"
    entry.write_text(
        f"import {{ schedule }} from {json.dumps(str(FRONTEND / 'src' / 'core' / 'guestDeck.ts'))}\n"
        "const out: number[][] = []\n"
        "for (const reps of [0, 1, 2, 3, 5]) for (const ivl of [0, 1, 2, 3, 5, 6, 7, 15, 37, 100])\n"
        "  for (const ease of [1.3, 1.45, 2.0, 2.15, 2.2, 2.3, 2.35, 2.5, 2.65, 2.8, 3.0])\n"
        "    for (const rating of [1, 2, 3, 4] as const) {\n"
        "      const [r, i, e] = schedule(reps, ivl, ease, rating)\n"
        "      out.push([reps, ivl, ease, rating, r, i, Math.round(e * 100) / 100])\n"
        "    }\n"
        "console.log(JSON.stringify(out))\n",
        encoding="utf-8",
    )
    bundle = tmp_path / "entry.js"
    subprocess.run(
        [str(ESBUILD), str(entry), "--bundle", "--platform=node", f"--outfile={bundle}", "--log-level=error"],
        check=True, cwd=FRONTEND, timeout=60,
    )
    rows = json.loads(subprocess.run(
        ["node", str(bundle)], check=True, capture_output=True, text=True, timeout=60,
    ).stdout)
    assert len(rows) == 2200
    for reps, ivl, ease, rating, r, i, e in rows:
        pr, pi, pe = schedule(reps, ivl, ease, rating)
        assert (pr, pi, round(pe, 2)) == (r, i, e), (reps, ivl, ease, rating)
    # round() của Python làm tròn nửa về số chẵn — bản TS phải giữ đúng như vậy
    assert schedule(2, 1, 2.5, 3)[1] == 2
