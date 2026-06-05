from fastapi import APIRouter

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_provider

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    provider = get_ai_provider()

    response = await provider.chat(
        request.message
    )

    return ChatResponse(
        response=response
    )