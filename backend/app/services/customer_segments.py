from app.services.ai_tools import (
    get_customer_summary,
)


async def get_customer_segments():

    data = await get_customer_summary()

    customers = data.get(
        "customers",
        {}
    )

    vip_customers = []
    regular_customers = []
    low_activity_customers = []

    for customer, info in customers.items():

        revenue = info["revenue"]
        orders = info["orders"]
        trays = info["trays"]

        customer_data = {
            "customer": customer,
            "revenue": revenue,
            "orders": orders,
            "trays": trays,
        }

        if revenue >= 50000:

            vip_customers.append(
                customer_data
            )

        elif revenue >= 10000:

            regular_customers.append(
                customer_data
            )

        else:

            low_activity_customers.append(
                customer_data
            )

    return {
        "vipCustomers": vip_customers,
        "regularCustomers": regular_customers,
        "lowActivityCustomers":
            low_activity_customers,
    }