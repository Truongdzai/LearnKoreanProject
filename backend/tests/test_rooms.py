from __future__ import annotations

from .conftest import auth_headers, register


def queue(client, headers, level="b1", topics=None, wide=False, lang="en"):
    r = client.post(
        "/api/rooms/match",
        json={"lang": lang, "level": level, "topics": topics or [], "wide": wide},
        headers=headers,
    )
    assert r.status_code == 200, r.text
    return r.json()


def test_match_pairs_same_level(client):
    a = auth_headers(register(client, "a@test.vn")["token"])
    b = auth_headers(register(client, "b@test.vn")["token"])

    assert queue(client, a, topics=["work", "travel"])["matched"] is False

    paired = queue(client, b, topics=["travel", "food"])
    assert paired["matched"] is True
    room = paired["state"]["room"]
    assert room["max"] == 2
    assert room["mode"] == "private"
    assert room["topic"] == "Du lịch"
    assert len(paired["state"]["members"]) == 2

    seen = client.get("/api/rooms/match", headers=a).json()
    assert seen["matched"] is True
    assert seen["state"]["room"]["id"] == room["id"]


def test_match_never_pairs_across_levels_by_default(client):
    a = auth_headers(register(client, "c@test.vn")["token"])
    b = auth_headers(register(client, "d@test.vn")["token"])

    queue(client, a, level="a1")
    later = queue(client, b, level="c1")
    assert later["matched"] is False
    assert later["pool"] == 0


def test_match_pairs_neighbour_level_when_both_opt_in(client):
    a = auth_headers(register(client, "e@test.vn")["token"])
    b = auth_headers(register(client, "f@test.vn")["token"])

    queue(client, a, level="a1", wide=True)
    later = queue(client, b, level="a2", wide=True)
    assert later["matched"] is True


def test_wide_still_refuses_levels_two_steps_apart(client):
    a = auth_headers(register(client, "e2@test.vn")["token"])
    b = auth_headers(register(client, "f2@test.vn")["token"])

    queue(client, a, level="a1", wide=True)
    later = queue(client, b, level="b1", wide=True)
    assert later["matched"] is False


def test_legacy_level_names_map_onto_cefr(client):
    a = auth_headers(register(client, "e3@test.vn")["token"])
    b = auth_headers(register(client, "f3@test.vn")["token"])

    queue(client, a, level="beginner")
    later = queue(client, b, level="a1")
    assert later["matched"] is True


def test_paired_room_stays_out_of_the_public_lobby(client):
    a = auth_headers(register(client, "g@test.vn")["token"])
    b = auth_headers(register(client, "h@test.vn")["token"])

    queue(client, a)
    queue(client, b)
    assert client.get("/api/rooms?lang=en", headers=a).json()["rooms"] == []


def test_signals_reach_only_the_addressee_and_are_read_once(client):
    a_session = register(client, "j@test.vn")
    b_session = register(client, "k@test.vn")
    a, b = auth_headers(a_session["token"]), auth_headers(b_session["token"])
    a_id, b_id = a_session["user"]["id"], b_session["user"]["id"]

    queue(client, a)
    room = queue(client, b)["state"]["room"]["id"]

    r = client.post(f"/api/rooms/{room}/signal", json={"to": b_id, "kind": "offer", "payload": "{\"x\":1}"}, headers=a)
    assert r.status_code == 200

    assert client.get(f"/api/rooms/{room}/signal", headers=a).json()["signals"] == []

    inbox = client.get(f"/api/rooms/{room}/signal", headers=b).json()["signals"]
    assert [(s["from"], s["kind"]) for s in inbox] == [(a_id, "offer")]
    assert client.get(f"/api/rooms/{room}/signal", headers=b).json()["signals"] == []


def test_signal_rejects_bad_kind_and_outsiders(client):
    a_session = register(client, "l@test.vn")
    b_session = register(client, "m@test.vn")
    a, b = auth_headers(a_session["token"]), auth_headers(b_session["token"])

    queue(client, a)
    room = queue(client, b)["state"]["room"]["id"]

    bad = client.post(f"/api/rooms/{room}/signal", json={"to": b_session["user"]["id"], "kind": "hack", "payload": "1"}, headers=a)
    assert bad.status_code == 400

    outsider = auth_headers(register(client, "n@test.vn")["token"])
    assert client.get(f"/api/rooms/{room}/signal", headers=outsider).status_code == 403
    assert client.post(
        f"/api/rooms/{room}/signal",
        json={"to": b_session["user"]["id"], "kind": "offer", "payload": "1"},
        headers=outsider,
    ).status_code == 403


def test_ice_config_always_offers_a_stun_server(client):
    a = auth_headers(register(client, "o@test.vn")["token"])
    cfg = client.get("/api/rooms/ice", headers=a).json()
    assert cfg["iceServers"]
    assert any("stun:" in u for s in cfg["iceServers"] for u in ([s["urls"]] if isinstance(s["urls"], str) else s["urls"]))


def test_match_cancel_clears_the_queue(client):
    a = auth_headers(register(client, "i@test.vn")["token"])

    queue(client, a)
    assert client.get("/api/rooms/match", headers=a).json()["queued"] is True

    assert client.post("/api/rooms/match/cancel", headers=a).status_code == 200
    assert client.get("/api/rooms/match", headers=a).json()["queued"] is False
