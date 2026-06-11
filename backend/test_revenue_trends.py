import asyncio

from app.services.revenue_trends import (
    get_revenue_trends,
)

result = asyncio.run(
    get_revenue_trends()
)

print(result)