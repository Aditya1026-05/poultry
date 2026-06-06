from typing import Literal

Intent = Literal[
    "profit",
    "revenue",
    "orders",
    "general",
]


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

    if any(word in msg for word in profit_keywords):
        return "profit"

    if any(word in msg for word in revenue_keywords):
        return "revenue"

    if any(word in msg for word in orders_keywords):
        return "orders"

    return "general"