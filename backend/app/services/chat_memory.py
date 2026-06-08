conversation_history = []


def add_message(role: str, content: str):

    conversation_history.append({
        "role": role,
        "content": content,
    })

    if len(conversation_history) > 10:
        conversation_history.pop(0)


def get_history() -> str:

    if not conversation_history:
        return ""

    lines = []

    for msg in conversation_history:

        lines.append(
            f"{msg['role']}: {msg['content']}"
        )

    return "\n".join(lines)