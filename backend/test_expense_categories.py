import asyncio

from app.services.ai_tools import (
    get_expense_categories
)

result = asyncio.run(
    get_expense_categories()
)

print(result)