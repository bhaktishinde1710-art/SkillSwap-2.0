from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.user import UserResponse
from app.schemas.skill import SkillResponse

class FindMentorQuery(BaseModel):
    skill_id: int
    current_level: Optional[str] = "Beginner"
    desired_level: Optional[str] = "Intermediate"
    preferred_mode: Optional[str] = "Any"  # Any, Online, Offline
    preferred_days: Optional[List[str]] = []  # ["Monday", "Wednesday"]
    preferred_time: Optional[str] = None     # "Morning", "Afternoon", "Evening", or "16:00"

class MentorRecommendation(BaseModel):
    mentor: UserResponse
    matched_skill: SkillResponse
    match_score: float = Field(..., ge=0, le=100)
    explanation: str
    proficiency_level: str
    years_of_experience: float
    trust_score: float
    average_rating: float
    completed_sessions: int
    available_days: List[str] = []
