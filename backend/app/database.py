from motor.motor_asyncio import AsyncIOMotorClient
import certifi

from app.config import settings

client = AsyncIOMotorClient(settings.mongodb_uri, tlsCAFile=certifi.where())
db = client[settings.mongodb_db]

users_collection = db["users"]
orders_collection = db["orders"]
settings_collection = db["settings"]
expenses_collection = db["expenses"]
alerts_collection = db["alerts"]

