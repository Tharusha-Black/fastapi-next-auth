# FastAPI + Next.js JWT Authentication Example

This is a sample project demonstrating how to implement **JWT authentication** using **FastAPI** for the backend and **Next.js** for the frontend. The project includes **access tokens**, **refresh tokens**, and a **live dashboard** showing API logs and token refresh steps.

---

## Features

- FastAPI backend with JWT authentication
- Access tokens & refresh tokens
- Protected routes
- Automatic token refresh on expiration
- Next.js frontend with:
  - Auto-refreshing protected API calls every 10 seconds
  - Live log of API requests, responses, and refresh steps
  - Visual feedback for success, info, and errors

---

## Tech Stack

- **Backend:** FastAPI, SQLAlchemy, Pydantic
- **Frontend:** Next.js 13, React, TypeScript
- **Authentication:** JWT (access & refresh tokens)
- **UI:** TailwindCSS, react-icons

---

## Project Structure

backend/
├── app/
│ ├── main.py
│ ├── routers/
│ │ ├── auth.py # JWT login, refresh, logout
│ │ └── protected.py # Protected API routes
│ ├── crud.py # DB operations
│ ├── auth.py # JWT utils (access + refresh)
│ └── schemas.py # Pydantic models
frontend/
├── src/
│ ├── app/
│ │ └── dashboard/
│ │ └── page.tsx # Live dashboard + API logs
│ ├── components/
│ │ └── AuthProvider.tsx
│ └── lib/
│ └── api.ts # Axios instance + interceptors


---

## Setup

### Backend

1. Create virtual environment and install dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt


uvicorn app.main:app --reload --port 8000

cd frontend
npm install
npm run dev

```

---

## Usage

Navigate to http://localhost:3000/login

Login with default credentials (configured in DB):
Phone: 0000000000
Password: admin123

