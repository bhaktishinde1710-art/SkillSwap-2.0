from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day = Column(String(20), nullable=False)  # Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
    start_time = Column(String(10), nullable=False)  # HH:MM (e.g., "16:00")
    end_time = Column(String(10), nullable=False)  # HH:MM (e.g., "18:00")
    available = Column(Boolean, default=True, nullable=False)

    # Relationships
    user = relationship("User", back_populates="availabilities")
