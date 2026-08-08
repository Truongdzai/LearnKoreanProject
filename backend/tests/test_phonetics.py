from __future__ import annotations

from ..services import phonetics


def test_ipa_endpoint(client):
    r = client.post("/api/define/ipa", json={"words": ["think", "Andy", "college?", "zzqqxx"]})
    assert r.status_code == 200
    data = r.json()["readings"]
    if not phonetics.available():
        assert data == {}
        return
    assert data["think"]["ipa"] == "θɪŋk"
    assert data["think"]["ph"] == "TH IH NG K"
    assert data["Andy"]["ipa"] == "ˈændi"
    assert data["college?"]["ipa"] == "ˈkɑlɪdʒ"
    assert "zzqqxx" not in data


def test_stress_only_on_multisyllable_words():
    if not phonetics.available():
        return
    out = phonetics.readings(["take", "understand"])
    assert "ˈ" not in out["take"]["ipa"]
    assert out["understand"]["ipa"].startswith("ˌ")


def test_possessive_falls_back_to_base_word():
    if not phonetics.available():
        return
    out = phonetics.readings(["Woody's"])
    assert out["Woody's"]["ipa"].startswith("ˈwʊdi")
