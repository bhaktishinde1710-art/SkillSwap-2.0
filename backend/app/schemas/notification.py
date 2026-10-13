import datetime
from pydantic import BaseModel
from typing import Optional

class NotificationBase(BaseModel):
    title: str
    message: str
    type: str = "system"
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True
