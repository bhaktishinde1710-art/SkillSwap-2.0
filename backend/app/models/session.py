import datetime
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    learner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    mentor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(10), nullable=False)  # HH:MM
    end_time = Column(String(10), nullable=False)    # HH:MM
    mode = Column(String(20), default="Online", nullable=False)  # Online, Offline
    meeting_link = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)    # e.g., "VIT Library Discussion Room 3" or "Google Meet"
    notes = Column(Text, nullable=True)              # Goals / topics to cover
    status = Column(String(30), default="Pending", nullable=False, index=True)  # Pending, Accepted, Rejected, Scheduled, Completed, Cancelled
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    learner = relationship("User", foreign_keys=[learner_id], back_populates="sessions_as_learner")
    mentor = relationship("User", foreign_keys=[mentor_id], back_populates="sessions_as_mentor")
    skill = relationship("Skill", back_populates="sessions")
    review = relationship("Review", back_populates="session", uselist=False, cascade="all, delete-orphan")
