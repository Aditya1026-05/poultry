from app.services.ai_tools import (
    get_customer_summary,
)


async def get_customer_rankings():

    data = await get_customer_summary()

    customers = data.get(
        "customers",
        {}
    )

    if not customers:

        return {
            "vipCustomer": None,
            "topRevenueCustomers": [],
            "topTrayCustomers": [],
        }

    revenue_ranking = sorted(
        customers.items(),
        key=lambda x: x[1]["revenue"],
        reverse=True,
    )

    tray_ranking = sorted(
        customers.items(),
        key=lambda x: x[1]["trays"],
        reverse=True,
    )

    vip_customer = revenue_ranking[0][0]

    return {
        "vipCustomer": vip_customer,

        "topRevenueCustomers": [
            {
                "customer": customer,
                "revenue": info["revenue"],
                "orders": info["orders"],
                "trays": info["trays"],
            }
            for customer, info
            in revenue_ranking[:5]
        ],

        "topTrayCustomers": [
            {
                "customer": customer,
                "trays": info["trays"],
                "revenue": info["revenue"],
            }
            for customer, info
            in tray_ranking[:5]
        ],
    }