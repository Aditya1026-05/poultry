from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import alerts_collection
from app.schemas.alerts import AlertResponse, UnreadCountResponse
from app.security import require_admin
from app.services.alert_engine import generate_alerts

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def clean_alert(alert: dict) -> dict:
    return {
        "id": alert["_id"],
        "type": alert["type"],
        "severity": alert["severity"],
        "title": alert["title"],
        "message": alert["message"],
        "isRead": alert.get("isRead", False),
        "isResolved": alert.get("isResolved", False),
        "isDismissed": alert.get("isDismissed", False),
        "metadata": alert.get("metadata", {}),
        "createdAt": alert["createdAt"],
        "updatedAt": alert.get("updatedAt", alert["createdAt"]),
    }

@router.get("", response_model=list[AlertResponse])
async def get_alerts(_admin=Depends(require_admin)):
    """
    Triggers alert generation and returns all alerts sorted with newest first.
    """
    # Trigger alert generation to check for updates
    await generate_alerts()
    cursor = alerts_collection.find({}).sort("createdAt", -1)
    return [clean_alert(alert) async for alert in cursor]

@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(_admin=Depends(require_admin)):
    """
    Returns the count of unread and unresolved alerts.
    Optimized: does NOT trigger alert generation.
    """
    count = await alerts_collection.count_documents({
        "isRead": False,
        "isResolved": False
    })
    return {"count": count}

@router.patch("/{id}/read", response_model=AlertResponse)
async def mark_read(id: str, _admin=Depends(require_admin)):
    """
    Marks a single alert as read.
    """
    alert = await alerts_collection.find_one({"_id": id})
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    
    timestamp = now_iso()
    await alerts_collection.update_one(
        {"_id": id},
        {"$set": {"isRead": True, "updatedAt": timestamp}}
    )
    
    updated = await alerts_collection.find_one({"_id": id})
    return clean_alert(updated)

@router.patch("/{id}/dismiss", response_model=AlertResponse)
async def dismiss_alert(id: str, _admin=Depends(require_admin)):
    """
    Marks a single alert as dismissed (so it doesn't show in popups again).
    """
    alert = await alerts_collection.find_one({"_id": id})
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    
    timestamp = now_iso()
    await alerts_collection.update_one(
        {"_id": id},
        {"$set": {"isDismissed": True, "updatedAt": timestamp}}
    )
    
    updated = await alerts_collection.find_one({"_id": id})
    return clean_alert(updated)

@router.patch("/read-all")
async def mark_all_read(_admin=Depends(require_admin)):
    """
    Marks all unread, unresolved alerts as read.
    """
    timestamp = now_iso()
    await alerts_collection.update_many(
        {"isRead": False},
        {"$set": {"isRead": True, "updatedAt": timestamp}}
    )
    return {"message": "All alerts marked read"}

@router.delete("/{id}")
async def delete_alert(id: str, _admin=Depends(require_admin)):
    """
    Deletes a single alert from the database.
    """
    result = await alerts_collection.delete_one({"_id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return {"message": "Alert deleted"}
