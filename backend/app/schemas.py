# backend/app/schemas.py
from pydantic import BaseModel

class UserOut(BaseModel):
    id: int
    phone: str
    role: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut
