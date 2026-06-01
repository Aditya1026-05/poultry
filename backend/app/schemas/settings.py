from pydantic import BaseModel, Field


class PriceTier(BaseModel):
    minQty: int = Field(ge=1)
    maxQty: int | None = None
    pricePerTray: int = Field(ge=0)


class SettingsResponse(BaseModel):
    unitPrice: int = Field(ge=0)
    advancePercent: int = Field(ge=0, le=100)
    qrCodeUrl: str
    tiers: list[PriceTier]
