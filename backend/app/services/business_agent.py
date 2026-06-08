from app.services.tool_router import determine_tools, fallback_tools
from app.services.tool_executor import execute_tools
from app.services.context_builder import build_context
from app.services.gemini_helper import safe_generate
from app.services.chat_memory import (
    add_message,
    get_history,
)

async def business_agent(message: str):
    history = get_history()

    # print("HISTORY:")
    # print(history)
    try:
        tools = await determine_tools(message)

    except Exception:
        print("Router Failed -> Using Fallback Router")

        tools = fallback_tools(message)

    
    data = await execute_tools(tools)

    context = build_context(data)

    # print("TOOLS:", tools)
    # print("DATA:", data)
    # print("CONTEXT:", context)

    prompt = f"""
You are Star Poultry's Senior Business Analyst.

Conversation History:

{history}

Business Context:

{context}

Current User Question:

{message}

Answer using the conversation history when relevant.

Rules:
- Use only provided business data.
- Do not invent numbers.
- Give practical recommendations.
"""

    response = safe_generate(prompt)

    add_message("user", message)
    if "AI Service Temporarily Unavailable" not in response:
        add_message("assistant", response)

    return response


print("Business Agent Loaded")