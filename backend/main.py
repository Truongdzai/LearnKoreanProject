from __future__ import annotations

import asyncio
import mimetypes
import re
import sys
from contextlib import asynccontextmanager
from datetime import date

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings, ROOT
from .errors import AppError
from . import db
from .services import health, media, dictionary, catalog, accounts, backup, notify, auth, quota, events
from .routers import (
    learn,
    dict as dict_router,
    srs as srs_router,
    pronounce as pronounce_router,
    speaking as speaking_router,
    rooms as rooms_router,
    tutor as tutor_router,
    topik as topik_router,
    auth as auth_router,
    me as me_router,
    content as content_router,
    admin as admin_router,
    lingo as lingo_router,
    english as english_router,
    feedback as feedback_router,
    arena as arena_router,
    notify as notify_router,
)

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    catalog.seed()
    accounts.seed_admin()
    media.ensure_ffmpeg()
    dictionary.ensure_imported()
    backup_task = asyncio.create_task(backup.backup_loop())
    notify_task = asyncio.create_task(notify.notify_loop())
    yield
    backup_task.cancel()
    notify_task.cancel()

_SEC = settings.get("security", {}) or {}
_EXPOSE_DOCS = bool(_SEC.get("expose_docs", True))
_CORS_ORIGINS = _SEC.get("cors_origins") or ["*"]

_ANALYTICS = settings.get("analytics", {}) or {}
_GA4_ID = str(_ANALYTICS.get("ga4_id", "") or "").strip()
_GSC_TOKEN = str(_ANALYTICS.get("google_site_verification", "") or "").strip()

