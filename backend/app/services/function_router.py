from google import genai
from google.genai import types

from app.config import settings
from app.services.function_calling import (
    BUSINESS_TOOLS,
)

client = genai.Client(
    api_key=settings.gemini_api_key_3
)

tool = types.Tool(
    function_declarations=BUSINESS_TOOLS
)


def get_function_name(message: str):

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=message,
        config=types.GenerateContentConfig(
            tools=[tool]
        ),
    )

    if not response.function_calls:
        return None

    return response.function_calls[0].name