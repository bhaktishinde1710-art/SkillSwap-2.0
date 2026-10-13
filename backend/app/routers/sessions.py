from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.session import Session as LearningSession
from app.models.user import User
from app.schemas.session import SessionCreate, SessionStatusUpdate, SessionResponse
from app.auth.dependencies import get_current_user
from app.services.session_service import create_session_request, update_session_status

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def book_session(
    session_in: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_session_request(db=db, learner_id=current_user.id, session_in=session_in)

@router.get("", response_model=List[SessionResponse])
def get_user_sessions(
    role: Optional[str] = "all",      # all, learner, mentor
    status_filter: Optional[str] = None,  # Pending, Accepted, Scheduled, Completed, Cancelled
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(LearningSession)
    if role == "learner":
        query = query.filter(LearningSession.learner_id == current_user.id)
    elif role == "mentor":
        query = query.filter(LearningSession.mentor_id == current_user.id)
    else:
        query = query.filter(
            or_(
                LearningSession.learner_id == current_user.id,
                LearningSession.mentor_id == current_user.id
            )
        )

    if status_filter:
        query = query.filter(LearningSession.status.ilike(status_filter))

    return query.order_by(LearningSession.scheduled_date.desc(), LearningSession.start_time.desc()).all()

@router.get("/mentor/requests", response_model=List[SessionResponse])
def get_mentor_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(LearningSession).filter(
        LearningSession.mentor_id == current_user.id,
        LearningSession.status == "Pending"
    ).order_by(LearningSession.scheduled_date.asc()).all()

@router.get("/{session_id}", response_model=SessionResponse)
def get_session_detail(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sess = db.query(LearningSession).filter(LearningSession.id == session_id).first()
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    
    if sess.learner_id != current_user.id and sess.mentor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
        
    return sess

@router.patch("/{session_id}/status", response_model=SessionResponse)
def change_session_status(
    session_id: int,
    status_update: SessionStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_session_status(
        db=db,
        session_id=session_id,
        user_id=current_user.id,
        status_update=status_update
    )
