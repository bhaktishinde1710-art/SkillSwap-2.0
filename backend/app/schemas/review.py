import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.user import UserResponse

class ReviewCreate(BaseModel):
    session_id: int
    rating: int = Field(..., ge=1, le=5, example=5)
    comment: str = Field(..., min_length=5, example="Excellent mentor! Clarified all my graph theory and dynamic programming doubts with code examples.")

class ReviewResponse(BaseModel):
    id: int
    session_id: int
    reviewer_id: int
    reviewed_user_id: int
    rating: int
    comment: str
    created_at: datetime.datetime
    reviewer: UserResponse
    reviewed_user: Optional[UserResponse] = None

    class Config:
        from_attributes = True
