from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.db import get_db
from app.auth.models import User
from app.auth.google_oauth import verify_google_id_token
from app.auth.security import create_access_token
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    id_token: str


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    picture: str | None = None

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    user: UserOut


@router.post("/google", response_model=LoginResponse)
async def google_login(req: GoogleLoginRequest, db: Session = Depends(get_db)):
    try:
        claims = verify_google_id_token(req.id_token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc))

    google_id = claims["sub"]
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        # First login — create the account automatically.
        user = User(
            google_id=google_id,
            email=claims.get("email", ""),
            name=claims.get("name", ""),
            picture=claims.get("picture"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token(user.id, user.email)
    return LoginResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/logout")
async def logout():
    # Stateless JWT — logout is handled client-side by discarding the token.
    return {"status": "logged out"}