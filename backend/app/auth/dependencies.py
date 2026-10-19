from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.auth.db import get_db
from app.auth.models import User
from app.auth.security import decode_access_token

# tokenUrl is unused (we never issue tokens via a password-grant endpoint) —
# it's only required so FastAPI's OpenAPI docs render an "Authorize" button.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/google", auto_error=True)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session.")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user