import asyncio

from app.services.customer_segments import (
    get_customer_segments,
)

result = asyncio.run(
    get_customer_segments()
)

print(result)