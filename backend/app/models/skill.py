import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Programming, DSA, Machine Learning, Web Development, Mobile Development, DevOps & Cloud, Cybersecurity, UI/UX, Core Engineering, Academics, Career Prep, Other
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    # Relationships
    user_skills = relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")
    learning_interests = relationship("LearningInterest", back_populates="skill", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="skill")
