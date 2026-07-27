from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from .config import settings, ROOT
from .errors import AppError
from . import db
from .services import health, media, dictionary, catalog, accounts, backup
from .routers import (
    learn,
    dict as dict_router,
    srs as srs_router,
    pronounce as pronounce_router,
    speaking as speaking_router,
    auth as auth_router,
    me as me_router,
    content as content_router,
    admin as admin_router,
    lingo as lingo_router,
    feedback as feedback_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    catalog.seed()
    accounts.seed_admin()
    media.ensure_ffmpeg()
    dictionary.ensure_imported()
    backup_task = asyncio.create_task(backup.backup_loop())
    yield
    backup_task.cancel()

_SEC = settings.get("security", {}) or {}
_EXPOSE_DOCS = bool(_SEC.get("expose_docs", True))
_CORS_ORIGINS = _SEC.get("cors_origins") or ["*"]

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


# Trang web tự phục vụ, cùng origin nên CSP có thể siết chặt; cho phép YouTube nhúng
# (iframe player) và ảnh/thumbnail của YouTube. TTS/API đều same-origin.
_CSP = (
    "default-src 'self'; "
    "img-src 'self' data: https:; "
    "media-src 'self' blob: data:; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src 'self' https://fonts.gstatic.com data:; "
    "script-src 'self' https://www.youtube.com https://s.ytimg.com; "
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com; "
    "connect-src 'self'; "
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
app.include_router(auth_router.router)
app.include_router(me_router.router)
app.include_router(content_router.router)
app.include_router(admin_router.router)
app.include_router(lingo_router.router)
app.include_router(feedback_router.router)

@app.get("/api/health", tags=["Hệ thống"])
def api_health():
    return JSONResponse(health.run_checks())

class SpaStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except StarletteHTTPException as exc:
            if exc.status_code != 404:
                raise
            rel = path.replace("\\", "/").lstrip("/")
            if rel.startswith("api/") or "." in rel.rsplit("/", 1)[-1]:
                raise
            return await super().get_response("index.html", scope)

_DIST = ROOT / "frontend" / "dist"
if _DIST.exists():
    app.mount("/", SpaStaticFiles(directory=str(_DIST), html=True), name="spa")
