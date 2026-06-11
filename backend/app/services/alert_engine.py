import uuid
from datetime import datetime, timezone
from app.database import alerts_collection
from app.services.business_health import get_business_health
from app.services.ai_tools import (
    get_profit_summary,
    get_customer_summary,
    get_expenses_summary,
    get_expense_categories,
)
from app.services.dormant_customers import get_dormant_customers

async def generate_alerts():
    """
    Evaluates business health and financial data to generate actionable alerts.
    Also handles auto-resolution if conditions return to normal.
    """
    try:
        # 1. Fetch relevant metrics from business intelligence services
        health = await get_business_health()
        health_score = health.get("healthScore", 100)

        profit = await get_profit_summary()
        net_profit = profit.get("netProfit", 0)

        customers = await get_customer_summary()
        top_customer = customers.get("topCustomer")
        top_customer_revenue = customers.get("topRevenue", 0)
        total_revenue = profit.get("totalRevenue", 0)

        dormant_data = await get_dormant_customers()
        dormant_list = dormant_data.get("dormantCustomers", [])

        expense_summary = await get_expenses_summary()
        total_expenses = expense_summary.get("totalExpenses", 0)

        expense_categories = await get_expense_categories()
        largest_category = expense_categories.get("largestCategory")
        largest_amount = expense_categories.get("largestAmount", 0)

        now = datetime.now(timezone.utc).isoformat()

        # ---------------------------------------------------------
        # Rule 1: Business Health Critical (score < 40)
        # ---------------------------------------------------------
        if health_score < 40:
            existing = await alerts_collection.find_one({
                "type": "business_health",
                "isResolved": False
            })
            if not existing:
                await alerts_collection.insert_one({
                    "_id": str(uuid.uuid4()),
                    "type": "business_health",
                    "severity": "critical",
                    "title": "Business Health Critical",
                    "message": f"Health score is only {health_score}.",
                    "isRead": False,
                    "isResolved": False,
                    "isDismissed": False,
                    "metadata": {"healthScore": health_score},
                    "createdAt": now,
                    "updatedAt": now
                })
        else:
            # Auto-resolve health alerts if the health score recovers
            await alerts_collection.update_many(
                {"type": "business_health", "isResolved": False},
                {"$set": {"isResolved": True, "updatedAt": now}}
            )

        # ---------------------------------------------------------
        # Rule 2: Negative Profit Alert (netProfit < 0)
        # ---------------------------------------------------------
        if net_profit < 0:
            existing = await alerts_collection.find_one({
                "type": "negative_profit",
                "isResolved": False
            })
            if not existing:
                await alerts_collection.insert_one({
                    "_id": str(uuid.uuid4()),
                    "type": "negative_profit",
                    "severity": "critical",
                    "title": "Business Operating At Loss",
                    "message": f"Business is operating at a loss of ₹{abs(net_profit)}.",
                    "isRead": False,
                    "isResolved": False,
                    "isDismissed": False,
                    "metadata": {"netProfit": net_profit},
                    "createdAt": now,
                    "updatedAt": now
                })
        else:
            # Auto-resolve negative profit alert when business returns to profit
            await alerts_collection.update_many(
                {"type": "negative_profit", "isResolved": False},
                {"$set": {"isResolved": True, "updatedAt": now}}
            )

        # ---------------------------------------------------------
        # Rule 3: Customer Dependency Alert (Top Customer > 50% revenue)
        # ---------------------------------------------------------
        has_dependency = False
        if total_revenue > 0:
            contribution = (top_customer_revenue / total_revenue) * 100
            if contribution > 50:
                has_dependency = True
                existing = await alerts_collection.find_one({
                    "type": "customer_dependency",
                    "isResolved": False
                })
                if not existing:
                    await alerts_collection.insert_one({
                        "_id": str(uuid.uuid4()),
                        "type": "customer_dependency",
                        "severity": "warning",
                        "title": "Customer Dependency Risk",
                        "message": f"{top_customer} contributes {contribution:.1f}% of revenue.",
                        "isRead": False,
                        "isResolved": False,
                        "isDismissed": False,
                        "metadata": {"customer": top_customer, "dependency": round(contribution, 2)},
                        "createdAt": now,
                        "updatedAt": now
                    })

        if not has_dependency:
            # Auto-resolve customer dependency alerts when revenue is diversified again
            await alerts_collection.update_many(
                {"type": "customer_dependency", "isResolved": False},
                {"$set": {"isResolved": True, "updatedAt": now}}
            )

        # ---------------------------------------------------------
        # Rule 4: Dormant Customer Alert (Inactive >= 10 days)
        # ---------------------------------------------------------
        active_dormant_customers = set()
        for dormant in dormant_list:
            customer_name = dormant.get("customer")
            days_inactive = dormant.get("daysInactive", 0)
            if customer_name:
                active_dormant_customers.add(customer_name)
                # Check for unresolved alert for this specific dormant customer using regex prefix on message
                existing = await alerts_collection.find_one({
                    "type": "dormant_customer",
                    "isResolved": False,
                    "message": {"$regex": f"^{customer_name} "}
                })
                if not existing:
                    await alerts_collection.insert_one({
                        "_id": str(uuid.uuid4()),
                        "type": "dormant_customer",
                        "severity": "warning",
                        "title": "Dormant Customer",
                        "message": f"{customer_name} inactive for {days_inactive} days.",
                        "isRead": False,
                        "isResolved": False,
                        "isDismissed": False,
                        "metadata": {"customer": customer_name, "daysInactive": days_inactive},
                        "createdAt": now,
                        "updatedAt": now
                    })

        # Auto-resolve alerts for customers who are no longer dormant
        unresolved_dormant_alerts = alerts_collection.find({
            "type": "dormant_customer",
            "isResolved": False
        })
        async for alert in unresolved_dormant_alerts:
            msg = alert.get("message", "")
            found = False
            for name in active_dormant_customers:
                if msg.startswith(f"{name} "):
                    found = True
                    break
            if not found:
                await alerts_collection.update_one(
                    {"_id": alert["_id"]},
                    {"$set": {"isResolved": True, "updatedAt": now}}
                )

        # ---------------------------------------------------------
        # Rule 5: Expense Concentration Alert (Largest Category > 40% of total expenses)
        # ---------------------------------------------------------
        has_expense_risk = False
        if total_expenses > 0 and largest_amount > 0:
            percentage = (largest_amount / total_expenses) * 100
            if percentage > 40:
                has_expense_risk = True
                existing = await alerts_collection.find_one({
                    "type": "expense_concentration",
                    "isResolved": False
                })
                if not existing:
                    await alerts_collection.insert_one({
                        "_id": str(uuid.uuid4()),
                        "type": "expense_concentration",
                        "severity": "warning",
                        "title": "Expense Concentration Risk",
                        "message": f"{largest_category} category accounts for {percentage:.1f}% of total expenses.",
                        "isRead": False,
                        "isResolved": False,
                        "isDismissed": False,
                        "metadata": {"category": largest_category, "percentage": round(percentage, 2)},
                        "createdAt": now,
                        "updatedAt": now
                    })

        if not has_expense_risk:
            # Auto-resolve expense concentration alert when largest category falls below threshold
            await alerts_collection.update_many(
                {"type": "expense_concentration", "isResolved": False},
                {"$set": {"isResolved": True, "updatedAt": now}}
            )

    except Exception as e:
        # Log error during alert generation
        print(f"Error during alert generation: {e}")
