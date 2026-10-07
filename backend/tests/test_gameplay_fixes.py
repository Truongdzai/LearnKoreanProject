from __future__ import annotations

from datetime import date, datetime, timedelta

from .. import db
from ..services import accounts, gameplay
from .conftest import auth_headers, make_admin, register


def _exec(sql: str, params: tuple = ()) -> None:
    conn = db.get_conn()
    try:
        conn.execute(sql, params)
        conn.commit()
    finally:
        conn.close()


def _set_streak(user_id: str, streak: int, days_ago: int) -> None:
    last = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d %H:%M:%S")
    _exec("UPDATE users SET streak = ?, last_active = ? WHERE id = ?", (streak, last, user_id))


def _log_day(user_id: str, day: date, xp: int, minutes: int = 0) -> None:
    _exec(
        "INSERT INTO activity_log (user_id, day, xp, minutes) VALUES (?,?,?,?) "
        "ON CONFLICT(user_id, day) DO UPDATE SET xp = excluded.xp, minutes = excluded.minutes",
        (user_id, day.isoformat(), xp, minutes),
    )


# engagement-bug1: lượng sự kiện phải bị chặn


def test_event_rejects_absurd_amounts(client):
    s = register(client, "ev1@test.vn")
    h = auth_headers(s["token"])
    for body in (
        {"type": "lesson", "amount": 1_000_000},
        {"type": "lesson", "amount": -5},
        {"type": "lesson", "amount": 1, "minutes": 1_000_000},
        {"type": "word", "amount": 1, "words": -100},
    ):
        r = client.post("/api/me/event", json=body, headers=h)
        assert r.status_code == 422, (body, r.text)
    assert client.get("/api/me/state", headers=h).json()["user"]["xp"] == 0


def test_event_amount_clamped_per_type(client):
    s = register(client, "ev2@test.vn")
    h = auth_headers(s["token"])
    r = client.post("/api/me/event", json={"type": "lesson", "amount": 500, "minutes": 900}, headers=h)
    assert r.status_code == 200
    xp = r.json()["user"]["xp"]
    assert xp == gameplay._EVENT_XP["lesson"] * gameplay._EVENT_MAX["lesson"]

    acts = client.get("/api/me/activities", headers=h).json()
    assert acts["minutes"][-1] == gameplay.MAX_EVENT_MINUTES

    # quest q2 (5 bài/ngày) chỉ cộng tối đa mức trần, không vượt bằng một request
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT progress FROM quest_progress WHERE user_id = ? AND quest_id = 'q2'", (s["user"]["id"],)
        ).fetchone()
    finally:
        conn.close()
    assert row["progress"] == gameplay._EVENT_MAX["lesson"]


def test_event_service_clamps_without_router(client):
    s = register(client, "ev3@test.vn")
    user = accounts.reload(s["user"]["id"])
    out = gameplay.record_event(user, "video", 10_000, minutes=-30, words=-40)
    assert out["user"]["xp"] == gameplay._EVENT_XP["video"] * gameplay._EVENT_MAX["video"]
    conn = db.get_conn()
    try:
        row = conn.execute(
            "SELECT minutes, words FROM activity_log WHERE user_id = ? AND day = ?",
            (user["id"], date.today().isoformat()),
        ).fetchone()
    finally:
        conn.close()
    assert row["minutes"] == 0 and row["words"] == 0


def test_word_import_batch_still_counts(client):
    s = register(client, "ev4@test.vn")
    h = auth_headers(s["token"])
    r = client.post("/api/me/event", json={"type": "word", "amount": 40, "words": 40}, headers=h)
    assert r.status_code == 200
    assert r.json()["user"]["xp"] == 40 * gameplay._EVENT_XP["word"]


def test_daily_xp_ceiling(client):
    s = register(client, "ev5@test.vn")
    user = accounts.reload(s["user"]["id"])
    for _ in range(40):
        gameplay.record_event(user, "lesson", 5)
    assert gameplay.today_xp(user["id"]) == gameplay.DAILY_XP_CAP
    assert accounts.reload(user["id"])["xp"] == gameplay.DAILY_XP_CAP


# engagement-bug2: q5 đếm ngày học trong tuần ISO, không dùng chuỗi trọn đời


