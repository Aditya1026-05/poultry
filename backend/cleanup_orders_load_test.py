"""
Cleanup script: removes all [LOAD_TEST] orders AND test user accounts from MongoDB.

Run after order load testing:
    python cleanup_orders_load_test.py
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

    # 1. Delete test orders (businessName starts with [LOAD_TEST])
    orders_col = db["orders"]
    order_count = await orders_col.count_documents(
        {"businessName": {"$regex": r"^\[LOAD_TEST\]"}}
    )
    print(f"Found {order_count} [LOAD_TEST] order(s) to delete...")
    if order_count > 0:
        result = await orders_col.delete_many(
            {"businessName": {"$regex": r"^\[LOAD_TEST\]"}}
        )
        print(f"Deleted {result.deleted_count} order(s).")

    # 2. Delete test user accounts (email matches loadtest_*@test.starpoultry.com)
    users_col = db["users"]
    user_count = await users_col.count_documents(
        {"email": {"$regex": r"^loadtest_.*@test\.starpoultry\.com$"}}
    )
    print(f"Found {user_count} test user account(s) to delete...")
    if user_count > 0:
        result = await users_col.delete_many(
            {"email": {"$regex": r"^loadtest_.*@test\.starpoultry\.com$"}}
        )
        print(f"Deleted {result.deleted_count} user(s).")

    # 3. Also clean up any [LOAD_TEST] expenses from prior tests
    expenses_col = db["expenses"]
    expense_count = await expenses_col.count_documents(
        {"title": {"$regex": r"^\[LOAD_TEST\]"}}
    )
    if expense_count > 0:
        result = await expenses_col.delete_many(
            {"title": {"$regex": r"^\[LOAD_TEST\]"}}
        )
        print(f"Deleted {result.deleted_count} [LOAD_TEST] expense(s).")

    if order_count == 0 and user_count == 0 and expense_count == 0:
        print("Nothing to clean up.")

    client.close()
    print("Done.")


if __name__ == "__main__":
    asyncio.run(cleanup())
