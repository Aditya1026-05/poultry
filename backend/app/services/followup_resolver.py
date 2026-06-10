from app.services.conversation_state import (
    get_customer,
)


def resolve_followup(message: str):

    msg = message.lower().strip()

    customer = get_customer()

    if not customer:
        return message

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
    

    if msg in customer_followups:

        return f"""
        {message}
        for customer {customer}
        """

    return message