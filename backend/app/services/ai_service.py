import os

from app.services.gemini_provider import GeminiProvider
from app.services.openai_provider import OpenAIProvider


def get_ai_provider():

    provider = os.getenv("AI_PROVIDER", "gemini")

    if provider.lower() == "openai":
        return OpenAIProvider()

    return GeminiProvider()