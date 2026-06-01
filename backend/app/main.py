from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.bootstrap import ensure_admin_user
from app.database import db
from app.routes.auth import router as auth_router
from app.routes.orders import router as orders_router
from app.routes.settings import router as settings_router

app = FastAPI(title="Star Poultry Farm API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(settings_router)
app.include_router(orders_router)


@app.on_event("startup")
async def startup():
    await ensure_admin_user()


@app.get("/api/health")
async def health_check():
    await db.command("ping")
    return {"status": "ok", "database": "connected"}
