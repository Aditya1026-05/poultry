from app.services.tool_router import determine_tools
from app.services.tool_executor import execute_tools
from app.services.context_builder import build_context
from app.services.gemini_helper import safe_generate


async def business_agent(message: str):

    tools = await determine_tools(message)

    data = await execute_tools(tools)

    context = build_context(data)

    prompt = f"""
You are Star Poultry's Senior Business Analyst.

Business Context:

{context}

User Question:

{message}

Answer the user's question using the business data.

Rules:
- Use only the provided data.
- Do not invent numbers.
- Provide insights when relevant.
- Provide recommendations when useful.
"""

    return safe_generate(prompt)


print("Business Agent Loaded")