from typing import Literal

Intent = Literal[
    "profit",
    "revenue",
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

    if any(word in msg for word in profit_keywords):
        return "profit"

    if any(word in msg for word in revenue_keywords):
        return "revenue"

    return "general"