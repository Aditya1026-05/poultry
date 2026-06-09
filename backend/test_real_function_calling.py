from google import genai
from google.genai import types

from app.config import settings
from app.services.function_calling import BUSINESS_TOOLS

client = genai.Client(
    api_key=settings.gemini_api_key_3
)

tool = types.Tool(
    function_declarations=BUSINESS_TOOLS
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="""
You are a business assistant.

Use available functions whenever they can answer the question.

Question:
Who is my biggest customer?
""",
    config=types.GenerateContentConfig(
        tools=[tool]
    )
)

print("TEXT:")
print(response.text)

print("\nFUNCTION CALLS:")
print(response.function_calls)