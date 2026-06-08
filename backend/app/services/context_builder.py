def build_context(data: dict) -> str:

    sections = []

    for tool_name, tool_data in data.items():

        section = f"\n{tool_name.upper()} DATA\n\n"

        if isinstance(tool_data, dict):

            for key, value in tool_data.items():

                section += f"{key}: {value}\n"

        else:

            section += str(tool_data)

        sections.append(section)

    return "\n".join(sections)