from google import genai

from app.config import settings


client = genai.Client(
    api_key=settings.gemini_api_key
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

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return [
    tool.strip().lower()
    for tool in response.text.split(",")
    if tool.strip()
    ]