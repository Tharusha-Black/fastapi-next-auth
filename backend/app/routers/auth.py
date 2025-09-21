# backend/app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

from ..db import get_db
from .. import crud, auth, schemas

router = APIRouter(prefix="/api/auth", tags=["auth"])
class UserOut(BaseModel):
    id: int
    phone: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# login route
@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: dict, response: Response, db: Session = Depends(get_db)):
    user = crud.get_user_by_phone(db, payload.get("phone"))
    if not user or not auth.verify_password(payload.get("password"), user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth.create_access_token({"sub": str(user.id), "role": user.role})

    # create refresh token
    refresh_jwt, jti, expires_at = auth.create_refresh_token_jwt(user.id)
    crud.store_refresh_token(db, user.id, jti, expires_at)
    response.set_cookie(
        key="refresh_token",
        value=refresh_jwt,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/api/auth"
    )

    # return Pydantic model instance, not raw dict
    return schemas.TokenResponse(
        user=schemas.UserOut(id=user.id, phone=user.phone, role=user.role),
        access_token=access_token,
        token_type="bearer"
    )
# refresh route (rotates refresh tokens)
@router.post("/refresh", response_model=schemas.TokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")

    payload = auth.decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user_id = int(payload.get("sub"))
    jti = payload.get("jti")
    if not user_id or not jti:
        raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    # verify stored hash exists for this user and matches jti
    # We use revoke_refresh_token to find and delete the matched token (rotation)
    ok = crud.revoke_refresh_token(db, user_id, jti)
    if not ok:
        # token not found / already used / revoked
        raise HTTPException(status_code=401, detail="Refresh token revoked or invalid")

    # issue new refresh token (rotation)
    new_refresh_jwt, new_jti, expires_at = auth.create_refresh_token_jwt(user_id)
    crud.store_refresh_token(db, user_id, new_jti, expires_at)

    # set new cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_jwt,
        httponly=True,
        secure=False,  # set True in prod
        samesite="lax",
        path="/api/auth"
    )

    # new access token
    user = crud.get_user(db, user_id)
    access_token = auth.create_access_token({"sub": str(user.id), "role": user.role})
    return schemas.TokenResponse(
        user=schemas.UserOut(id=user.id, phone=user.phone, role=user.role),
        access_token=access_token,
        token_type="bearer"
    )

# logout: revoke the refresh token (if present)
@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    token = request.cookies.get("refresh_token")
    if token:
        payload = auth.decode_token(token)
        if payload and payload.get("jti") and payload.get("sub"):
            crud.revoke_refresh_token(db, int(payload["sub"]), payload["jti"])
    # clear cookie
    response.delete_cookie("refresh_token", path="/api/auth")
    return {"msg": "logged out"}
