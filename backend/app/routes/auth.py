from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import APIRouter, HTTPException, Depends
from app.database import users_collection
from app.emailer import send_password_reset_email
from app.config import settings
from app.schemas.auth import (
    SignupRequest,
    LoginRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthResponse,
)
from app.security import hash_password, verify_password, create_access_token, get_current_user
import uuid

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def clean_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "businessName": user["businessName"],
        "phone": user["phone"],
        "role": user["role"],
        "createdAt": user["createdAt"],
    }


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/signup", response_model=AuthResponse)
async def signup(payload: SignupRequest):
    existing = await users_collection.find_one({"email": payload.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    user = {
        "id": str(uuid.uuid4()),
        "email": payload.email.lower(),
        "password": hash_password(payload.password),
        "businessName": payload.businessName,
        "phone": payload.phone,
        "role": "customer",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }

    await users_collection.insert_one(user)

    token = create_access_token(user["id"])
    return {"user": clean_user(user), "token": token}


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    user = await users_collection.find_one({"email": payload.email.lower()})

    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token(user["id"])
    return {"user": clean_user(user), "token": token}


@router.get("/me")
async def me(user=Depends(get_current_user)):
    return clean_user(user)


@router.patch("/change-password")
async def change_password(payload: ChangePasswordRequest, user=Depends(get_current_user)):
    if not verify_password(payload.currentPassword, user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    await users_collection.update_one(
        {"id": user["id"]},
        {"$set": {"password": hash_password(payload.newPassword)}},
    )
    return {"message": "Password updated successfully."}


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    user = await users_collection.find_one({"email": payload.email.lower()})
    if user:
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.password_reset_expire_minutes)
        await users_collection.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "passwordResetToken": hash_reset_token(token),
                    "passwordResetExpiresAt": expires_at.isoformat(),
                }
            },
        )
        reset_url = f"{settings.frontend_url.rstrip('/')}/reset-password?token={token}"
        send_password_reset_email(user["email"], reset_url)

    return {"message": "If an account exists for that email, a reset link has been sent."}


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    token_hash = hash_reset_token(payload.token)
    user = await users_collection.find_one({"passwordResetToken": token_hash})
    if not user or not user.get("passwordResetExpiresAt"):
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    expires_at = datetime.fromisoformat(user["passwordResetExpiresAt"])
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link.")

    await users_collection.update_one(
        {"id": user["id"]},
        {
            "$set": {"password": hash_password(payload.newPassword)},
            "$unset": {"passwordResetToken": "", "passwordResetExpiresAt": ""},
        },
    )
    return {"message": "Password reset successfully."}
