import datetime
from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.skill import UserSkillResponse, LearningInterestResponse

class AvailabilityBase(BaseModel):
    day: str  # Monday, Tuesday, etc.
    start_time: str  # HH:MM
    end_time: str    # HH:MM
    available: bool = True

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityResponse(AvailabilityBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class TrustScoreResponse(BaseModel):
    id: int
    user_id: int
    score: float
    reliability_score: float
    teaching_score: float
    review_score: float
    completion_score: float
    calculated_at: datetime.datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    college_email: str
    first_name: str
    last_name: str
    college: Optional[str] = "Vishwakarma Institute of Technology (VIT), Pune"
    department: Optional[str] = ""
    year: Optional[str] = ""
    profile_photo: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = "student"
    verification_status: Optional[str] = "verified"
    learning_preferences: Optional[str] = None
    onboarding_completed: Optional[bool] = False

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    full_name: Optional[str] = ""

    class Config:
        from_attributes = True


class UserDetailResponse(UserResponse):
    teaching_skills: List[UserSkillResponse] = []
    learning_interests: List[LearningInterestResponse] = []
    availabilities: List[AvailabilityResponse] = []
    trust_score: Optional[TrustScoreResponse] = None
    completed_sessions_count: int = 0
    average_rating: float = 0.0
    total_reviews_count: int = 0

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    learning_preferences: Optional[str] = None

class OnboardingSkillItem(BaseModel):
    skill_id: int
    proficiency_level: str
    years_of_experience: float = 1.0

class OnboardingInterestItem(BaseModel):
    skill_id: int
    desired_level: str = "Intermediate"
    priority: str = "High"

class OnboardingRequest(BaseModel):
    department: str
    year: str
    bio: Optional[str] = None
    profile_photo: Optional[str] = None
    learning_preferences: Optional[str] = None
    teaching_skills: List[OnboardingSkillItem] = []
    learning_interests: List[OnboardingInterestItem] = []
    availabilities: List[AvailabilityCreate] = []
