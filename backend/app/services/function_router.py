from google import genai
from google.genai import types

from app.config import settings
from app.services.function_calling import (
    BUSINESS_TOOLS,
)

clients = []

if settings.gemini_api_key_1:
    clients.append(
        genai.Client(
            api_key=settings.gemini_api_key_1
        )
    )

if settings.gemini_api_key_2:
    clients.append(
        genai.Client(
            api_key=settings.gemini_api_key_2
        )
    )

if settings.gemini_api_key_3:
    clients.append(
        genai.Client(
            api_key=settings.gemini_api_key_3
        )
    )

tool = types.Tool(
    function_declarations=BUSINESS_TOOLS
)


def get_function_name(message: str):

    last_error = None

    for index, client in enumerate(clients):

        try:

            print(
                f"Function Router Key #{index + 1}"
            )

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

        except Exception as e:

            print(
                f"Function Router Key #{index + 1} Failed:",
                str(e)
            )

            last_error = e

    print("Function Router Failed")

    return None