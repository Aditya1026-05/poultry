from fastapi import APIRouter, Depends

from app.database import expenses_collection, orders_collection
from app.security import require_admin

router = APIRouter(prefix="/api/profit", tags=["Profit"])


async def collect_revenue_by_month() -> tuple[int, dict[str, int]]:
    total_revenue = 0
    by_month: dict[str, int] = {}
    cursor = orders_collection.find({"status": "completed"})

    async for order in cursor:
        amount = order["totalAmount"]
        month = order["createdAt"][:7]
        total_revenue += amount
        by_month[month] = by_month.get(month, 0) + amount

    return total_revenue, by_month


async def collect_expenses_by_month() -> tuple[int, dict[str, int]]:
    total_expenses = 0
    by_month: dict[str, int] = {}
    cursor = expenses_collection.find({})

    async for expense in cursor:
        amount = expense["amount"]
        month = expense["expenseDate"][:7]
        total_expenses += amount
        by_month[month] = by_month.get(month, 0) + amount

    return total_expenses, by_month


@router.get("/kpis")
async def profit_kpis(_admin=Depends(require_admin)):
    total_revenue, _revenue_by_month = await collect_revenue_by_month()
    total_expenses, _expenses_by_month = await collect_expenses_by_month()
    net_profit = total_revenue - total_expenses
    profit_margin = (net_profit / total_revenue * 100) if total_revenue else 0

    return {
        "totalRevenue": total_revenue,
        "totalExpenses": total_expenses,
        "netProfit": net_profit,
        "profitMargin": round(profit_margin, 2),
    }


@router.get("/trends")
async def profit_trends(_admin=Depends(require_admin)):
    _total_revenue, revenue_by_month = await collect_revenue_by_month()
    _total_expenses, expenses_by_month = await collect_expenses_by_month()
    months = sorted(set(revenue_by_month.keys()) | set(expenses_by_month.keys()))

    return [
        {
            "month": month,
            "revenue": revenue_by_month.get(month, 0),
            "expenses": expenses_by_month.get(month, 0),
            "profit": revenue_by_month.get(month, 0) - expenses_by_month.get(month, 0),
        }
        for month in months
    ]
