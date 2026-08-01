from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from ..errors import AppError
from ..services import auth, quota, topik

router = APIRouter(prefix="/api/topik", tags=["TOPIK"])
OptAuth = Depends(auth.get_optional_user)

MIN_LEN = {"51": 4, "52": 4, "53": 80, "54": 200}


class WritingIn(BaseModel):
    task: str = "53"
    prompt: str = ""
    answer: str = ""


@router.post("/writing")
def api_topik_writing(body: WritingIn, request: Request, user: dict | None = OptAuth):
    answer = body.answer.strip()
    need = MIN_LEN.get(body.task, 40)
    if len(answer) < need:
        raise AppError(
            "INVALID_INPUT",
            f"Bài viết quá ngắn để chấm — hãy viết ít nhất {need} ký tự (hiện {len(answer)}).",
            400,
        )
    left = quota.consume("writing", user, quota.client_ip(request))
    try:
        out = topik.grade(body.task, body.prompt, answer)
        out["quota"] = left
        return out
    except AppError:
        raise
    except Exception as exc:
        raise AppError("UPSTREAM_AI", f"Chưa chấm được bài viết: {exc}", 502)
