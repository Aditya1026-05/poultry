def build_context(data: dict) -> str:

    sections = []

    for tool_name, tool_data in data.items():

        sections.append(
            f"{tool_name.upper()} DATA:\n{tool_data}"
        )

    return "\n\n".join(sections)