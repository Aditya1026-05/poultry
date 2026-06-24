from fastapi import APIRouter, HTTPException

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_provider
from app.services.action_memory import get_pending_action, clear_pending_action
from app.services.ai_tools import create_expense_confirmed

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


@router.post("/confirm-action")
async def confirm_action():
    draft = get_pending_action()
    if not draft:
        raise HTTPException(status_code=400, detail="No pending action found.")

    result = await create_expense_confirmed(
        title=draft["title"],
        category=draft["category"],
        amount=draft["amount"],
        expenseDate=draft["expenseDate"],
        description=draft.get("description", "")
    )

    clear_pending_action()
    return result


@router.post("/cancel-action")
async def cancel_action():
    clear_pending_action()
    return {"success": True, "message": "Pending action cancelled."}