import asyncio
from app.services.alert_engine import generate_alerts
from app.database import alerts_collection

async def main():
    print("--- Running Alert Generation Engine ---")
    await generate_alerts()
    
    print("\n--- Current Alerts in Database ---")
    cursor = alerts_collection.find({})
    alerts = [alert async for alert in cursor]
    
    if not alerts:
        print("No alerts found.")
    else:
        for idx, alert in enumerate(alerts, 1):
            print(f"\n[{idx}] Alert ID: {alert.get('_id')}")
            print(f"    Type: {alert.get('type')}")
            print(f"    Severity: {alert.get('severity')}")
            print(f"    Title: {alert.get('title')}")
            print(f"    Message: {alert.get('message')}")
            print(f"    isRead: {alert.get('isRead')}")
            print(f"    isResolved: {alert.get('isResolved')}")
            print(f"    isDismissed: {alert.get('isDismissed')}")
            print(f"    Metadata: {alert.get('metadata')}")
            print(f"    CreatedAt: {alert.get('createdAt')}")
            print(f"    UpdatedAt: {alert.get('updatedAt')}")

if __name__ == "__main__":
    asyncio.run(main())
