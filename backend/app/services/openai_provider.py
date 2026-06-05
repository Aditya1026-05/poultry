from app.services.ai_provider import AIProvider


class OpenAIProvider(AIProvider):

    async def chat(self, message: str) -> str:
        return "OpenAI provider not configured yet."