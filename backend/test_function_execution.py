import asyncio

from google import genai
from google.genai import types

from app.config import settings
from app.services.function_calling import (
    BUSINESS_TOOLS,
)
from app.services.function_executor import (
    execute_function,
)

client = genai.Client(
    api_key=settings.gemini_api_key_3
)

async def main():

    tool = types.Tool(
        function_declarations=BUSINESS_TOOLS
    )

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Show revenue",
        config=types.GenerateContentConfig(
            tools=[tool]
        ),
    )

    function_call = response.function_calls[0]

    print("Function:", function_call.name)

    result = await execute_function(
        function_call.name
    )

    print("Result:")
    print(result)

asyncio.run(main())