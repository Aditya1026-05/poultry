import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi import Query
from app.database import orders_collection
from app.routes.settings import get_or_create_settings
from app.schemas.orders import CreateOrderRequest, OrderResponse, UpdateOrderRequest
from app.security import get_current_user, require_admin

from fastapi.responses import StreamingResponse
import io
import csv

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def build_revenue_query(startDate: str | None = None, endDate: str | None = None) -> dict:
    query = {"status": "completed"}
    if startDate or endDate:
        date_filter: dict = {}
        if startDate:
            date_filter["$gte"] = startDate + "T00:00:00+00:00"
        if endDate:
            date_filter["$lte"] = endDate + "T23:59:59.999999+00:00"
        query["createdAt"] = date_filter
    return query


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

@router.get("/revenue/overview")
async def revenue_overview():

    completed_orders = await orders_collection.count_documents(
        {"status": "completed"}
    )

    cursor = orders_collection.find(
        {"status": "completed"}
    )

    total_revenue = 0

    async for order in cursor:
        total_revenue += order["totalAmount"]

    average_order_value = (
        total_revenue / completed_orders
        if completed_orders > 0
        else 0
    )

    return {
        "completedOrders": completed_orders,
        "totalRevenue": total_revenue,
        "averageOrderValue": round(average_order_value, 2)
    }

@router.get("/revenue/records")
async def revenue_records(
    startDate: str | None = Query(None),
    endDate: str | None = Query(None)
):
    query = build_revenue_query(startDate, endDate)

    cursor = orders_collection.find(query).sort(
        "createdAt",
        -1
    )

    records = []

    async for order in cursor:
        records.append({
            "id": order["id"],
            "businessName": order["businessName"],
            "quantity": order["quantity"],
            "totalAmount": order["totalAmount"],
            "createdAt": order["createdAt"]
        })

    return records

@router.get("/revenue/kpis")
async def revenue_kpis():

    completed_orders = 0
    total_revenue = 0
    today_revenue = 0
    month_revenue = 0

    today = datetime.now(timezone.utc).date().isoformat()
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")

    cursor = orders_collection.find(
        {"status": "completed"}
    )

    async for order in cursor:

        completed_orders += 1

        amount = order["totalAmount"]

        total_revenue += amount

        if order["createdAt"].startswith(today):
            today_revenue += amount

        if order["createdAt"].startswith(current_month):
            month_revenue += amount

    average_order_value = (
        total_revenue / completed_orders
        if completed_orders > 0
        else 0
    )

    return {
    "todayRevenue": today_revenue,
    "monthRevenue": month_revenue,
    "totalRevenue": total_revenue,
    "completedOrders": completed_orders,
    "averageOrderValue": round(average_order_value, 2)
}

@router.get("/revenue/trends")
async def revenue_trends():

        monthly_data = {}

        cursor = orders_collection.find(
            {"status": "completed"}
        )

        async for order in cursor:

            month = order["createdAt"][:7]

            if month not in monthly_data:
                monthly_data[month] = {
                    "revenue": 0,
                    "orders": 0
                }

            monthly_data[month]["revenue"] += order["totalAmount"]
            monthly_data[month]["orders"] += 1

        result = []

        for month in sorted(monthly_data.keys()):
            result.append({
                "month": month,
                "revenue": monthly_data[month]["revenue"],
                "orders": monthly_data[month]["orders"]
            })

        return result

@router.get("/revenue/export")
async def export_revenue_csv(
    startDate: str | None = Query(None),
    endDate: str | None = Query(None)
):

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "Date",
        "Business Name",
        "Quantity",
        "Revenue"
    ])

    cursor = orders_collection.find(
        build_revenue_query(startDate, endDate)
    ).sort("createdAt", -1)

    async for order in cursor:
        writer.writerow([
            order["createdAt"][:10],
            order["businessName"],
            order["quantity"],
            order["totalAmount"]
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            "attachment; filename=revenue.csv"
        }
    )

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
