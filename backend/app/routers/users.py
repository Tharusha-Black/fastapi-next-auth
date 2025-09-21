# backend/app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from ..db import get_db
from .. import crud, auth

router = APIRouter(prefix="/api", tags=["users"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = auth.decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid access token")
    user_id = int(payload.get("sub"))
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_role(role: str):
    def role_dependency(user = Depends(get_current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user
    return role_dependency

@router.get("/users/me")
def me(user = Depends(get_current_user)):
    return {"id": user.id, "phone": user.phone, "role": user.role}

@router.get("/admin/dashboard")
def admin_dashboard(user = Depends(require_role("admin"))):
    return {"msg": f"Welcome admin {user.phone}"}
