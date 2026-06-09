import asyncio

from app.services.gemini_function_agent import (
    gemini_function_agent,
)

response = asyncio.run(
    gemini_function_agent(
        "Show revenue and profit"
    )
)

print(response)