from fastapi import APIRouter, Depends

from app.database import settings_collection
from app.schemas.settings import SettingsResponse
from app.security import require_admin

router = APIRouter(prefix="/api/settings", tags=["Settings"])

DEFAULT_SETTINGS = {
    "unitPrice": 180,
    "advancePercent": 10,
    "qrCodeUrl": "",
    "tiers": [
        {"minQty": 1, "maxQty": 10, "pricePerTray": 180},
        {"minQty": 11, "maxQty": 50, "pricePerTray": 165},
        {"minQty": 51, "maxQty": None, "pricePerTray": 150},
    ],
}


async def get_or_create_settings() -> dict:
    settings = await settings_collection.find_one({"key": "default"})
    if settings:
        return settings

    settings = {"key": "default", **DEFAULT_SETTINGS}
    await settings_collection.insert_one(settings)
    return settings


def clean_settings(settings: dict) -> dict:
    return {
        "unitPrice": settings["unitPrice"],
        "advancePercent": settings["advancePercent"],
        "qrCodeUrl": settings.get("qrCodeUrl", ""),
        "tiers": settings["tiers"],
    }


@router.get("", response_model=SettingsResponse)
async def get_settings():
    settings = await get_or_create_settings()
    return clean_settings(settings)


@router.put("", response_model=SettingsResponse)
async def update_settings(payload: SettingsResponse, _admin=Depends(require_admin)):
    next_settings = payload.model_dump()
    await settings_collection.update_one(
        {"key": "default"},
        {"$set": next_settings},
        upsert=True,
    )
    return next_settings
