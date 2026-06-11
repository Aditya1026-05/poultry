from typing import Literal

Intent = Literal[
    "profit",
    "revenue",
    "orders",
    "expenses",
    "customers",
    "overview",
    "report",
    "analysis",
    "general",
]

def wants_expense_categories(message: str) -> bool:

    msg = message.lower()

    customer_entities = [
        "fresh shop",
        "star poultry admin",
        "b1",
        "b2",
        "b#",
    ]

    if any(
        entity in msg
        for entity in customer_entities
    ):
        return "customers"

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

    analysis_keywords = [
    "why",
    "how",
    "healthy",
    "health",
    "improve",
    "improvement",
    "recommend",
    "recommendation",
    "suggest",
    "suggestion",
    "focus",
    "problem",
    "problems",
    "issue",
    "issues",
    "hurting",
    "weakness",
    "weaknesses",
    "strength",
    "strengths",
    "opportunity",
    "opportunities",
    "attention",
    "needs attention",
    "area needs attention",
    "healthy",
    "health",
    "business health",
    "focus on",
    "focus",
    "improve business",
    "improve profit",
    "trend",
    "trends",
    "growth",
    "growing",
    "compare",
    "comparison",
    "month",
    "months",
    "best month",
    "performed best",
    "performed",
    "best",

]

    trend_keywords = [
    "trend",
    "trends",
    "growth",
    "growing",
    "compare",
    "comparison",
    "month",
    "months",
    "best month",
    "performed best",
]

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

    if any(word in msg for word in analysis_keywords):
        return "analysis"

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

    if any(word in msg for word in trend_keywords):
        return "analysis"

    

    return "general"

def is_business_question(message: str) -> bool:

    msg = message.lower().strip()
    known_business_entities = [
    "fresh shop",
    "star poultry admin",
    "b1",
    "b2",
    "b#",
    ]

    if any(
        entity in msg
        for entity in known_business_entities
    ):
        return True

    follow_ups = [
        "why",
        "why?",
        "how",
        "how?",
        "explain",
        "tell me more",
    ]

    if msg in follow_ups:
        return True

    business_keywords = [
        "revenue",
        "sales",
        "profit",
        "loss",
        "margin",
        "expense",
        "expenses",
        "cost",
        "orders",
        "order",
        "customer",
        "customers",
        "buyer",
        "client",
        "business",
        "dashboard",
        "performance",
        "report",
        "analysis",
        "profitability",
        "focus",
        "attention",
        "improve",
        "growth",
        "recommendation",
        "recommend",
        "healthy",
        "health",
        "spending",
        "spent",
        "money",
        "costs",
        "month",
        "months",
        "trend",
        "trends",
        "growth",
        "growing",
        "compare",
        "comparison",
        "performed",
        "best month",
    ]

    return any(word in msg for word in business_keywords)