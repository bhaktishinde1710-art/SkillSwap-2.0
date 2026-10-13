from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class LearningInterest(Base):
    __tablename__ = "learning_interests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    desired_level = Column(String(50), default="Intermediate", nullable=False)  # Beginner, Intermediate, Advanced, Expert
    priority = Column(String(50), default="High", nullable=False)  # Low, Medium, High

    # Relationships
    user = relationship("User", back_populates="learning_interests")
    skill = relationship("Skill", back_populates="learning_interests")
