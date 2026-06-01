from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    businessName: str
    phone: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(min_length=6)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str = Field(min_length=6)


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    businessName: str
    phone: str
    role: str
    createdAt: str


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
