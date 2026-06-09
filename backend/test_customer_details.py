import asyncio

from app.services.ai_tools import (
    get_customer_details
)

result = asyncio.run(
    get_customer_details(
        "Star Poultry Admin"
    )
)

print(result)