from google import genai
from google.genai import types

from app.config import settings
from app.services.function_calling import BUSINESS_TOOLS
from app.services.function_executor import execute_function
from app.services.context_builder import build_context
from app.services.gemini_helper import safe_generate
from app.services.fallback_responses import (
    build_fallback_response,
)

from app.services.multi_fallback_response import (
    build_multi_fallback_response,
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


async def gemini_function_agent(message: str):

    last_error = None

    for index, client in enumerate(clients):

        try:

            print(
                f"Function Agent Key #{index + 1}"
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"""
You are Star Poultry's AI Business Assistant.

Always use the available functions when they can answer the user's question.

User Question:

{message}
""",
            
                config=types.GenerateContentConfig(
                    tools=[tool]
                )
            )
            print("RAW RESPONSE:")
            print(response.text)

            break

        except Exception as e:

            print(
                f"Function Agent Key #{index + 1} Failed:",
                str(e)
            )

            last_error = e

    else:
        raise last_error

    print("FUNCTION CALLS:")
    print(response.function_calls)

    if not response.function_calls:
        return safe_generate(message)

    data = {}

    for function_call in response.function_calls:

        function_name = function_call.name

        arguments = dict(
            function_call.args
        )

        print(
            "Function Chosen:",
            function_name
        )

        print(
            "Arguments:",
            arguments
        )

        result = await execute_function(
            function_name,
            **arguments
        )

        data[function_name] = result

    context = build_context(data)
    print("DATA:")
    print(data)
    print("FINAL CONTEXT:")
    print(context)

    prompt = f"""
You are Star Poultry's Senior Business Analyst.

Business Context:

{context}

Question:

{message}

Answer using only the provided data.
"""

    response = safe_generate(prompt)

    if "AI Service Temporarily Unavailable" in response:

        print(
            "Using Multi Function Fallback"
        )

        return build_multi_fallback_response(
            data
        )

    return response