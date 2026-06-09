from google import genai
from google.genai import types

from app.config import settings
from app.services.function_calling import BUSINESS_TOOLS
from app.services.function_registry import FUNCTION_REGISTRY

client = genai.Client(
    api_key=settings.gemini_api_key_3
)

tool = types.Tool(
    function_declarations=BUSINESS_TOOLS
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Who is my biggest customer?",
    config=types.GenerateContentConfig(
        tools=[tool]
    )
)

function_call = response.function_calls[0]

print("Function:")
print(function_call.name)

print()

print("Executing...")

function = FUNCTION_REGISTRY[
    function_call.name
]

import asyncio

result = asyncio.run(
    function()
)

print(result)