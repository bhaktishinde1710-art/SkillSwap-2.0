import datetime
from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.skill import SkillResponse
from app.schemas.user import UserResponse

class SessionBase(BaseModel):
    skill_id: int
    scheduled_date: datetime.date
    start_time: str = Field(..., example="16:00")
    end_time: str = Field(..., example="17:00")
    mode: str = Field("Online", example="Online")  # Online, Offline
    location: Optional[str] = "Google Meet"
    notes: Optional[str] = None

class SessionCreate(SessionBase):
    mentor_id: int

class SessionStatusUpdate(BaseModel):
    status: str = Field(..., example="Accepted")  # Accepted, Rejected, Completed, Cancelled
    meeting_link: Optional[str] = None
    cancellation_reason: Optional[str] = None

class SessionResponse(SessionBase):
    id: int
    learner_id: int
    mentor_id: int
    status: str
    meeting_link: Optional[str] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    
    learner: UserResponse
    mentor: UserResponse
    skill: SkillResponse

    class Config:
        from_attributes = True
