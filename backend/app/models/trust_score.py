import datetime
from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class TrustScore(Base):
    __tablename__ = "trust_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    score = Column(Float, default=75.0, nullable=False)              # 0 to 100 aggregate
    reliability_score = Column(Float, default=80.0, nullable=False)  # 0 to 100
    teaching_score = Column(Float, default=80.0, nullable=False)     # 0 to 100
    review_score = Column(Float, default=70.0, nullable=False)       # 0 to 100
    completion_score = Column(Float, default=80.0, nullable=False)   # 0 to 100
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationship
    user = relationship("User", back_populates="trust_score")