def test_q5_ignores_stale_lifetime_streak(client):
    s = register(client, "q5a@test.vn")
    h = auth_headers(s["token"])
    _set_streak(s["user"]["id"], 9, 20)
    q5 = next(q for q in client.get("/api/me/quests", headers=h).json()["quests"] if q["id"] == "q5")
    assert q5["progress"] == 0
    r = client.post("/api/me/quests/claim", json={"quest_id": "q5"}, headers=h)
    assert r.status_code == 400


def test_q5_counts_active_days_this_iso_week(client, monkeypatch):
    sunday = date(2026, 10, 11)

    class FakeDate(date):
        @classmethod
        def today(cls):
            return sunday

    monkeypatch.setattr(gameplay, "date", FakeDate)
    s = register(client, "q5b@test.vn")
    uid = s["user"]["id"]
    h = auth_headers(s["token"])
    monday = sunday - timedelta(days=6)
    _log_day(uid, monday - timedelta(days=1), 50)  # Chủ nhật tuần trước: không tính
    for i in range(6):
        _log_day(uid, monday + timedelta(days=i), 30)
    _log_day(uid, sunday, 0)  # chỉ đăng nhập, chưa học
    q5 = next(q for q in client.get("/api/me/quests", headers=h).json()["quests"] if q["id"] == "q5")
    assert q5["progress"] == 6
    assert client.post("/api/me/quests/claim", json={"quest_id": "q5"}, headers=h).status_code == 400

    _log_day(uid, sunday, 30)
    r = client.post("/api/me/quests/claim", json={"quest_id": "q5"}, headers=h)
    assert r.status_code == 200, r.text


# engagement-bug3: chuỗi hiển thị phải về 0 khi đã bỏ lỡ ngày


def test_effective_streak_everywhere(client):
    a = register(client, "sa@test.vn")
    b = register(client, "sb@test.vn")
    ha, hb = auth_headers(a["token"]), auth_headers(b["token"])
    # cả hai cần có XP để vào bảng xếp hạng / giải đấu tuần
    client.post("/api/me/event", json={"type": "lesson", "amount": 1}, headers=ha)
    client.post("/api/me/event", json={"type": "lesson", "amount": 1}, headers=hb)
    _set_streak(a["user"]["id"], 9, 20)
    _set_streak(b["user"]["id"], 4, 1)

    assert client.get("/api/me/state", headers=ha).json()["user"]["streak"] == 0
    assert client.get("/api/me/state", headers=hb).json()["user"]["streak"] == 4

    for scope in ("all", "week"):
        rows = client.get(f"/api/content/leaderboard?scope={scope}").json()["entries"]
        by_id = {e["id"]: e["streak"] for e in rows}
        assert by_id[a["user"]["id"]] == 0
        assert by_id[b["user"]["id"]] == 4

    client.get("/api/arena/league", headers=ha)
    league = client.get("/api/arena/league", headers=hb).json()["entries"]
    by_id = {e["id"]: e["streak"] for e in league}
    assert by_id[a["user"]["id"]] == 0
    assert by_id[b["user"]["id"]] == 4

    code = client.post("/api/arena/duel/create", headers=ha).json()["code"]
    duel = client.post("/api/arena/duel/join", json={"code": code}, headers=hb).json()
    assert duel["active"]["opponent"]["streak"] == 0


def test_admin_streak_sort_uses_effective_streak(client):
    boss = register(client, "boss@test.vn")
    make_admin(boss["user"]["id"])
    token = client.post("/api/auth/login", json={"email": "boss@test.vn", "password": "matkhau6"}).json()["token"]
    stale = register(client, "stale@test.vn")
    live = register(client, "live@test.vn")
    _set_streak(stale["user"]["id"], 30, 10)
    _set_streak(live["user"]["id"], 3, 0)
    users = client.get("/api/admin/users?sort=streak", headers=auth_headers(token)).json()["users"]
    assert [u["streak"] for u in users] == sorted((u["streak"] for u in users), reverse=True)
    assert users[0]["id"] == live["user"]["id"]


def test_streak_continues_from_stored_value(client):
    s = register(client, "sc@test.vn")
    h = auth_headers(s["token"])
    _set_streak(s["user"]["id"], 6, 1)
    r = client.post("/api/me/event", json={"type": "review", "amount": 1}, headers=h)
    assert r.json()["user"]["streak"] == 7

    _set_streak(s["user"]["id"], 6, 3)
    assert client.get("/api/me/state", headers=h).json()["user"]["streak"] == 0
    r = client.post("/api/me/event", json={"type": "review", "amount": 1}, headers=h)
    assert r.json()["user"]["streak"] == 1


