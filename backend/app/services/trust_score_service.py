import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.trust_score import TrustScore
from app.models.session import Session as LearningSession
from app.models.review import Review
from app.models.user_skill import UserSkill

def calculate_and_update_trust_score(db: Session, user_id: int) -> TrustScore:
    """
    Computes transparent, multi-dimensional Trust Score for a mentor based on:
    - Teaching Quality (from peer reviews) (35%)
    - Session Completion (25%)
    - Reliability & Promptness (25%)
    - Review Volume & Verified Skills (15%)
    """
    # 1. Teaching Quality from Reviews received
    reviews = db.query(Review).filter(Review.reviewed_user_id == user_id).all()
    review_count = len(reviews)
    if review_count > 0:
        avg_rating = sum(r.rating for r in reviews) / review_count
        teaching_score = (avg_rating / 5.0) * 100.0
    else:
        avg_rating = 0.0
        teaching_score = 75.0  # Fair default for new active peer mentors

    # 2. Session Completion & Cancellation behavior
    sessions_as_mentor = db.query(LearningSession).filter(LearningSession.mentor_id == user_id).all()
    completed_sessions = [s for s in sessions_as_mentor if s.status.lower() == "completed"]
    cancelled_sessions = [s for s in sessions_as_mentor if s.status.lower() == "cancelled"]
    accepted_sessions = [s for s in sessions_as_mentor if s.status.lower() in ["accepted", "scheduled", "completed", "cancelled"]]
    
    comp_count = len(completed_sessions)
    canc_count = len(cancelled_sessions)
    total_acc = len(accepted_sessions)

    if total_acc > 0:
        # Penalize cancellations
        denominator = comp_count + (canc_count * 1.5)
        if denominator > 0:
            completion_score = (comp_count / denominator) * 100.0
        else:
            completion_score = 75.0
    else:
        completion_score = 75.0

    # 3. Reliability Score (High acceptance of requests, low no-shows)
    rejected_sessions = [s for s in sessions_as_mentor if s.status.lower() == "rejected"]
    total_requests = len(sessions_as_mentor)
    if total_requests > 0:
        # Base 85, slight deduction for high rejection rate, severe deduction for cancellations
        acc_ratio = (len(accepted_sessions) / total_requests) * 100.0
        reliability_score = max(30.0, min(100.0, (acc_ratio * 0.7) + 30.0 - (canc_count * 8.0)))
    else:
        reliability_score = 80.0

    # 4. Review Volume & Skill Verification bonus
    verified_skills = db.query(UserSkill).filter(
        UserSkill.user_id == user_id,
        UserSkill.verification_status.in_(["verified", "certified"])
    ).count()

    # Scale review count
    volume_bonus = min(50.0, review_count * 10.0)
    verif_bonus = min(30.0, verified_skills * 15.0)
    review_score = min(100.0, 40.0 + volume_bonus + verif_bonus)

    # Calculate overall weighted score
    overall_score = (
        (teaching_score * 0.35) +
        (completion_score * 0.25) +
        (reliability_score * 0.25) +
        (review_score * 0.15)
    )

    overall_score = round(max(0.0, min(100.0, overall_score)), 1)
    teaching_score = round(max(0.0, min(100.0, teaching_score)), 1)
    completion_score = round(max(0.0, min(100.0, completion_score)), 1)
    reliability_score = round(max(0.0, min(100.0, reliability_score)), 1)
    review_score = round(max(0.0, min(100.0, review_score)), 1)

    # Fetch or create trust score record
    ts = db.query(TrustScore).filter(TrustScore.user_id == user_id).first()
    if not ts:
        ts = TrustScore(
            user_id=user_id,
            score=overall_score,
            reliability_score=reliability_score,
            teaching_score=teaching_score,
            review_score=review_score,
            completion_score=completion_score,
            calculated_at=datetime.datetime.utcnow()
        )
        db.add(ts)
    else:
        ts.score = overall_score
        ts.reliability_score = reliability_score
        ts.teaching_score = teaching_score
        ts.review_score = review_score
        ts.completion_score = completion_score
        ts.calculated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(ts)
    return ts
