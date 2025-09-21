# backend/app/crud.py
from sqlalchemy.orm import Session
from . import models, auth
from datetime import datetime

def get_user_by_phone(db: Session, phone: str):
    return db.query(models.User).filter(models.User.phone == phone).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, phone: str, password: str, role: str = "user"):
    pw_hash = auth.hash_password(password)
    user = models.User(phone=phone, password_hash=pw_hash, role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def store_refresh_token(db: Session, user_id: int, jti: str, expires_at: datetime):
    jti_hash = auth.hash_jti(jti)
    token = models.RefreshToken(user_id=user_id, jti_hash=jti_hash, expires_at=expires_at)
    db.add(token)
    db.commit()
    db.refresh(token)
    return token

def revoke_refresh_token(db: Session, user_id: int, jti: str):
    # find tokens for user and compare jti by verifying hash
    tokens = db.query(models.RefreshToken).filter(models.RefreshToken.user_id == user_id).all()
    for t in tokens:
        if auth.verify_jti(jti, t.jti_hash):
            db.delete(t)
            db.commit()
            return True
    return False

def revoke_all_user_refresh_tokens(db: Session, user_id: int):
    db.query(models.RefreshToken).filter(models.RefreshToken.user_id == user_id).delete()
    db.commit()
