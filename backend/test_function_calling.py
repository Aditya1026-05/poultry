from google import genai
from google.genai import types
import os

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

get_revenue = types.FunctionDeclaration(
    name="get_revenue",
    description="Returns revenue information",
    parameters={
        "type": "OBJECT",
        "properties": {}
    }
)

tool = types.Tool(
    function_declarations=[get_revenue]
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Show revenue",
    config=types.GenerateContentConfig(
        tools=[tool]
    )
)

print(response.function_calls)