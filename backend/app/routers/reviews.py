from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.review import Review
from app.models.session import Session as LearningSession
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.auth.dependencies import get_current_user
from app.services.trust_score_service import calculate_and_update_trust_score
from app.services.notification_service import create_notification

router = APIRouter(prefix="/reviews", tags=["Reviews & Feedback"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sess = db.query(LearningSession).filter(LearningSession.id == review_in.session_id).first()
    if not sess:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")

    if sess.learner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the learner who attended this session can submit a review."
        )

    if sess.status.lower() != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review sessions that have been marked as Completed."
        )

    # Check duplicate review
    existing_review = db.query(Review).filter(Review.session_id == review_in.session_id).first()
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A review has already been submitted for this learning session."
        )

    review = Review(
        session_id=sess.id,
        reviewer_id=current_user.id,
        reviewed_user_id=sess.mentor_id,
        rating=review_in.rating,
        comment=review_in.comment.strip()
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate Mentor's Trust Score
    calculate_and_update_trust_score(db, sess.mentor_id)

    # Notify Mentor
    create_notification(
        db=db,
        user_id=sess.mentor_id,
        title="New Review Received!",
        message=f"{current_user.first_name} left you a {review_in.rating}★ review for {sess.skill.name}!",
        notification_type="review_received",
        link=f"/mentor/profile"
    )

    return review

@router.get("/user/{user_id}", response_model=List[ReviewResponse])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    return db.query(Review).filter(Review.reviewed_user_id == user_id).order_by(Review.created_at.desc()).all()
