from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import csv
import io
import re
import uuid
import logging
import bcrypt
import jwt as pyjwt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

from email_service import send_lead_notification


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


# JWT configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = 24
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@drishti-aidc.com').lower().strip()
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'Drishti@2026')
LOCKOUT_MAX = int(os.environ.get('LOGIN_LOCKOUT_MAX_ATTEMPTS', '5'))
LOCKOUT_WINDOW = int(os.environ.get('LOGIN_LOCKOUT_WINDOW_MIN', '15'))


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": "admin",
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_admin(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme)) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = creds.credentials
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("type") != "access" or payload.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Invalid token type")
    user = await db.users.find_one({"id": payload["sub"], "role": "admin"}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Admin not found")
    return user


# ---------- Models ----------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


class InquiryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=40)
    company: Optional[str] = Field(default=None, max_length=160)
    interested_in: Optional[str] = Field(default=None, max_length=80)
    message: str = Field(..., min_length=5, max_length=2000)


class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    interested_in: Optional[str] = None
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AdminLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=200)


class AdminUser(BaseModel):
    id: str
    email: str
    role: str
    created_at: Optional[datetime] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: AdminUser


# ---------- App ----------
app = FastAPI(title="DRISHTI - Auto ID Solution API")
api_router = APIRouter(prefix="/api")


# ---------- Public Routes ----------
@api_router.get("/")
async def root():
    return {"message": "DRISHTI Auto ID Solution API", "status": "ok"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for c in status_checks:
        if isinstance(c.get('timestamp'), str):
            c['timestamp'] = datetime.fromisoformat(c['timestamp'])
    return status_checks


@api_router.post("/inquiries", response_model=Inquiry, status_code=201)
async def create_inquiry(payload: InquiryCreate, background: BackgroundTasks):
    inquiry = Inquiry(**payload.model_dump())
    doc = inquiry.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.inquiries.insert_one(doc)
    # Non-blocking email notification — silently skipped if keys unset
    background.add_task(send_lead_notification, doc)
    return inquiry


@api_router.get("/inquiries", response_model=List[Inquiry])
async def list_inquiries_public(limit: int = 100):
    """Kept for backwards compatibility with public test clients."""
    items = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    for i in items:
        if isinstance(i.get('created_at'), str):
            i['created_at'] = datetime.fromisoformat(i['created_at'])
    return items


# ---------- Admin Routes ----------
async def _get_lockout(identifier: str) -> Optional[datetime]:
    rec = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0})
    if not rec:
        return None
    until_raw = rec.get("locked_until")
    if not until_raw:
        return None
    try:
        until = datetime.fromisoformat(until_raw) if isinstance(until_raw, str) else until_raw
    except ValueError:
        return None
    if until and until > datetime.now(timezone.utc):
        return until
    return None


async def _record_failed_login(identifier: str) -> dict:
    now = datetime.now(timezone.utc)
    existing = await db.login_attempts.find_one({"identifier": identifier}, {"_id": 0}) or {}
    attempts = int(existing.get("attempts", 0)) + 1
    update = {"identifier": identifier, "attempts": attempts, "last_attempt": now.isoformat()}
    if attempts >= LOCKOUT_MAX:
        update["locked_until"] = (now + timedelta(minutes=LOCKOUT_WINDOW)).isoformat()
        update["attempts"] = 0  # reset counter; lockout window enforces the wait
    await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
    return update


async def _clear_login_attempts(identifier: str) -> None:
    await db.login_attempts.delete_one({"identifier": identifier})


@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(payload: AdminLogin, request: Request):
    email = payload.email.lower().strip()
    client_ip = (request.client.host if request.client else "unknown") or "unknown"
    identifier = f"{client_ip}:{email}"

    locked_until = await _get_lockout(identifier)
    if locked_until:
        retry_seconds = max(1, int((locked_until - datetime.now(timezone.utc)).total_seconds()))
        raise HTTPException(
            status_code=429,
            detail=f"Too many failed attempts. Try again in {retry_seconds // 60 + 1} minute(s).",
            headers={"Retry-After": str(retry_seconds)},
        )

    user = await db.users.find_one({"email": email, "role": "admin"})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await _record_failed_login(identifier)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    await _clear_login_attempts(identifier)
    token = create_access_token(user["id"], email)
    return LoginResponse(
        access_token=token,
        expires_in=JWT_EXPIRY_HOURS * 3600,
        user=AdminUser(id=user["id"], email=email, role="admin", created_at=user.get("created_at")),
    )


@api_router.get("/admin/me", response_model=AdminUser)
async def admin_me(current: dict = Depends(get_current_admin)):
    return AdminUser(
        id=current["id"],
        email=current["email"],
        role=current["role"],
        created_at=current.get("created_at"),
    )


@api_router.get("/admin/inquiries")
async def admin_list_inquiries(
    limit: int = Query(50, ge=1, le=500),
    skip: int = Query(0, ge=0),
    q: Optional[str] = None,
    current: dict = Depends(get_current_admin),
):
    filt: dict = {}
    if q:
        safe = re.escape(q)
        filt = {
            "$or": [
                {"name": {"$regex": safe, "$options": "i"}},
                {"email": {"$regex": safe, "$options": "i"}},
                {"company": {"$regex": safe, "$options": "i"}},
                {"interested_in": {"$regex": safe, "$options": "i"}},
                {"message": {"$regex": safe, "$options": "i"}},
            ]
        }
    total = await db.inquiries.count_documents(filt)
    items = (
        await db.inquiries.find(filt, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
        .to_list(limit)
    )
    return {"total": total, "limit": limit, "skip": skip, "items": items}


@api_router.get("/admin/inquiries/export.csv")
async def admin_export_inquiries(current: dict = Depends(get_current_admin)):
    items = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(10000)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["id", "created_at", "name", "email", "phone", "company", "interested_in", "message"])
    for i in items:
        writer.writerow([
            i.get("id", ""),
            i.get("created_at", ""),
            i.get("name", ""),
            i.get("email", ""),
            i.get("phone", "") or "",
            i.get("company", "") or "",
            i.get("interested_in", "") or "",
            (i.get("message", "") or "").replace("\r", " ").replace("\n", " "),
        ])
    buf.seek(0)
    filename = f"drishti-inquiries-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@api_router.delete("/admin/inquiries/{inquiry_id}")
async def admin_delete_inquiry(inquiry_id: str, current: dict = Depends(get_current_admin)):
    result = await db.inquiries.delete_one({"id": inquiry_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"ok": True, "deleted": inquiry_id}


# ---------- Startup ----------
async def seed_admin():
    existing = await db.users.find_one({"email": ADMIN_EMAIL})
    if existing is None:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": ADMIN_EMAIL,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Admin seeded: {ADMIN_EMAIL}")
    else:
        # Keep hash in sync with .env password (idempotent updates)
        if not verify_password(ADMIN_PASSWORD, existing.get("password_hash", "")):
            await db.users.update_one(
                {"email": ADMIN_EMAIL},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info(f"Admin password hash refreshed for {ADMIN_EMAIL}")


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.inquiries.create_index([("created_at", -1)])
    await db.login_attempts.create_index("identifier", unique=True)
    await seed_admin()


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
