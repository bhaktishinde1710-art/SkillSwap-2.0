import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from fastapi import HTTPException, status
from app.models.session import Session as LearningSession
from app.models.user import User
from app.models.skill import Skill
from app.schemas.session import SessionCreate, SessionStatusUpdate
from app.services.notification_service import create_notification
from app.services.trust_score_service import calculate_and_update_trust_score

def time_overlaps(start1: str, end1: str, start2: str, end2: str) -> bool:
    """Check if two time intervals (HH:MM) overlap."""
    return start1 < end2 and end1 > start2

def create_session_request(db: Session, learner_id: int, session_in: SessionCreate) -> LearningSession:
    # 1. Validation: Learner cannot book a session with themselves
    if learner_id == session_in.mentor_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot book a peer-learning session with yourself."
        )

    # 2. Check mentor existence
    mentor = db.query(User).filter(User.id == session_in.mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mentor not found."
        )

    # 3. Check skill existence
    skill = db.query(Skill).filter(Skill.id == session_in.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found."
        )

    # 4. Check time format and ordering
    if session_in.start_time >= session_in.end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session start time must be earlier than end time."
        )

    # 5. Check if scheduled date is not in the past
    today = datetime.date.today()
    if session_in.scheduled_date < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book a session for a date in the past."
        )

    # 6. DOUBLE-BOOKING PREVENTION:
    # Check if mentor already has a conflicting active session (Pending, Accepted, Scheduled)
    active_statuses = ["Pending", "Accepted", "Scheduled"]
    mentor_sessions = db.query(LearningSession).filter(
        LearningSession.mentor_id == session_in.mentor_id,
        LearningSession.scheduled_date == session_in.scheduled_date,
        LearningSession.status.in_(active_statuses)
    ).all()

    for s in mentor_sessions:
        if time_overlaps(session_in.start_time, session_in.end_time, s.start_time, s.end_time):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Mentor {mentor.first_name} already has a conflicting session booked from {s.start_time} to {s.end_time} on {s.scheduled_date}."
            )

    # Check if learner already has a conflicting active session at that time
    learner_sessions = db.query(LearningSession).filter(
        LearningSession.learner_id == learner_id,
        LearningSession.scheduled_date == session_in.scheduled_date,
        LearningSession.status.in_(active_statuses)
    ).all()

    for s in learner_sessions:
        if time_overlaps(session_in.start_time, session_in.end_time, s.start_time, s.end_time):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"You already have another active session scheduled from {s.start_time} to {s.end_time} on {s.scheduled_date}."
            )

    # 7. Create Session
    meeting_link = session_in.location if session_in.mode == "Online" else None
    if session_in.mode == "Online" and not meeting_link:
        meeting_link = f"https://meet.google.com/ssw-{session_in.skill_id}-{learner_id}{session_in.mentor_id}"

    new_session = LearningSession(
        learner_id=learner_id,
        mentor_id=session_in.mentor_id,
        skill_id=session_in.skill_id,
        scheduled_date=session_in.scheduled_date,
        start_time=session_in.start_time,
        end_time=session_in.end_time,
        mode=session_in.mode,
        meeting_link=meeting_link,
        location=session_in.location or ("Google Meet" if session_in.mode == "Online" else "VIT Pune Campus"),
        notes=session_in.notes,
        status="Pending"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # 8. Notify Mentor
    learner = db.query(User).filter(User.id == learner_id).first()
    create_notification(
        db=db,
        user_id=session_in.mentor_id,
        title="New Session Request",
        message=f"{learner.first_name} {learner.last_name} requested a peer-learning session for {skill.name} on {session_in.scheduled_date} at {session_in.start_time}.",
        notification_type="session_request",
        link="/mentor/requests"
    )

    return new_session

def update_session_status(
    db: Session,
    session_id: int,
    user_id: int,
    status_update: SessionStatusUpdate
) -> LearningSession:
    sess = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    if not sess:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found."
        )

    # Only mentor or learner or admin can update status
    is_mentor = sess.mentor_id == user_id
    is_learner = sess.learner_id == user_id

    if not is_mentor and not is_learner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this session."
        )

    new_status = status_update.status.capitalize()
    valid_statuses = ["Pending", "Accepted", "Rejected", "Scheduled", "Completed", "Cancelled"]
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid session status. Must be one of: {', '.join(valid_statuses)}"
        )

    # State transition checks
    if new_status in ["Accepted", "Rejected"]:
        if not is_mentor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the mentor can accept or reject session requests."
            )
        if sess.status != "Pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot change session status from {sess.status} to {new_status}."
            )
        sess.status = "Scheduled" if new_status == "Accepted" else "Rejected"
        if status_update.meeting_link:
            sess.meeting_link = status_update.meeting_link
            
        # Notify learner
        action_word = "accepted" if new_status == "Accepted" else "declined"
        create_notification(
            db=db,
            user_id=sess.learner_id,
            title=f"Session {new_status}",
            message=f"{sess.mentor.first_name} {sess.mentor.last_name} has {action_word} your session request for {sess.skill.name}.",
            notification_type=f"session_{action_word}",
            link="/sessions"
        )

    elif new_status == "Completed":
        if sess.status not in ["Accepted", "Scheduled"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot mark session as completed from current status: {sess.status}."
            )
        sess.status = "Completed"
        # Notify learner to leave review
        create_notification(
            db=db,
            user_id=sess.learner_id,
            title="Session Completed - Leave a Review",
            message=f"Your {sess.skill.name} session with {sess.mentor.first_name} is completed! Please rate your experience to update their Trust Score.",
            notification_type="session_completed",
            link="/sessions"
        )
        # Recalculate Trust Score
        calculate_and_update_trust_score(db, sess.mentor_id)

    elif new_status == "Cancelled":
        sess.status = "Cancelled"
        sess.cancellation_reason = status_update.cancellation_reason or "Cancelled by participant."
        # Notify the other party
        target_user_id = sess.learner_id if is_mentor else sess.mentor_id
        canceller_name = sess.mentor.first_name if is_mentor else sess.learner.first_name
        create_notification(
            db=db,
            user_id=target_user_id,
            title="Session Cancelled",
            message=f"{canceller_name} cancelled the scheduled session for {sess.skill.name}. Reason: {sess.cancellation_reason}",
            notification_type="session_cancelled",
            link="/sessions"
        )
        # Recalculate Trust Score
        calculate_and_update_trust_score(db, sess.mentor_id)

    sess.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(sess)
    return sess
