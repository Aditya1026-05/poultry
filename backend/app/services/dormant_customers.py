from datetime import datetime, timezone

from app.database import (
    orders_collection,
)


async def get_dormant_customers():

    customer_last_order = {}

    cursor = orders_collection.find({})

    async for order in cursor:

        customer = order["businessName"]

        order_date = datetime.fromisoformat(
            order["createdAt"]
        )

        if (
            customer not in customer_last_order
            or order_date >
            customer_last_order[customer]
        ):

            customer_last_order[
                customer
            ] = order_date

    today = datetime.now(
        timezone.utc
    )

    dormant_customers = []

    for customer, last_order in (
        customer_last_order.items()
    ):

        days_inactive = (
            today - last_order
        ).days

        if days_inactive >= 10:

            dormant_customers.append(
                {
                    "customer": customer,
                    "daysInactive": days_inactive,
                    "lastOrderDate":
                        last_order.date().isoformat(),
                }
            )

    dormant_customers.sort(
        key=lambda x:
        x["daysInactive"],
        reverse=True,
    )

    return {
        "thresholdDays": 10,
        "dormantCustomers":
            dormant_customers,
        "count":
            len(dormant_customers),
    }