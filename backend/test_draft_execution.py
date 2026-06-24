import asyncio
from app.services.action_memory import (
    save_pending_action,
    get_pending_action,
    clear_pending_action,
)
from app.services.ai_tools import (
    create_expense_draft,
    create_expense_confirmed,
)
from app.database import expenses_collection


async def main():
    print("=== Testing Expense Draft Flow ===")

    # 1. Test Action Memory Clean State
    print("\n1. Testing action memory initial state...")
    clear_pending_action()
    initial_draft = get_pending_action()
    assert initial_draft is None, "Pending action should be None initially."
    print("Initial state is None.")

    # 2. Test saving and getting action
    print("\n2. Testing save_pending_action...")
    test_action = {"type": "test", "draftId": "123"}
    save_pending_action(test_action)
    retrieved = get_pending_action()
    assert retrieved == test_action, "Retrieved action should match saved action."
    print("Save and retrieve action memory works.")

    # 3. Test clear_pending_action
    print("\n3. Testing clear_pending_action...")
    clear_pending_action()
    cleared = get_pending_action()
    assert cleared is None, "Action memory should be None after clear."
    print("Clear action memory works.")

    # 4. Test create_expense_draft when empty
    print("\n4. Testing create_expense_draft (no existing action)...")
    draft_res = await create_expense_draft(
        title="Test Feed Purchase",
        category="Feed",
        amount=15000,
        expenseDate="2026-06-24",
        description="Test description",
    )
    assert draft_res["success"] is True, "Draft creation should be successful."
    assert "draft" in draft_res, "Response must contain 'draft'."
    assert draft_res["draft"]["title"] == "Test Feed Purchase"
    assert draft_res["draft"]["category"] == "Feed"
    assert draft_res["draft"]["amount"] == 15000
    assert draft_res["draft"]["expenseDate"] == "2026-06-24"
    assert draft_res["draft"]["description"] == "Test description"
    assert "warning" not in draft_res, "Should not return a warning for first draft."
    
    saved_draft = get_pending_action()
    assert saved_draft == draft_res["draft"], "Draft in memory should match returned draft."
    print("create_expense_draft without existing draft works.")

    # 5. Test create_expense_draft warning when replacing
    print("\n5. Testing create_expense_draft with existing draft (replacement warning)...")
    draft_res2 = await create_expense_draft(
        title="Test Medicine",
        category="Medicine",
        amount=5000,
    )
    assert draft_res2["success"] is True, "Draft replacement should be successful."
    assert "warning" in draft_res2, "Should return replacement warning."
    assert draft_res2["warning"] == "A previous pending expense draft was replaced."
    
    saved_draft2 = get_pending_action()
    assert saved_draft2 == draft_res2["draft"], "Draft in memory should match new draft."
    assert saved_draft2["title"] == "Test Medicine"
    print("create_expense_draft replacement warning works.")

    # 6. Test confirm draft flow (DB insertion)
    print("\n6. Testing confirm action (database insertion)...")
    draft_to_confirm = get_pending_action()
    assert draft_to_confirm is not None, "There must be a pending action in memory."
    
    # Simulate routes/ai.py confirm logic
    confirm_res = await create_expense_confirmed(
        title=draft_to_confirm["title"],
        category=draft_to_confirm["category"],
        amount=draft_to_confirm["amount"],
        expenseDate=draft_to_confirm["expenseDate"],
        description=draft_to_confirm.get("description", ""),
    )
    clear_pending_action()
    
    assert confirm_res["success"] is True, "Confirmation should succeed."
    assert "expense" in confirm_res, "Response should contain the created expense object."
    created_expense = confirm_res["expense"]
    
    # Query database to verify it exists
    inserted_db = await expenses_collection.find_one({"id": created_expense["id"]})
    assert inserted_db is not None, "Expense should be inserted into MongoDB."
    assert inserted_db["title"] == "Test Medicine"
    assert inserted_db["category"] == "Medicine"
    assert inserted_db["amount"] == 5000
    
    # Clean up test database record
    await expenses_collection.delete_one({"id": created_expense["id"]})
    print("Confirm action inserts to MongoDB and cleans up.")

    # 7. Verify memory cleared
    cleared_final = get_pending_action()
    assert cleared_final is None, "Memory should be cleared after confirmation."
    print(" Memory cleared successfully.")

    print("\nALL TESTS PASSED SUCCESSFULLY! 🎉")


if __name__ == "__main__":
    asyncio.run(main())
