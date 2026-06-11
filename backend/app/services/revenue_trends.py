from app.routes.profit import (
    collect_revenue_by_month,
)


async def get_revenue_trends():

    total_revenue, revenue_by_month = (
        await collect_revenue_by_month()
    )

    months = sorted(
        revenue_by_month.keys()
    )

    if not months:

        return {
            "trend": "No Data",
            "growthPercent": 0,
            "bestMonth": None,
            "bestRevenue": 0,
        }

    best_month = max(
        revenue_by_month,
        key=revenue_by_month.get,
    )

    best_revenue = revenue_by_month[
        best_month
    ]

    current_month = months[-1]
    current_revenue = revenue_by_month[
        current_month
    ]

    previous_revenue = 0
    previous_month = None

    growth_percent = 0

    if len(months) >= 2:

        previous_month = months[-2]

        previous_revenue = revenue_by_month[
            previous_month
        ]

        if previous_revenue > 0:

            growth_percent = round(
                (
                    (
                        current_revenue
                        - previous_revenue
                    )
                    / previous_revenue
                )
                * 100,
                2,
            )
            display_growth = min(
                growth_percent,
                999
            )

    trend = "Stable"

    if growth_percent > 0:
        trend = "Growing"

    elif growth_percent < 0:
        trend = "Declining"

    return {
        "currentMonth": current_month,
        "currentRevenue": current_revenue,
        "previousMonth": previous_month,
        "previousRevenue": previous_revenue,
        "growthPercent": growth_percent,
        "trend": trend,
        "bestMonth": best_month,
        "bestRevenue": best_revenue,
        "monthlyRevenue": revenue_by_month,
        "displayGrowth": display_growth,
    }