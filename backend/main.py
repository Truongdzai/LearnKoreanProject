from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from .config import settings, ROOT
from . import db
from .services import health, media, dictionary
from .routers import learn, dict as dict_router, srs as srs_router, pronounce as pronounce_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    media.ensure_ffmpeg()
    dictionary.ensure_imported()
    yield

app = FastAPI(title=settings["app"]["name"], lifespan=lifespan)

app.include_router(learn.router)
app.include_router(dict_router.router)
app.include_router(srs_router.router)
app.include_router(pronounce_router.router)

@app.get("/api/health")
def api_health():
    return JSONResponse(health.run_checks())

_DIST = ROOT / "frontend" / "dist"
if _DIST.exists():
    app.mount("/", StaticFiles(directory=str(_DIST), html=True), name="spa")
