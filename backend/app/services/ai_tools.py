from app.routes.profit import (
    collect_revenue_by_month,
    collect_expenses_by_month,
)
from datetime import datetime, timezone

from app.database import orders_collection


async def get_profit_summary():
    total_revenue, _ = await collect_revenue_by_month()
    total_expenses, _ = await collect_expenses_by_month()

    net_profit = total_revenue - total_expenses

    profit_margin = (
        (net_profit / total_revenue * 100)
        if total_revenue
        else 0
    )

    return {
        "totalRevenue": total_revenue,
        "totalExpenses": total_expenses,
        "netProfit": net_profit,
        "profitMargin": round(profit_margin, 2),
    }



async def get_revenue_summary():

    today = datetime.now(timezone.utc).date().isoformat()
    current_month = datetime.now(timezone.utc).strftime("%Y-%m")

    pipeline = [
        {"$match": {"status": "completed"}},
        {
            "$group": {
                "_id": None,
                "completedOrders": {"$sum": 1},
                "totalRevenue": {"$sum": "$totalAmount"},
                "todayRevenue": {
                    "$sum": {
                        "$cond": [
                            {"$eq": [{"$substr": ["$createdAt", 0, 10]}, today]},
                            "$totalAmount",
                            0,
                        ]
                    }
                },
                "monthRevenue": {
                    "$sum": {
                        "$cond": [
                            {"$eq": [{"$substr": ["$createdAt", 0, 7]}, current_month]},
                            "$totalAmount",
                            0,
                        ]
                    }
                },
            }
        },
    ]

    result = await orders_collection.aggregate(
        pipeline
    ).to_list(length=1)

    if not result:
        return {
            "todayRevenue": 0,
            "monthRevenue": 0,
            "totalRevenue": 0,
            "completedOrders": 0,
        }

    return result[0]