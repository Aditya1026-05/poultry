import asyncio

from app.services.dormant_customers import (
    get_dormant_customers,
)

result = asyncio.run(
    get_dormant_customers()
)

print(result)