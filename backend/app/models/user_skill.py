from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency_level = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced, Expert
    years_of_experience = Column(Float, default=1.0, nullable=False)
    verification_status = Column(String(50), default="unverified", nullable=False)  # unverified, verified, certified

    # Relationships
    user = relationship("User", back_populates="teaching_skills")
    skill = relationship("Skill", back_populates="user_skills")
