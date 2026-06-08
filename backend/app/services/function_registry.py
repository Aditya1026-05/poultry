from app.services.ai_tools import (
    get_revenue_summary,
    get_profit_summary,
    get_orders_summary,
    get_expenses_summary,
    get_customer_summary,
    get_complete_business_report,
)

FUNCTION_REGISTRY = {
    "get_revenue": get_revenue_summary,
    "get_profit": get_profit_summary,
    "get_orders": get_orders_summary,
    "get_expenses": get_expenses_summary,
    "get_customers": get_customer_summary,
    "get_overview": get_complete_business_report,
}