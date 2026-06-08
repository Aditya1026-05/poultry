from google import genai

from app.config import settings


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


async def determine_tools(message: str):

    prompt = f"""
You are an AI routing system for a poultry business assistant.

Available tools:

- revenue
- profit
- orders
- expenses
- customers
- overview
- report

Analyze the user's message.

Choose ALL tools required to answer the question.

Return ONLY a comma separated list.

Examples:

Message:
How much revenue do I have?

Output:
revenue

Message:
Show revenue and profit

Output:
revenue,profit

Message:
Why is my profit low?

Output:
profit,revenue,expenses

Message:
Which part of my business needs attention?

Output:
overview

Message:
Analyze my business

Output:
report

Message:
Who is my biggest customer?

Output:
customers

Message:
Give me a complete business report

Output:
report

User Message:

{message}
"""

    last_error = None

    for index, client in enumerate(clients):

        try:

            print(
                f"Router trying Gemini Key #{index + 1}"
            )

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

            return [
                tool.strip().lower()
                for tool in response.text.split(",")
                if tool.strip()
            ]

        except Exception as e:

            print(
                f"Router Gemini Key #{index + 1} Failed:",
                str(e)
            )

            last_error = e

    raise last_error

def fallback_tools(message: str):

    msg = message.lower()

    if "customer" in msg:
        return ["customers"]

    if "profit" in msg:
        return ["profit"]

    if "revenue" in msg:
        return ["revenue"]

    if "order" in msg:
        return ["orders"]

    if "expense" in msg:
        return ["expenses"]

    return ["overview"]