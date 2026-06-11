from app.services.conversation_state import (
    get_customer,
)

from app.services.chat_memory import (
    get_history,
)


def resolve_followup(message: str):

    msg = message.lower().strip()

    customer = get_customer()

    # -------------------------
    # CUSTOMER FOLLOW UPS
    # -------------------------

    customer_followups = [
        "how many trays",
        "how many trays?",
        "last delivery",
        "last delivery date",
        "last order",
        "last order date",
        "how much revenue",
        "revenue",
        "orders",
        "order history",
        "delivery date",
        "status",
    ]

    if customer and msg in customer_followups:

        return f"""
        {message}
        for customer {customer}
        """

    # -------------------------
    # BUSINESS HEALTH FOLLOW UPS
    # -------------------------

    history = get_history().lower()

    health_followups = [
        "these issues",
        "those issues",
        "this issue",
        "that issue",
        "how can i tackle these issues",
        "what should i focus on",
        "how can i improve",
        "improve this",
        "fix this",
        "what needs attention",
        "how do i improve profitability",
    ]

    if any(
        phrase in msg
        for phrase in health_followups
    ):

        if (
            "health score" in history
            or "needs attention" in history
            or "business health" in history
        ):

            return f"""
            {message}

            regarding the previous business health report
            """

    return message