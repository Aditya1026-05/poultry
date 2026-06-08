from app.services.ai_tools import (
    get_revenue_summary,
    get_profit_summary,
    get_orders_summary,
    get_expenses_summary,
    get_customer_summary,
    get_complete_business_report,
)

async def execute_tools(tools: list[str]):

    results = {}

    if "revenue" in tools:
        results["revenue"] = await get_revenue_summary()

    if "profit" in tools:
        results["profit"] = await get_profit_summary()

    if "orders" in tools:
        results["orders"] = await get_orders_summary()

    if "expenses" in tools:
        results["expenses"] = await get_expenses_summary()

    if "customers" in tools:
        results["customers"] = await get_customer_summary()

    if "report" in tools:
        results["report"] = await get_complete_business_report()

    if "overview" in tools:

        results["overview"] = {
            "revenue": await get_revenue_summary(),
            "profit": await get_profit_summary(),
            "orders": await get_orders_summary(),
            "customers": await get_customer_summary(),
        }

    return results