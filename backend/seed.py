# backend/seed.py
from app.db import SessionLocal, engine, Base
from app import crud

# create tables (already called in main but safe)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
# create admin if not exists
if not crud.get_user_by_phone(db, "0000000000"):
    crud.create_user(db, phone="0000000000", password="admin123", role="admin")
    print("created admin (phone 0000000000 / password admin123)")
else:
    print("admin exists")
db.close()
