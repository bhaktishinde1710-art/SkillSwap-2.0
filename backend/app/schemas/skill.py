import datetime
from pydantic import BaseModel, Field
from typing import Optional

class SkillBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None

class SkillResponse(SkillBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserSkillBase(BaseModel):
    skill_id: int
    proficiency_level: str = Field(..., example="Advanced")  # Beginner, Intermediate, Advanced, Expert
    years_of_experience: float = Field(..., ge=0, example=2.0)

class UserSkillCreate(UserSkillBase):
    pass

class UserSkillResponse(BaseModel):
    id: int
    user_id: int
    skill_id: int
    proficiency_level: str
    years_of_experience: float
    verification_status: str
    skill: SkillResponse

    class Config:
        from_attributes = True

class LearningInterestBase(BaseModel):
    skill_id: int
    desired_level: str = Field(..., example="Advanced")
    priority: str = Field(..., example="High")

class LearningInterestCreate(LearningInterestBase):
    pass

class LearningInterestResponse(BaseModel):
    id: int
    user_id: int
    skill_id: int
    desired_level: str
    priority: str
    skill: SkillResponse

    class Config:
        from_attributes = True
