from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.match import Match
from app.schemas.match import FindMentorQuery, MentorRecommendation
from app.schemas.user import UserResponse
from app.schemas.skill import SkillResponse
from app.auth.dependencies import get_current_user
from app.ai.recommender import recommender

router = APIRouter(prefix="/matching", tags=["AI Matching"])

@router.post("/recommend", response_model=List[MentorRecommendation])
def find_best_mentors(
    query: FindMentorQuery,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_skill = db.query(Skill).filter(Skill.id == query.skill_id).first()
    if not target_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")

    # Find mentors who teach this skill, excluding the requesting user
    teaching_records = db.query(UserSkill).join(User).filter(
        UserSkill.skill_id == query.skill_id,
        User.id != current_user.id,
        User.verification_status != "suspended"
    ).all()

    recommendations: List[MentorRecommendation] = []

    for rec in teaching_records:
        mentor = rec.user
        eval_result = recommender.evaluate_mentor(
            db=db,
            mentor=mentor,
            target_skill=target_skill,
            user_skill_record=rec,
            current_level=query.current_level or "Beginner",
            desired_level=query.desired_level or "Intermediate",
            preferred_mode=query.preferred_mode or "Any",
            preferred_days=query.preferred_days or [],
            preferred_time=query.preferred_time
        )

        # Record recommendation audit trail
        match_log = Match(
            learner_id=current_user.id,
            mentor_id=mentor.id,
            skill_id=target_skill.id,
            match_score=eval_result["match_score"],
            explanation=eval_result["explanation"]
        )
        db.add(match_log)

        recommendations.append(
            MentorRecommendation(
                mentor=UserResponse.model_validate(mentor),
                matched_skill=SkillResponse.model_validate(target_skill),
                match_score=eval_result["match_score"],
                explanation=eval_result["explanation"],
                proficiency_level=eval_result["proficiency_level"],
                years_of_experience=eval_result["years_of_experience"],
                trust_score=eval_result["trust_score"],
                average_rating=eval_result["average_rating"],
                completed_sessions=eval_result["completed_sessions"],
                available_days=eval_result["available_days"]
            )
        )

    db.commit()

    # Sort descending by match score
    recommendations.sort(key=lambda r: r.match_score, reverse=True)
    return recommendations

@router.get("/dashboard-recommendations", response_model=List[MentorRecommendation])
def get_dashboard_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns AI recommendations tailored to the student's registered learning interests.
    """
    interests = current_user.learning_interests
    all_recommendations: List[MentorRecommendation] = []
    seen_mentors = set()

    for interest in interests:
        target_skill = interest.skill
        teaching_records = db.query(UserSkill).join(User).filter(
            UserSkill.skill_id == target_skill.id,
            User.id != current_user.id,
            User.verification_status != "suspended"
        ).all()

        for rec in teaching_records:
            mentor = rec.user
            if mentor.id in seen_mentors:
                continue

            eval_result = recommender.evaluate_mentor(
                db=db,
                mentor=mentor,
                target_skill=target_skill,
                user_skill_record=rec,
                current_level="Beginner",
                desired_level=interest.desired_level or "Intermediate",
                preferred_mode="Any"
            )

            seen_mentors.add(mentor.id)
            all_recommendations.append(
                MentorRecommendation(
                    mentor=UserResponse.model_validate(mentor),
                    matched_skill=SkillResponse.model_validate(target_skill),
                    match_score=eval_result["match_score"],
                    explanation=eval_result["explanation"],
                    proficiency_level=eval_result["proficiency_level"],
                    years_of_experience=eval_result["years_of_experience"],
                    trust_score=eval_result["trust_score"],
                    average_rating=eval_result["average_rating"],
                    completed_sessions=eval_result["completed_sessions"],
                    available_days=eval_result["available_days"]
                )
            )

    all_recommendations.sort(key=lambda r: r.match_score, reverse=True)
    return all_recommendations[:6]
