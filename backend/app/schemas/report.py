import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.user import UserResponse

class ReportCreate(BaseModel):
    reported_user_id: int
    reason: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)

class ReportStatusUpdate(BaseModel):
    status: str = Field(..., example="resolved")  # pending, investigating, resolved, dismissed

class ReportResponse(BaseModel):
    id: int
    reporter_id: int
    reported_user_id: int
    reason: str
    description: str
    status: str
    created_at: datetime.datetime
    
    reporter: UserResponse
    reported_user: UserResponse

    class Config:
        from_attributes = True
