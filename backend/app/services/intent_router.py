from typing import Literal

Intent = Literal[
    "profit",
    "revenue",
    "orders",
    "expenses",
    "customers",
    "overview",
    "general",
    "report",
]

def wants_expense_categories(message: str) -> bool:

    msg = message.lower()

    keywords = [
        "category",
        "categories",
        "feed",
        "medicine",
        "transport",
        "electricity",
        "labor",
        "maintenance",
        "equipment",
        "miscellaneous",
        "largest expense",
        "largest category",
    ]

    return any(word in msg for word in keywords)

def detect_intent(message: str) -> Intent:

    msg = message.lower()

    profit_keywords = [
        "profit",
        "margin",
        "loss"
    ]
    revenue_keywords = [
    "revenue",
    "sales",
    "turnover",
    ]
    orders_keywords = [
    "order",
    "orders",
    "pending",
    "delivered",
    "completed",
    "rejected",
    "review",
    "trays",
    ]
    expense_keywords = [
    "expense",
    "expenses",
    "spending",
    "spent",
    "cost",
    "costs",
]
    customer_keywords = [
    "customer",
    "customers",
    "buyer",
    "buyers",
    "client",
    "clients",
]

    overview_keywords = [
    "overview",
    "summary",
    "business",
    "dashboard",
    "performance",
]

    report_keywords = [
    "report",
    "analysis",
    "analyze",
    "overview report",
    "business report",
    "complete report",
]

    if any(word in msg for word in profit_keywords):
        return "profit"

    if any(word in msg for word in revenue_keywords):
        return "revenue"

    if any(word in msg for word in orders_keywords):
        return "orders"
    
    if any(word in msg for word in expense_keywords):
        return "expenses"
    
    if any(word in msg for word in customer_keywords):
        return "customers"

    if any(word in msg for word in overview_keywords):
        return "overview"

    return "general"