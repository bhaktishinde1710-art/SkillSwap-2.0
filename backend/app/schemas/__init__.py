from app.schemas.auth import UserRegister, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import (
    UserBase, UserResponse, UserDetailResponse, UserProfileUpdate,
    AvailabilityBase, AvailabilityCreate, AvailabilityResponse,
    TrustScoreResponse, OnboardingRequest
)
from app.schemas.skill import (
    SkillBase, SkillCreate, SkillUpdate, SkillResponse,
    UserSkillBase, UserSkillCreate, UserSkillResponse,
    LearningInterestBase, LearningInterestCreate, LearningInterestResponse
)
from app.schemas.session import SessionBase, SessionCreate, SessionStatusUpdate, SessionResponse
from app.schemas.review import ReviewCreate, ReviewResponse
from app.schemas.match import FindMentorQuery, MentorRecommendation
from app.schemas.notification import NotificationBase, NotificationCreate, NotificationResponse
from app.schemas.report import ReportCreate, ReportStatusUpdate, ReportResponse

__all__ = [
    "UserRegister", "UserLogin", "Token", "ForgotPasswordRequest", "ResetPasswordRequest",
    "UserBase", "UserResponse", "UserDetailResponse", "UserProfileUpdate",
    "AvailabilityBase", "AvailabilityCreate", "AvailabilityResponse",
    "TrustScoreResponse", "OnboardingRequest",
    "SkillBase", "SkillCreate", "SkillUpdate", "SkillResponse",
    "UserSkillBase", "UserSkillCreate", "UserSkillResponse",
    "LearningInterestBase", "LearningInterestCreate", "LearningInterestResponse",
    "SessionBase", "SessionCreate", "SessionStatusUpdate", "SessionResponse",
    "ReviewCreate", "ReviewResponse",
    "FindMentorQuery", "MentorRecommendation",
    "NotificationBase", "NotificationCreate", "NotificationResponse",
    "ReportCreate", "ReportStatusUpdate", "ReportResponse"
]
