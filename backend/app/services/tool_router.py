from google import genai

from app.config import settings


client = genai.Client(
    api_key=settings.gemini_api_key
)


async def determine_tools(message: str):

    prompt = f"""
You are an AI routing system.

Available tools:

- revenue
- profit
- orders
- expenses
- customers
- overview

Analyze the user's message.

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
How is my business doing?

Output:
overview

Message:
Who is my biggest customer?

Output:
customers

User Message:

{message}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return [
        tool.strip().lower()
        for tool in response.text.split(",")
    ]