# backend/app/core/config.py
import os

JWT_SECRET = os.getenv("JWT_SECRET", "dev_secret_change_me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