# engagement-bug4: nhãn biểu đồ 7 ngày khớp ngày thật, hôm nay là cột cuối


def test_activities_labels_follow_rolling_window(client):
    s = register(client, "act@test.vn")
    uid = s["user"]["id"]
    h = auth_headers(s["token"])
    today = date.today()
    _log_day(uid, today, 10, minutes=7)
    _log_day(uid, today - timedelta(days=6), 10, minutes=3)
    acts = client.get("/api/me/activities", headers=h).json()
    names = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
    expected = [names[(today - timedelta(days=6 - i)).weekday()] for i in range(7)]
    assert acts["labels"] == expected
    assert acts["todayIdx"] == 6
    assert acts["minutes"][acts["todayIdx"]] == 7
    assert acts["minutes"][0] == 3


# engagement-bug5: Plus đã hết hạn không còn đặc quyền


def test_expired_plus_loses_perks(client):
    s = register(client, "plus@test.vn")
    uid = s["user"]["id"]
    h = auth_headers(s["token"])
    past = (date.today() - timedelta(days=30)).isoformat()
    _exec("UPDATE users SET is_plus = 1, plus_until = ?, coins = 100000 WHERE id = ?", (past, uid))

    shop = client.get("/api/content/shop").json()["shop"]
    plus_item = next(i for i in shop if i["plus"])
    r = client.post("/api/me/buy", json={"item_id": plus_item["id"]}, headers=h)
    assert r.status_code == 403
    assert r.json()["code"] == "PLUS_REQUIRED"

    assert client.get("/api/me/state", headers=h).json()["water"]["max"] == gameplay.WATER_PER_DAY

    for _ in range(5):
        client.post("/api/me/event", json={"type": "lesson", "amount": 1}, headers=h)
    r = client.post("/api/me/quests/claim", json={"quest_id": "q2"}, headers=h)
    assert r.status_code == 403
    assert r.json()["code"] == "PLUS_REQUIRED"


def test_active_plus_keeps_perks(client):
    s = register(client, "plus2@test.vn")
    uid = s["user"]["id"]
    h = auth_headers(s["token"])
    future = (date.today() + timedelta(days=30)).isoformat()
    _exec("UPDATE users SET is_plus = 1, plus_until = ?, coins = 100000 WHERE id = ?", (future, uid))

    shop = client.get("/api/content/shop").json()["shop"]
    plus_item = next(i for i in shop if i["plus"])
    assert client.post("/api/me/buy", json={"item_id": plus_item["id"]}, headers=h).status_code == 200
    assert client.get("/api/me/state", headers=h).json()["water"]["max"] == gameplay.WATER_PLUS_PER_DAY
    client.post("/api/me/event", json={"type": "lesson", "amount": 5}, headers=h)
    assert client.post("/api/me/quests/claim", json={"quest_id": "q2"}, headers=h).status_code == 200


# engagement-extra1: người mời đang bận thì không thể tham gia lời mời của họ


def test_duel_join_refused_when_inviter_busy(client):
    a = register(client, "da@test.vn")
    b = register(client, "db@test.vn")
    c = register(client, "dc@test.vn")
    ha, hb, hc = (auth_headers(x["token"]) for x in (a, b, c))

    code_a = client.post("/api/arena/duel/create", headers=ha).json()["code"]
    code_b = client.post("/api/arena/duel/create", headers=hb).json()["code"]
    assert client.post("/api/arena/duel/join", json={"code": code_b}, headers=ha).status_code == 200

    r = client.post("/api/arena/duel/join", json={"code": code_a}, headers=hc)
    assert r.status_code == 400
    assert r.json()["code"] == "DUEL_BUSY"

    conn = db.get_conn()
    try:
        n = conn.execute(
            "SELECT COUNT(*) AS n FROM duels WHERE status = 'active' AND (a_id = ? OR b_id = ?)",
            (a["user"]["id"], a["user"]["id"]),
        ).fetchone()["n"]
    finally:
        conn.close()
    assert n == 1
    assert client.get("/api/arena/duel", headers=hc).json()["active"] is None
