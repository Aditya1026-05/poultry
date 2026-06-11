from datetime import datetime, timezone
import csv
import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from app.database import expenses_collection
from app.schemas.expenses import ExpenseRequest, ExpenseResponse, ExpenseUpdateRequest
from app.security import require_admin

router = APIRouter(prefix="/api/expenses", tags=["Expenses"])


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_expense(expense: dict) -> dict:
    return {
        "id": expense["id"],
        "title": expense["title"],
        "category": expense["category"],
        "amount": expense["amount"],
        "description": expense.get("description", ""),
        "expenseDate": expense["expenseDate"],
        "createdAt": expense["createdAt"],
        "updatedAt": expense["updatedAt"],
    }


def build_expense_query(
    startDate: str | None = None,
    endDate: str | None = None,
    category: str | None = None,
) -> dict:
    query: dict = {}

    if startDate or endDate:
        date_filter: dict = {}
        if startDate:
            date_filter["$gte"] = startDate
        if endDate:
            date_filter["$lte"] = endDate
        query["expenseDate"] = date_filter

    if category:
        query["category"] = category

    return query


@router.post("", response_model=ExpenseResponse)
async def create_expense(payload: ExpenseRequest, _admin=Depends(require_admin)):
    timestamp = now_iso()
    expense = {
        "id": str(uuid.uuid4()),
        "title": payload.title,
        "category": payload.category,
        "amount": payload.amount,
        "description": payload.description,
        "expenseDate": payload.expenseDate,
        "createdAt": timestamp,
        "updatedAt": timestamp,
    }
    await expenses_collection.insert_one(expense)
    # Trigger real-time alert generation upon business event
    from app.services.alert_engine import generate_alerts
    await generate_alerts()
    return clean_expense(expense)



@router.get("", response_model=list[ExpenseResponse])
async def get_expenses(
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    category: str | None = Query(None),
    _admin=Depends(require_admin),
):
    query = build_expense_query(startDate, endDate, category)
    cursor = expenses_collection.find(query).sort("expenseDate", -1)
    return [clean_expense(expense) async for expense in cursor]


@router.get("/kpis")
async def expense_kpis(_admin=Depends(require_admin)):
    today = datetime.now(timezone.utc).date().isoformat()
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")
    today_expenses = 0
    month_expenses = 0
    total_expenses = 0

    cursor = expenses_collection.find({})
    async for expense in cursor:
        amount = expense["amount"]
        expense_date = expense["expenseDate"]
        total_expenses += amount
        if expense_date == today:
            today_expenses += amount
        if expense_date.startswith(current_month):
            month_expenses += amount

    return {
        "todayExpenses": today_expenses,
        "monthExpenses": month_expenses,
        "totalExpenses": total_expenses,
    }


@router.get("/trends")
async def expense_trends(
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    category: str | None = Query(None),
    _admin=Depends(require_admin),
):
    query = build_expense_query(startDate, endDate, category)
    monthly_data: dict[str, dict[str, int]] = {}
    cursor = expenses_collection.find(query)

    async for expense in cursor:
        month = expense["expenseDate"][:7]
        if month not in monthly_data:
            monthly_data[month] = {"expenses": 0, "records": 0}
        monthly_data[month]["expenses"] += expense["amount"]
        monthly_data[month]["records"] += 1

    return [
        {
            "month": month,
            "expenses": monthly_data[month]["expenses"],
            "records": monthly_data[month]["records"],
        }
        for month in sorted(monthly_data.keys())
    ]


@router.get("/export")
async def export_expenses_csv(
    startDate: str | None = Query(None),
    endDate: str | None = Query(None),
    category: str | None = Query(None),
    _admin=Depends(require_admin),
):
    query = build_expense_query(startDate, endDate, category)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Title", "Category", "Amount", "Description"])

    cursor = expenses_collection.find(query).sort("expenseDate", -1)
    async for expense in cursor:
        writer.writerow(
            [
                expense["expenseDate"],
                expense["title"],
                expense["category"],
                expense["amount"],
                expense.get("description", ""),
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"},
    )


@router.patch("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    payload: ExpenseUpdateRequest,
    _admin=Depends(require_admin),
):
    expense = await expenses_collection.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    patch = payload.model_dump(exclude_unset=True)
    patch["updatedAt"] = now_iso()
    await expenses_collection.update_one({"id": expense_id}, {"$set": patch})
    # Trigger real-time alert generation upon business event
    from app.services.alert_engine import generate_alerts
    await generate_alerts()
    updated = await expenses_collection.find_one({"id": expense_id})
    return clean_expense(updated)


@router.delete("/{expense_id}")
async def delete_expense(expense_id: str, _admin=Depends(require_admin)):
    result = await expenses_collection.delete_one({"id": expense_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Expense not found")
    # Trigger real-time alert generation upon business event
    from app.services.alert_engine import generate_alerts
    await generate_alerts()
    return {"message": "Expense deleted"}
