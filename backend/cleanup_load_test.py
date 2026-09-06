"""
Cleanup script: removes all [LOAD_TEST]-prefixed expenses from MongoDB.

Run after load testing to clean up test data:
    python cleanup_load_test.py
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()


async def cleanup():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("MONGODB_DB", "star_poultry")

    if not uri:
        print("[ERROR] MONGODB_URI not found in .env")
        return

    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    collection = db["expenses"]

    # Count before delete
    count = await collection.count_documents(
        {"title": {"$regex": r"^\[LOAD_TEST\]"}}
    )
    print(f"Found {count} [LOAD_TEST] expense(s) to delete...")

    if count > 0:
        result = await collection.delete_many(
            {"title": {"$regex": r"^\[LOAD_TEST\]"}}
        )
        print(f"Deleted {result.deleted_count} expense(s).")
    else:
        print("Nothing to clean up.")

    client.close()


if __name__ == "__main__":
    asyncio.run(cleanup())
