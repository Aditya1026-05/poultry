from app.services.ai_tools import (
    get_revenue_summary,
    get_profit_summary,
    get_orders_summary,
    get_expenses_summary,
    get_customer_summary,
    get_complete_business_report,
    get_expense_categories,
    get_expense_categories,
    get_customer_details,
    get_orders_between_dates,
    get_order_records,
    create_expense_draft,
)
from app.services.business_health import (
    get_business_health
)
from app.services.revenue_trends import (
    get_revenue_trends
)
from app.services.customer_rankings import (
    get_customer_rankings,
)
from app.services.dormant_customers import (
    get_dormant_customers,
)

from app.services.customer_segments import (
    get_customer_segments,
)

FUNCTION_REGISTRY = {
    "get_revenue": get_revenue_summary,
    "get_profit": get_profit_summary,
    "get_orders": get_orders_summary,
    "get_expenses": get_expenses_summary,
    "get_customers": get_customer_summary,
    "get_overview": get_complete_business_report,
    "get_expense_categories": get_expense_categories,
    "get_customer_details": get_customer_details,
    "get_orders_between_dates": get_orders_between_dates,
    "get_order_records": get_order_records,
    "get_business_health": get_business_health,
    "get_revenue_trends": get_revenue_trends,
    "get_customer_rankings": get_customer_rankings,
    "get_dormant_customers": get_dormant_customers,
    "get_customer_segments": get_customer_segments,
    "create_expense_draft": create_expense_draft,
}