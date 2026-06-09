from app.routes.profit import (
    collect_revenue_by_month,
    collect_expenses_by_month,
)
from datetime import datetime, timezone

from app.database import (
    orders_collection,
    expenses_collection,
)

from collections import defaultdict

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


async def get_orders_summary():

    total_orders = await orders_collection.count_documents({})

    pending_review = await orders_collection.count_documents(
        {"status": "pending_payment_review"}
    )

    confirmed = await orders_collection.count_documents(
        {"status": "confirmed"}
    )

    delivered = await orders_collection.count_documents(
        {"status": "delivered"}
    )

    completed = await orders_collection.count_documents(
        {"status": "completed"}
    )

    rejected = await orders_collection.count_documents(
        {"status": "rejected"}
    )

    total_trays = 0

    cursor = orders_collection.find({})

    async for order in cursor:
        total_trays += order["quantity"]

    return {
        "totalOrders": total_orders,
        "pendingReview": pending_review,
        "confirmed": confirmed,
        "delivered": delivered,
        "completed": completed,
        "rejected": rejected,
        "totalTrays": total_trays,
    }

async def get_expenses_summary():

    total_expenses = 0
    total_records = 0

    cursor = expenses_collection.find({})

    async for expense in cursor:
        total_expenses += expense["amount"]
        total_records += 1

    return {
        "totalExpenses": total_expenses,
        "expenseRecords": total_records,
    }

async def get_expense_categories():

    category_totals = {}

    cursor = expenses_collection.find({})

    async for expense in cursor:

        category = expense["category"]
        amount = expense["amount"]

        category_totals[category] = (
            category_totals.get(category, 0)
            + amount
        )

    largest_category = None
    largest_amount = 0

    for category, amount in category_totals.items():

        if amount > largest_amount:

            largest_amount = amount
            largest_category = category

    return {
        "categories": category_totals,
        "largestCategory": largest_category,
        "largestAmount": largest_amount,
    }

async def get_customer_summary():

    customers = {}

    cursor = orders_collection.find(
        {"status": "completed"}
    )

    async for order in cursor:

        customer = order["businessName"]

        if customer not in customers:

            customers[customer] = {
                "orders": 0,
                "revenue": 0,
                "trays": 0,
            }

        customers[customer]["orders"] += 1
        customers[customer]["revenue"] += order["totalAmount"]
        customers[customer]["trays"] += order["quantity"]

    if not customers:

        return {
            "topCustomer": None,
            "topRevenue": 0,
            "totalCustomers": 0,
        }

    top_customer = max(
        customers.items(),
        key=lambda x: x[1]["revenue"]
    )

    return {
        "topCustomer": top_customer[0],
        "topRevenue": top_customer[1]["revenue"],
        "totalCustomers": len(customers),
        "customers": customers,
    }

async def get_complete_business_report():
    revenue = await get_revenue_summary()
    profit = await get_profit_summary()
    orders = await get_orders_summary()
    expenses = await get_expenses_summary()
    customers = await get_customer_summary()

    return {
        "revenue": revenue,
        "profit": profit,
        "orders": orders,
        "expenses": expenses,
        "customers": customers,
    }
