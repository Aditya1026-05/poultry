from typing import Any, Dict, Literal
from pydantic import BaseModel

SeverityType = Literal["critical", "warning", "info"]

class AlertResponse(BaseModel):
    """
    Response model for alert details.
    """
    id: str
    type: str
    severity: SeverityType
    title: str
    message: str
    isRead: bool
    isResolved: bool
    isDismissed: bool
    metadata: Dict[str, Any]
    createdAt: str
    updatedAt: str

class UnreadCountResponse(BaseModel):
    """
    Response model for unread and unresolved alert count.
    """
    count: int
