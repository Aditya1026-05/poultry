FOLLOWUPS = [
    "why",
    "why?",
    "explain",
    "explain?",
    "tell me more",
    "how so",
    "how?",
    "what do you mean",
    "why this",
    "why this?",
    "elaborate",
    "more details",
]


def is_followup(message: str):

    msg = message.lower().strip()

    return msg in FOLLOWUPS