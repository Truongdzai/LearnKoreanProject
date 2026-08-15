# Image cho Cloudflare Sandbox chạy NGUYÊN VẸN backend FastAPI hiện tại.
#
# Base image của Cloudflare đã set sẵn ENTRYPOINT (sandbox agent mở HTTP API
# rồi spawn CMD làm tiến trình con) — KHÔNG được ghi đè ENTRYPOINT.
FROM docker.io/cloudflare/sandbox:0.7.0-python

# ffmpeg: backend/services/media.py gọi (ensure_ffmpeg khi khởi động).
RUN apt-get update && apt-get install -y --no-install-recommends \
	ffmpeg \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cài dependency trước để tận dụng layer cache.
# LƯU Ý: image nền chỉ có `python3`/`pip3`, KHÔNG có alias `python`/`pip`
# (Python 3.11.14 tại /usr/local/bin). Dùng `pip` sẽ lỗi "pip: not found".
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Mã nguồn backend — copy y nguyên, không sửa dòng nào.
COPY backend/ ./backend/
COPY config.example.toml ./

# Frontend đã build. PHẢI có thật, không được là thư mục rỗng:
# backend/main.py mount SPA theo điều kiện `if _DIST.exists()`, mà thư mục
# rỗng vẫn tính là tồn tại — khi đó nó mount SPA lên chỗ không có file nào và
# mọi request về "/" đổ lỗi thay vì 404 sạch.
#
# Nhớ chạy `npm run build --prefix frontend` TRƯỚC khi build image.
COPY frontend/dist/ ./frontend/dist/

# data/, media/, dictionaries/ KHÔNG nằm trong image (xem
# Dockerfile.dockerignore) — 420MB media đi vào image thì cold start rất chậm
# và mỗi lần deploy phải đẩy lại toàn bộ. /media/* phục vụ từ R2 ở edge.
RUN mkdir -p /app/data /app/dictionaries

ENV PYTHONUNBUFFERED=1 \
	PYTHONIOENCODING=utf-8

EXPOSE 8000

# Cùng lệnh với start.bat, chỉ đổi host để nghe được từ ngoài container.
CMD ["python3", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
