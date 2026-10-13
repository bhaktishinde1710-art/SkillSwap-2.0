import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    college_email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    college = Column(String(255), default="Vishwakarma Institute of Technology (VIT), Pune", nullable=False)
    department = Column(String(150), nullable=False)  # Computer Science, CSE (AI), IT, E&TC, Mechanical, AI&DS, etc.
    year = Column(String(50), nullable=False)  # First Year, Second Year, Third Year, Fourth Year
    profile_photo = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    role = Column(String(50), default="student", nullable=False)  # student, admin
    verification_status = Column(String(50), default="verified", nullable=False)  # pending, verified, suspended
    learning_preferences = Column(String(255), default="Online & In-Person on VIT campus", nullable=True)
    onboarding_completed = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    teaching_skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    learning_interests = relationship("LearningInterest", back_populates="user", cascade="all, delete-orphan")
    availabilities = relationship("Availability", back_populates="user", cascade="all, delete-orphan")
    
    sessions_as_learner = relationship(
        "Session",
        foreign_keys="[Session.learner_id]",
        back_populates="learner",
        cascade="all, delete-orphan"
    )
    sessions_as_mentor = relationship(
        "Session",
        foreign_keys="[Session.mentor_id]",
        back_populates="mentor",
        cascade="all, delete-orphan"
    )
    
    reviews_given = relationship(
        "Review",
        foreign_keys="[Review.reviewer_id]",
        back_populates="reviewer",
        cascade="all, delete-orphan"
    )
    reviews_received = relationship(
        "Review",
        foreign_keys="[Review.reviewed_user_id]",
        back_populates="reviewed_user",
        cascade="all, delete-orphan"
    )
    
    trust_score = relationship("TrustScore", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    reports_filed = relationship("Report", foreign_keys="[Report.reporter_id]", back_populates="reporter")
    reports_received = relationship("Report", foreign_keys="[Report.reported_user_id]", back_populates="reported_user")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
