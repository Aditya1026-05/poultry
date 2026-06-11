import asyncio

from app.services.customer_rankings import (
    get_customer_rankings,
)

result = asyncio.run(
    get_customer_rankings()
)

print(result)