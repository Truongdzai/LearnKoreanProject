from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import settings, ROOT
from . import db
from .services import health, media, dictionary, catalog, accounts
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
    yield

app = FastAPI(title=settings["app"]["name"], lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/api/health")
def api_health():
    return JSONResponse(health.run_checks())

_DIST = ROOT / "frontend" / "dist"
if _DIST.exists():
    app.mount("/", StaticFiles(directory=str(_DIST), html=True), name="spa")
