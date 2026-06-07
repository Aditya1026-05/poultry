from app.services.ai_tools import (
    get_profit_summary,
    get_revenue_summary,
    get_orders_summary,
    get_expenses_summary,
    get_customer_summary,
    get_complete_business_report,
)

TOOLS = {
    "profit": get_profit_summary,
    "revenue": get_revenue_summary,
    "orders": get_orders_summary,
    "expenses": get_expenses_summary,
    "customers": get_customer_summary,
    "report": get_complete_business_report,
}