# backend/app/routers/protected.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import decode_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/api/protected", tags=["protected"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {"id": payload["sub"], "role": payload["role"]}

@router.get("/resource")
def protected_resource(user=Depends(get_current_user)):
    # just return user info and a timestamp for testing
    from datetime import datetime
    return {"message": "Protected content", "user": user, "time": datetime.utcnow()}
