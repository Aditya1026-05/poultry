from app.services.tool_router import determine_tools, fallback_tools
from app.services.tool_executor import execute_tools
from app.services.context_builder import build_context
from app.services.gemini_helper import safe_generate
from app.services.chat_memory import (
    add_message,
    get_history,
)
from app.services.function_router import (
    get_function_name,
)

from app.services.function_executor import (
    execute_function,
)
from app.services.fallback_responses import (
    build_fallback_response,
)

from app.services.gemini_function_agent import (
    gemini_function_agent,
)


async def business_agent(message: str):
    history = get_history()

    try:

        response = await gemini_function_agent(
            message
        )

        add_message(
            "user",
            message
        )

        add_message(
            "assistant",
            response
        )

        return response

    except Exception as e:

        print(
            "Gemini Function Agent Failed:",
            str(e)
        )
        return """
# AI Temporarily Busy

The AI analysis service is currently unavailable.

Please try again in a few moments.
"""

    # print("HISTORY:")
    # print(history)
    # try:
    #     tools = await determine_tools(message)

    # except Exception:
    #     print("Router Failed -> Using Fallback Router")

    #     tools = fallback_tools(message)

    # tools = fallback_tools(message)

    
    # data = await execute_tools(tools)

    # context = build_context(data)
#     function_name = get_function_name(message)

#     print("Function Chosen:", function_name)

#     if function_name is None:

#         tools = fallback_tools(message)

#         data = await execute_tools(tools)

#         first_tool = tools[0]

#         tool_mapping = {
#             "revenue": "get_revenue",
#             "profit": "get_profit",
#             "orders": "get_orders",
#             "expenses": "get_expenses",
#             "customers": "get_customers",
#             "overview": "get_overview",
#         }

#         return build_fallback_response(
#             tool_mapping[first_tool],
#             data[first_tool],
#         )

#     result = await execute_function(
#         function_name
#     )

#     data = {
#         function_name: result
#     }

#     context = build_context(data)

#     # print("TOOLS:", tools)
#     # print("DATA:", data)
#     # print("CONTEXT:", context)

#     prompt = f"""
# You are Star Poultry's Senior Business Analyst.

# Conversation History:

# {history}

# Business Context:

# {context}

# Current User Question:

# {message}

# Answer using the conversation history when relevant.

# Rules:
# - Use only provided business data.
# - Do not invent numbers.
# - Give practical recommendations.
# """

#     response = safe_generate(prompt)

#     if "AI Service Temporarily Unavailable" in response:

#         return build_fallback_response(
#             function_name,
#             result,
#         )

#     add_message("user", message)
#     if "AI Service Temporarily Unavailable" not in response:
#         add_message("assistant", response)

#     return response


print("Business Agent Loaded")