# test_business_health.py

import asyncio

from app.services.business_health import (
    get_business_health,
)

result = asyncio.run(
    get_business_health()
)

print(result)