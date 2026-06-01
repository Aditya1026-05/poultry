from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException

from app.database import orders_collection
from app.routes.settings import get_or_create_settings
from app.schemas.orders import CreateOrderRequest, OrderResponse, UpdateOrderRequest
from app.security import get_current_user, require_admin

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_price_for_quantity(quantity: int, settings: dict) -> int:
    for tier in settings["tiers"]:
        min_qty = tier["minQty"]
        max_qty = tier.get("maxQty")
        if quantity >= min_qty and (max_qty is None or quantity <= max_qty):
            return tier["pricePerTray"]
    return settings["unitPrice"]


def clean_order(order: dict) -> dict:
    return {
        "id": order["id"],
        "userId": order["userId"],
        "businessName": order["businessName"],
        "email": order["email"],
        "phone": order["phone"],
        "quantity": order["quantity"],
        "pricePerTray": order["pricePerTray"],
        "totalAmount": order["totalAmount"],
        "advancePercent": order["advancePercent"],
        "advanceAmount": order["advanceAmount"],
        "finalAmount": order["finalAmount"],
        "preferredDeliveryDate": order["preferredDeliveryDate"],
        "confirmedDeliveryDate": order.get("confirmedDeliveryDate"),
        "paymentScreenshot": order["paymentScreenshot"],
        "status": order["status"],
        "advancePaid": order["advancePaid"],
        "finalPaid": order["finalPaid"],
        "createdAt": order["createdAt"],
        "updatedAt": order["updatedAt"],
        "adminNote": order.get("adminNote"),
    }


@router.post("", response_model=OrderResponse)
async def create_order(payload: CreateOrderRequest, user=Depends(get_current_user)):
    settings = await get_or_create_settings()
    price_per_tray = get_price_for_quantity(payload.quantity, settings)
    total_amount = price_per_tray * payload.quantity
    advance_percent = settings["advancePercent"]
    advance_amount = round((total_amount * advance_percent) / 100)
    created_at = now_iso()

    order = {
        "id": str(uuid.uuid4()),
        "userId": user["id"],
        "businessName": user["businessName"],
        "email": user["email"],
        "phone": user["phone"],
        "quantity": payload.quantity,
        "pricePerTray": price_per_tray,
        "totalAmount": total_amount,
        "advancePercent": advance_percent,
        "advanceAmount": advance_amount,
        "finalAmount": total_amount - advance_amount,
        "preferredDeliveryDate": payload.preferredDeliveryDate,
        "confirmedDeliveryDate": None,
        "paymentScreenshot": payload.paymentScreenshot,
        "status": "pending_payment_review",
        "advancePaid": False,
        "finalPaid": False,
        "createdAt": created_at,
        "updatedAt": created_at,
    }

    await orders_collection.insert_one(order)
    return clean_order(order)


@router.get("/mine", response_model=list[OrderResponse])
async def get_my_orders(user=Depends(get_current_user)):
    cursor = orders_collection.find({"userId": user["id"]}).sort("createdAt", -1)
    return [clean_order(order) async for order in cursor]


@router.get("", response_model=list[OrderResponse])
async def get_all_orders(_admin=Depends(require_admin)):
    cursor = orders_collection.find({}).sort("createdAt", -1)
    return [clean_order(order) async for order in cursor]


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: str, payload: UpdateOrderRequest, _admin=Depends(require_admin)):
    order = await orders_collection.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    patch = payload.model_dump(exclude_unset=True)
    if "advanceAmount" in patch:
        patch["finalAmount"] = order["totalAmount"] - patch["advanceAmount"]
    patch["updatedAt"] = now_iso()

    await orders_collection.update_one({"id": order_id}, {"$set": patch})
    updated = await orders_collection.find_one({"id": order_id})
    return clean_order(updated)
