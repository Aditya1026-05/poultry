from app.services.conversation_state import (
    get_context,
)

from app.services.gemini_helper import (
    safe_generate,
)


def handle_followup(
    message: str,
):

    context = get_context()

    if not context["context"]:
        return None

    prompt = f"""
You are Star Poultry's Senior Business Analyst.

IMPORTANT CURRENCY RULES:

- All monetary values are in Indian Rupees (₹).
- Never use dollars ($), USD, or any foreign currency.
- Revenue, expenses, profit, costs, and sales are always expressed in ₹.
- Whenever mentioning money, prefix with ₹.

Previous User Question:

{context["question"]}

Business Data:

{context["data"]}

User Follow-Up:

{message}

Instructions:

- Explain the previous analysis.
- Use only the provided business data.
- Do not invent numbers.
- Keep all monetary values in ₹.
"""

    return safe_generate(
        prompt
    )