from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ..services import auth, feedback

router = APIRouter(prefix="/api/feedback", tags=["Góp ý"])
OptionalAuth = Depends(auth.get_optional_user)


class FeedbackIn(BaseModel):
    kind: str = "idea"
    message: str
    page: str = ""


@router.post("")
def api_send_feedback(body: FeedbackIn, user: dict | None = OptionalAuth):
    return feedback.add(user, body.kind, body.message, body.page)