app = FastAPI(
    title=settings["app"]["name"],
    lifespan=lifespan,
    docs_url="/docs" if _EXPOSE_DOCS else None,
    redoc_url="/redoc" if _EXPOSE_DOCS else None,
    openapi_url="/openapi.json" if _EXPOSE_DOCS else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


_GA_SCRIPT = " https://www.googletagmanager.com" if _GA4_ID else ""
_GA_CONNECT = (
    " https://www.googletagmanager.com https://www.google-analytics.com"
    " https://*.google-analytics.com https://*.analytics.google.com"
    if _GA4_ID
    else ""
)

_RTC_CONNECT = " stun: stuns: turn: turns:"

_CSP = (
    "default-src 'self'; "
    "img-src 'self' data: https:; "
    "media-src 'self' blob: data:; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    f"script-src 'self' https://www.youtube.com https://s.ytimg.com{_GA_SCRIPT}; "
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com; "
    f"connect-src 'self'{_GA_CONNECT}{_RTC_CONNECT}; "
    "object-src 'none'; base-uri 'self'; frame-ancestors 'self'"
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    resp: Response = await call_next(request)
    resp.headers.setdefault("X-Content-Type-Options", "nosniff")
    resp.headers.setdefault("X-Frame-Options", "SAMEORIGIN")
    resp.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    resp.headers.setdefault("Permissions-Policy", "geolocation=(), payment=()")
    if not request.url.path.startswith("/api/"):
        resp.headers.setdefault("Content-Security-Policy", _CSP)
    return resp

@app.exception_handler(AppError)
async def app_error_handler(_request: Request, exc: AppError):
    return JSONResponse(status_code=exc.status, content={"detail": exc.detail, "code": exc.code})

app.include_router(learn.router)
app.include_router(dict_router.router)
app.include_router(srs_router.router)
app.include_router(pronounce_router.router)
app.include_router(speaking_router.router)
app.include_router(rooms_router.router)
app.include_router(tutor_router.router)
app.include_router(topik_router.router)
app.include_router(auth_router.router)
app.include_router(me_router.router)
app.include_router(content_router.router)
app.include_router(admin_router.router)
app.include_router(lingo_router.router)
app.include_router(english_router.router)
app.include_router(feedback_router.router)
app.include_router(arena_router.router)
app.include_router(notify_router.router)

@app.get("/api/health", tags=["Hệ thống"])
def api_health():
    return JSONResponse(health.run_checks())


@app.get("/api/quota", tags=["Hệ thống"])
def api_quota(request: Request, user: dict | None = Depends(auth.get_optional_user)):
    return quota.status(user, quota.client_ip(request))


@app.post("/api/events", tags=["Hệ thống"], include_in_schema=False)
async def api_events(request: Request, user: dict | None = Depends(auth.get_optional_user)):
    try:
        body = await request.json()
    except Exception:
        return {"ok": True, "saved": 0}
    items = body.get("events") if isinstance(body, dict) else body
    if isinstance(body, dict) and not isinstance(items, list):
        items = [body]
    if not isinstance(items, list):
        return {"ok": True, "saved": 0}
    return events.record(items, user["id"] if user else None)


@app.get("/api/site", tags=["Hệ thống"])
def api_site():
    return {"ga4": _GA4_ID, "publicUrl": (settings.get("app", {}) or {}).get("public_url", "")}


@app.get("/google{token}.html", include_in_schema=False)
def google_site_verification(token: str):
    if not _GSC_TOKEN or token != _GSC_TOKEN:
        raise StarletteHTTPException(status_code=404)
    return Response(
        content=f"google-site-verification: google{_GSC_TOKEN}.html",
        media_type="text/html; charset=utf-8",
    )

_PUBLIC_PATHS = [
    ("/", "1.0", "daily"),
    ("/shadowing", "0.9", "daily"),
    ("/tieng-han-3-thang", "0.9", "weekly"),
    ("/luyen-thi-topik", "0.9", "weekly"),
    ("/tieng-anh-giao-tiep", "0.9", "weekly"),
    ("/luyen-thi-toeic", "0.9", "weekly"),
    ("/tieng-trung-3-thang", "0.8", "weekly"),
    ("/luyen-thi-hsk", "0.8", "weekly"),
    ("/luyen-noi", "0.8", "weekly"),
    ("/gia-su-ai", "0.8", "weekly"),
    ("/tu-vung", "0.7", "weekly"),
    ("/bang-gia", "0.6", "monthly"),
    ("/blog", "0.8", "weekly"),
    ("/tro-giup", "0.6", "monthly"),
    ("/ve-chung-toi", "0.5", "monthly"),
    ("/lien-he", "0.4", "monthly"),
    ("/dieu-khoan", "0.3", "yearly"),
    ("/bao-mat", "0.3", "yearly"),
]


def _base_url(request: Request) -> str:
    configured = (settings.get("app", {}) or {}).get("public_url", "")
    if configured:
        return str(configured).rstrip("/")
    return str(request.base_url).rstrip("/")


@app.get("/robots.txt", include_in_schema=False)
def robots(request: Request):
    base = _base_url(request)
    body = (
        "User-agent: *\n"
        "Allow: /\n"
        "Disallow: /api/\n"
        "Disallow: /quan-tri\n"
        "Disallow: /tong-quan\n"
        "Disallow: /on-tap\n"
        "Disallow: /video-cua-toi\n"
        f"\nSitemap: {base}/sitemap.xml\n"
    )
    return Response(content=body, media_type="text/plain; charset=utf-8")


@app.get("/sitemap.xml", include_in_schema=False)
def sitemap(request: Request):
    base = _base_url(request)
    today = date.today().isoformat()
    urls = "".join(
        f"<url><loc>{base}{path}</loc><lastmod>{today}</lastmod>"
        f"<changefreq>{freq}</changefreq><priority>{prio}</priority></url>"
        for path, prio, freq in _PUBLIC_PATHS
    )
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        f"{urls}</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


_DIST = ROOT / "frontend" / "dist"
_MEDIA = ROOT / "media"

mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("text/javascript", ".js")

if _MEDIA.exists():
    app.mount("/media", StaticFiles(directory=str(_MEDIA)), name="media")


class SpaStaticFiles(StaticFiles):
    @staticmethod
    def _cache_headers(response, rel: str) -> None:
        name = rel.rsplit("/", 1)[-1].lstrip(".")
        if rel.startswith("assets/") and re.search(r"-[A-Za-z0-9_-]{8,}\.", name):
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif not name or name.endswith((".html", ".webmanifest")):
            response.headers["Cache-Control"] = "no-cache"

    async def get_response(self, path: str, scope):
        rel = path.replace("\\", "/").strip("/")

        if rel and "." not in rel.rsplit("/", 1)[-1]:
            prerendered = _DIST / rel / "index.html"
            if prerendered.is_file():
                r = await super().get_response(f"{rel}/index.html", scope)
                self._cache_headers(r, f"{rel}/index.html")
                return r

        try:
            r = await super().get_response(path, scope)
            self._cache_headers(r, rel)
            return r
        except StarletteHTTPException as exc:
            if exc.status_code != 404:
                raise
            if rel.startswith("api/") or (rel and "." in rel.rsplit("/", 1)[-1]):
                raise
            r = await super().get_response("index.html", scope)
            self._cache_headers(r, "index.html")
            return r

if _DIST.exists():
    app.mount("/", SpaStaticFiles(directory=str(_DIST), html=True), name="spa")
