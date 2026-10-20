import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.db import get_db
from app.auth.dependencies import get_current_user
from app.auth.models import User, UserHistory

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
async def get_history(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    rows = (
        db.query(UserHistory)
        .filter(UserHistory.user_id == current_user.id)
        .order_by(UserHistory.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": r.id,
            "kind": r.kind,
            "created_at": r.created_at,
            "payload": json.loads(r.payload),
        }
        for r in rows
    ]
