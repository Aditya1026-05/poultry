from google import genai

from app.config import settings


client = genai.Client(
    api_key=settings.gemini_api_key
)


def safe_generate(prompt: str) -> str:

    try:

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        return response.text

    except Exception as e:

        print("Gemini Error:", str(e))

        return """
# AI Service Temporarily Unavailable

The AI service has reached its usage limit or is currently unavailable.

Please try again later.
"""