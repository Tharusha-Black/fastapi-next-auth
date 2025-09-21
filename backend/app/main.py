# backend/app/main.py
from .routers import protected
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import engine, Base
from .core.config import FRONTEND_URL
from .routers import auth as auth_router, users as users_router

# create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FastAPI JWT Refresh + RBAC")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(protected.router)