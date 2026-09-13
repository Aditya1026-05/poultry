from datetime import datetime
from fastapi import APIRouter, BackgroundTasks, Depends, status
from pydantic import BaseModel, EmailStr, Field

from app.database import inquiries_collection
from app.emailer import send_contact_inquiry_email
from app.security import require_admin

router = APIRouter(prefix="/api/contact", tags=["Contact"])


class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field("", max_length=30)
    message: str = Field(..., min_length=1, max_length=3000)


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_contact_message(
    data: ContactMessageCreate,
    background_tasks: BackgroundTasks
):
    doc = {
        "name": data.name.strip(),
        "email": data.email.strip().lower(),
        "phone": data.phone.strip(),
        "message": data.message.strip(),
        "createdAt": datetime.utcnow().isoformat(),
        "status": "new",
    }
    await inquiries_collection.insert_one(doc)

    # Dispatch email in background so API responds without lag
    background_tasks.add_task(
        send_contact_inquiry_email,
        name=doc["name"],
        email=doc["email"],
        message_text=doc["message"],
        phone=doc["phone"],
    )

    return {
        "status": "success",
        "message": "Thank you! Your message has been received and we will get back to you soon."
    }


@router.get("", dependencies=[Depends(require_admin)])
async def list_contact_inquiries():
    cursor = inquiries_collection.find().sort("createdAt", -1).limit(100)
    inquiries = []
    async for item in cursor:
        item["id"] = str(item.pop("_id"))
        inquiries.append(item)
    return inquiries
