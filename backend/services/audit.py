from __future__ import annotations

import json

from .. import db

KEEP = 2000


def log(
    admin: dict | None,
    action: str,
    target: str = "",
    detail: dict | str | None = None,
    ip: str = "",
) -> None:
    try:
        if isinstance(detail, dict):
            detail = json.dumps(detail, ensure_ascii=False)[:600]
        conn = db.get_conn()
        try:
            conn.execute(
                "INSERT INTO admin_audit (admin_id, admin_name, action, target, detail, ip) "
                "VALUES (?,?,?,?,?,?)",
                (
                    str((admin or {}).get("id", "?")),
                    (admin or {}).get("name", ""),
                    action,
                    target,
                    detail or "",
                    ip,
                ),
            )
            conn.execute(
                "DELETE FROM admin_audit WHERE id <= "
                "(SELECT MAX(id) FROM admin_audit) - ?",
                (KEEP,),
            )
            conn.commit()
        finally:
            conn.close()
    except Exception:
        pass


def recent(page: int = 1, page_size: int = 30, action: str = "") -> dict:
    page = max(1, int(page or 1))
    page_size = min(100, max(5, int(page_size or 30)))
    where, args = "", []
    if action:
        where = "WHERE action = ?"
        args.append(action)
    conn = db.get_conn()
    try:
        total = conn.execute(f"SELECT COUNT(*) FROM admin_audit {where}", args).fetchone()[0]
        rows = conn.execute(
            f"SELECT * FROM admin_audit {where} ORDER BY id DESC LIMIT ? OFFSET ?",
            (*args, page_size, (page - 1) * page_size),
        ).fetchall()
        actions = [
            r["action"] for r in conn.execute(
                "SELECT DISTINCT action FROM admin_audit ORDER BY action"
            ).fetchall()
        ]
    finally:
        conn.close()
    return {
        "items": [dict(r) for r in rows],
        "total": total,
        "page": page,
        "pageSize": page_size,
        "actions": actions,
    }
