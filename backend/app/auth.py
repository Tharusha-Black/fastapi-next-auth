# backend/app/auth.py
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import secrets
from uuid import uuid4

from .core.config import JWT_SECRET, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    token = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return token


def create_refresh_token_jwt(user_id: int):
    jti = uuid4().hex
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "jti": jti, "exp": expire, "type": "refresh"}
    token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    return token, jti, expire


def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


# hash/verify a jti (used to store hashed jti in DB)
def hash_jti(jti: str) -> str:
    return pwd_ctx.hash(jti)

def verify_jti(jti: str, jti_hash: str) -> bool:
    return pwd_ctx.verify(jti, jti_hash)

