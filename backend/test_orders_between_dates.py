import asyncio

from app.services.ai_tools import (
    get_orders_between_dates
)

result = asyncio.run(
    get_orders_between_dates(
        "2026-05-29",
        "2026-06-30"
    )
)

print(result)