import asyncio

from app.services.function_executor import (
    execute_function,
)

async def main():

    result = await execute_function(
        "get_revenue"
    )

    print(result)

asyncio.run(main())