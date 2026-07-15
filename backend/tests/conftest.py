from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from .. import db
from ..main import app
from ..services import catalog


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """TestClient trên DB file tạm — không bao giờ chạm data/hanquan.db."""
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    db.init_db()
    catalog.seed()
    return TestClient(app)


def register(client: TestClient, email: str = "user@test.vn", password: str = "matkhau6") -> dict:
    r = client.post("/api/auth/register", json={"name": "Test", "email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()


def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def make_admin(user_id: str) -> None:
    conn = db.get_conn()
    try:
        conn.execute("UPDATE users SET role = 'admin' WHERE id = ?", (user_id,))
        conn.commit()
    finally:
        conn.close()
