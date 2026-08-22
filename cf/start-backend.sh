#!/bin/sh

DB=/app/data/hanquan.db
TMP=/app/data/restored.db
CFG=/etc/litestream.yml
PORT=${APP_PORT:-8000}
UVICORN="python3 -m uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"

if python3 -c "
import socket, sys
s = socket.socket()
s.settimeout(1)
sys.exit(0 if s.connect_ex(('127.0.0.1', ${PORT})) == 0 else 1)
" 2>/dev/null; then
	echo "[vyling] Cổng ${PORT} đã có người phục vụ — bỏ qua lần khởi động thứ hai."
	exit 0
fi

if ! command -v litestream >/dev/null 2>&1 \
	|| [ -z "$LITESTREAM_ACCESS_KEY_ID" ] \
	|| [ -z "$LITESTREAM_SECRET_ACCESS_KEY" ] \
	|| [ -z "$LITESTREAM_ENDPOINT" ] \
	|| [ -z "$LITESTREAM_BUCKET" ]; then
	echo "[vyling] KHÔNG có sao lưu: thiếu Litestream hoặc khoá R2."
	echo "[vyling] Web chạy bình thường nhưng DỮ LIỆU NGƯỜI DÙNG SẼ MẤT khi container ngủ dậy."
	echo "[vyling] Đặt R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ACCOUNT_ID bằng wrangler secret put."
	exec $UVICORN
fi

rm -f "$TMP" "$TMP-wal" "$TMP-shm"

if litestream restore -if-replica-exists -config "$CFG" -o "$TMP" "$DB" && [ -s "$TMP" ]; then
	rm -f "$DB" "$DB-wal" "$DB-shm"
	mv "$TMP" "$DB"
	echo "[vyling] Đã khôi phục $DB từ R2."
else
	rm -f "$TMP"
	echo "[vyling] Chưa có bản sao trên R2 — dùng DB trong image làm bản đầu tiên."
fi

STARTED=$(date +%s)
litestream replicate -config "$CFG" -exec "$UVICORN"
CODE=$?
ELAPSED=$(( $(date +%s) - STARTED ))

if [ "$CODE" -ne 0 ] && [ "$ELAPSED" -lt 15 ]; then
	echo "[vyling] Litestream hỏng sau ${ELAPSED}s (mã $CODE) — chạy uvicorn trần, KHÔNG có sao lưu."
	exec $UVICORN
fi

exit $CODE
