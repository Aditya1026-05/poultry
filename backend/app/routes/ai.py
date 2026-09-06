import time

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_provider
from app.services.action_memory import get_pending_action, clear_pending_action
from app.services.ai_tools import create_expense_confirmed
from app.services.timing import reset_gemini_timer, get_gemini_time

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):

    # Reset per-request Gemini timing accumulator
    reset_gemini_timer()

    start = time.perf_counter()

    provider = get_ai_provider()

    response = await provider.chat(
        request.message
    )

    total_ms = (time.perf_counter() - start) * 1000
    gemini_ms = get_gemini_time()
    backend_ms = total_ms - gemini_ms

    print(f"[TIMING] total={total_ms:.1f}ms  backend={backend_ms:.1f}ms  gemini={gemini_ms:.1f}ms")

    return JSONResponse(
        content={"response": response},
        headers={
            "X-Total-Time-Ms": f"{total_ms:.1f}",
            "X-Backend-Time-Ms": f"{backend_ms:.1f}",
            "X-Gemini-Time-Ms": f"{gemini_ms:.1f}",
        },
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