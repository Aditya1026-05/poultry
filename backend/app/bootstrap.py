from datetime import datetime, timezone
import uuid

from app.config import settings
from app.database import users_collection
from app.security import hash_password


async def ensure_admin_user() -> None:
    existing_admin = await users_collection.find_one({"role": "admin"})
    if existing_admin:
        return

    existing_user = await users_collection.find_one({"email": settings.admin_email.lower()})
    if existing_user:
        await users_collection.update_one(
            {"id": existing_user["id"]},
            {
                "$set": {
                    "password": hash_password(settings.admin_password),
                    "businessName": settings.admin_business_name,
                    "phone": settings.admin_phone,
                    "role": "admin",
                }
            },
        )
        return

    admin = {
        "id": str(uuid.uuid4()),
        "email": settings.admin_email.lower(),
        "password": hash_password(settings.admin_password),
        "businessName": settings.admin_business_name,
        "phone": settings.admin_phone,
        "role": "admin",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    await users_collection.insert_one(admin)
