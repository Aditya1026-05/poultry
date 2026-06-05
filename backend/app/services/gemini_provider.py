from google import genai

from app.config import settings
from app.services.ai_provider import AIProvider


class GeminiProvider(AIProvider):

    def __init__(self):
        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

    async def chat(self, message: str) -> str:

        response = self.client.models.generate_content(
            model="gemini-2.5-flash",
            contents=message,
        )

        return response.text