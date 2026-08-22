FROM docker.io/cloudflare/sandbox:0.12.7-python

RUN apt-get update && apt-get install -y --no-install-recommends \
	ffmpeg \
	ca-certificates \
	curl \
	&& rm -rf /var/lib/apt/lists/*

ARG LITESTREAM_VERSION=0.5.16
RUN curl -fsSL "https://github.com/benbjohnson/litestream/releases/download/v${LITESTREAM_VERSION}/litestream-${LITESTREAM_VERSION}-linux-x86_64.tar.gz" \
	| tar -xz -C /usr/local/bin litestream \
	&& litestream version

WORKDIR /app

COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY config.example.toml ./

COPY frontend/dist/ ./frontend/dist/

RUN mkdir -p /app/data /app/dictionaries
COPY dictionaries/KO-VI.KRDICT.zip ./dictionaries/

RUN python3 -c "\
from backend.services import dictionary; \
from backend import db; \
n = dictionary.import_zip(); \
conn = db.get_conn(); \
conn.execute('PRAGMA journal_mode=WAL'); \
conn.close(); \
print('[build] dict_entries:', n)"

COPY cf/litestream.yml /etc/litestream.yml
COPY cf/start-backend.sh /app/start-backend.sh
RUN chmod +x /app/start-backend.sh

ENV PYTHONUNBUFFERED=1 \
	PYTHONIOENCODING=utf-8

EXPOSE 8000
