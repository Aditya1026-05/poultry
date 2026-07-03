from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.bootstrap import ensure_admin_user
from app.database import db, expenses_collection, orders_collection
from app.routes.auth import router as auth_router
from app.routes.expenses import router as expenses_router
from app.routes.orders import router as orders_router
from app.routes.profit import router as profit_router
from app.routes.settings import router as settings_router
from app.routes.ai import router as ai_router
from app.routes.alerts import router as alerts_router
from app.config import settings

app = FastAPI(title="Star Poultry Farm API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(settings_router)
app.include_router(orders_router)
app.include_router(expenses_router)
app.include_router(profit_router)
app.include_router(ai_router)
app.include_router(alerts_router)


@app.on_event("startup")
async def startup():
    await ensure_admin_user()
    await orders_collection.create_index([("status", 1), ("createdAt", -1)])
    await orders_collection.create_index([("userId", 1), ("createdAt", -1)])
    await expenses_collection.create_index([("expenseDate", -1)])
    await expenses_collection.create_index([("category", 1), ("expenseDate", -1)])


@app.get("/api/health")
async def health_check():
    await db.command("ping")
    return {"status": "ok", "database": "connected"}
