from __future__ import annotations

from ..services import wordprofile

RAW = {
    "ipa": "/rʌn/",
    "level": "A1",
    "core": "Ý lõi: chuyển động liên tục.",
    "grammar": "Động từ bất quy tắc run - ran - run.",
    "senses": [
        {"pos": "verb", "vi": "chạy", "en": "move fast", "freq": 9, "ex": "I run.", "exVi": "Tôi chạy."},
        {"pos": "lạ", "vi": "điều hành", "en": "manage", "freq": "x", "ex": "She runs a shop.", "exVi": "Cô ấy quản lý một cửa hàng."},
        {"pos": "noun", "vi": "", "en": "bỏ vì thiếu nghĩa", "freq": 2, "ex": "", "exVi": ""},
    ],
    "family": [
        {"form": "runner", "pos": "danh từ", "vi": "người chạy"},
        {"form": "run", "pos": "động từ", "vi": "trùng chính từ nên phải bị loại"},
    ],
    "combos": [
        {"label": "run + giới từ", "note": "", "items": [{"form": "run out of", "vi": "hết"}, {"vi": "thiếu form"}]},
        {"label": "nhóm rỗng", "items": []},
    ],
    "phrasals": [{"form": "run away", "vi": "bỏ chạy", "ex": "The cat ran away."}],
    "idioms": [],
    "synonyms": [
        {"word": "jog", "vi": "chạy chậm", "diff": "chậm hơn"},
        {"word": "run", "vi": "trùng", "diff": "phải bị loại"},
    ],
    "antonyms": [{"word": "walk", "vi": "đi bộ"}],
    "confuse": [
        {"word": "race", "vi": "cuộc đua", "why": "cùng dịch là chạy"},
        {"word": "thiếu why", "vi": "x"},
    ],
    "mistakes": ["Sai: I run yesterday. → Đúng: I ran yesterday.", "  "],
}


def test_normalize_keeps_good_data_and_drops_junk():
    out = wordprofile._normalize("run", RAW)
    assert out is not None

    assert [s["vi"] for s in out["senses"]] == ["chạy", "điều hành"]
    assert out["senses"][0]["freq"] == 5
    assert out["senses"][1]["freq"] == 3
    assert out["senses"][1]["pos"] == "other"

    assert [f["form"] for f in out["family"]] == ["runner"]
    assert len(out["combos"]) == 1
    assert [i["form"] for i in out["combos"][0]["items"]] == ["run out of"]
    assert [s["word"] for s in out["synonyms"]] == ["jog"]
    assert [c["word"] for c in out["confuse"]] == ["race"]
    assert out["mistakes"] == ["Sai: I run yesterday. → Đúng: I ran yesterday."]
    assert out["ai"] is True


def test_normalize_returns_none_without_senses():
    assert wordprofile._normalize("run", {"core": "x", "senses": []}) is None
    assert wordprofile._normalize("run", {}) is None


def test_profile_endpoint_rejects_non_words(client):
    r = client.get("/api/en/profile", params={"word": "123!"})
    assert r.status_code == 200
    assert r.json()["profile"] is None


def test_ready_reports_profile_flag(client):
    r = client.get("/api/en/ready", params={"word": "khongcotutnay"})
    assert r.status_code == 200
    assert r.json()["profile"] is False
