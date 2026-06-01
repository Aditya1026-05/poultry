from typing import Literal

from pydantic import BaseModel, Field


OrderStatus = Literal[
    "pending_payment_review",
    "confirmed",
    "delivered",
    "completed",
    "rejected",
]


class CreateOrderRequest(BaseModel):
    quantity: int = Field(ge=1)
    preferredDeliveryDate: str
    paymentScreenshot: str


class UpdateOrderRequest(BaseModel):
    status: OrderStatus | None = None
    advancePaid: bool | None = None
    finalPaid: bool | None = None
    confirmedDeliveryDate: str | None = None
    advanceAmount: int | None = Field(default=None, ge=0)
    adminNote: str | None = None


class OrderResponse(BaseModel):
    id: str
    userId: str
    businessName: str
    email: str
    phone: str
    quantity: int
    pricePerTray: int
    totalAmount: int
    advancePercent: int
    advanceAmount: int
    finalAmount: int
    preferredDeliveryDate: str
    confirmedDeliveryDate: str | None
    paymentScreenshot: str
    status: OrderStatus
    advancePaid: bool
    finalPaid: bool
    createdAt: str
    updatedAt: str
    adminNote: str | None = None
