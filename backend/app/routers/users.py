from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models.user import User
from app.models.user_skill import UserSkill
from app.models.learning_interest import LearningInterest
from app.models.availability import Availability
from app.models.trust_score import TrustScore
from app.models.review import Review
from app.models.session import Session as LearningSession
from app.schemas.user import (
    UserResponse, UserDetailResponse, UserProfileUpdate,
    AvailabilityCreate, AvailabilityResponse, OnboardingRequest
)
from app.auth.dependencies import get_current_user
from app.services.trust_score_service import calculate_and_update_trust_score

router = APIRouter(prefix="/users", tags=["Users & Profiles"])

def build_user_detail(user: User, db: Session) -> UserDetailResponse:
    reviews = db.query(Review).filter(Review.reviewed_user_id == user.id).all()
    review_count = len(reviews)
    avg_rating = round(sum(r.rating for r in reviews) / review_count, 1) if review_count > 0 else 0.0
    
    comp_sessions = db.query(LearningSession).filter(
        LearningSession.mentor_id == user.id,
        LearningSession.status.ilike("completed")
    ).count()

    ts = user.trust_score
    if not ts:
        ts = calculate_and_update_trust_score(db, user.id)

    return UserDetailResponse(
        id=user.id,
        college_email=user.college_email,
        first_name=user.first_name,
        last_name=user.last_name,
        college=user.college,
        department=user.department,
        year=user.year,
        profile_photo=user.profile_photo,
        bio=user.bio,
        role=user.role,
        verification_status=user.verification_status,
        learning_preferences=user.learning_preferences,
        onboarding_completed=user.onboarding_completed,
        created_at=user.created_at,
        updated_at=user.updated_at,
        full_name=user.full_name,
        teaching_skills=user.teaching_skills,
        learning_interests=user.learning_interests,
        availabilities=user.availabilities,
        trust_score=ts,
        completed_sessions_count=comp_sessions,
        average_rating=avg_rating,
        total_reviews_count=review_count
    )

@router.get("/profile", response_model=UserDetailResponse)
@router.get("/me", response_model=UserDetailResponse)
def get_my_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_user_detail(current_user, db)

@router.put("/profile", response_model=UserDetailResponse)
@router.put("/me", response_model=UserDetailResponse)
def update_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_in.first_name:
        current_user.first_name = profile_in.first_name.strip()
    if profile_in.last_name:
        current_user.last_name = profile_in.last_name.strip()
    if profile_in.department:
        current_user.department = profile_in.department.strip()
    if profile_in.year:
        current_user.year = profile_in.year.strip()
    if profile_in.bio is not None:
        current_user.bio = profile_in.bio
    if profile_in.profile_photo is not None:
        current_user.profile_photo = profile_in.profile_photo
    if profile_in.learning_preferences is not None:
        current_user.learning_preferences = profile_in.learning_preferences

    db.commit()
    db.refresh(current_user)
    return build_user_detail(current_user, db)

@router.post("/onboarding", response_model=UserDetailResponse)
def complete_onboarding(
    onboarding_data: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.department = onboarding_data.department
    current_user.year = onboarding_data.year
    if onboarding_data.bio:
        current_user.bio = onboarding_data.bio
    if onboarding_data.profile_photo:
        current_user.profile_photo = onboarding_data.profile_photo
    if onboarding_data.learning_preferences:
        current_user.learning_preferences = onboarding_data.learning_preferences

    # Save teaching skills
    db.query(UserSkill).filter(UserSkill.user_id == current_user.id).delete()
    for item in onboarding_data.teaching_skills:
        usk = UserSkill(
            user_id=current_user.id,
            skill_id=item.skill_id,
            proficiency_level=item.proficiency_level,
            years_of_experience=item.years_of_experience,
            verification_status="verified"
        )
        db.add(usk)

    # Save learning interests
    db.query(LearningInterest).filter(LearningInterest.user_id == current_user.id).delete()
    for interest in onboarding_data.learning_interests:
        li = LearningInterest(
            user_id=current_user.id,
            skill_id=interest.skill_id,
            desired_level=interest.desired_level,
            priority=interest.priority
        )
        db.add(li)

    # Save availability
    db.query(Availability).filter(Availability.user_id == current_user.id).delete()
    for avail in onboarding_data.availabilities:
        av = Availability(
            user_id=current_user.id,
            day=avail.day,
            start_time=avail.start_time,
            end_time=avail.end_time,
            available=avail.available
        )
        db.add(av)

    current_user.onboarding_completed = True
    db.commit()
    db.refresh(current_user)

    calculate_and_update_trust_score(db, current_user.id)
    return build_user_detail(current_user, db)

@router.get("/mentors", response_model=List[UserDetailResponse])
def list_mentors(
    search: Optional[str] = None,
    department: Optional[str] = None,
    skill_name: Optional[str] = None,
    sort_by: Optional[str] = "trust_score",
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(
        User.role == "student",
        User.verification_status != "suspended",
        User.teaching_skills.any()
    )

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                User.first_name.ilike(search_filter),
                User.last_name.ilike(search_filter),
                User.department.ilike(search_filter),
                User.bio.ilike(search_filter)
            )
        )

    if department:
        query = query.filter(User.department.ilike(f"%{department}%"))

    users = query.all()
    
    # Filter by skill if requested
    if skill_name:
        users = [
            u for u in users
            if any(skill_name.lower() in ts.skill.name.lower() for ts in u.teaching_skills)
        ]

    detailed_users = [build_user_detail(u, db) for u in users]

    # Sort
    if sort_by == "rating":
        detailed_users.sort(key=lambda x: x.average_rating, reverse=True)
    elif sort_by == "sessions":
        detailed_users.sort(key=lambda x: x.completed_sessions_count, reverse=True)
    else:  # default trust_score
        detailed_users.sort(key=lambda x: x.trust_score.score if x.trust_score else 0, reverse=True)

    return detailed_users

@router.get("/mentors/{mentor_id}", response_model=UserDetailResponse)
def get_mentor_by_id(mentor_id: int, db: Session = Depends(get_db)):
    mentor = db.query(User).filter(User.id == mentor_id, User.verification_status != "suspended").first()
    if not mentor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found.")
    return build_user_detail(mentor, db)

@router.get("/availability", response_model=List[AvailabilityResponse])
@router.get("/me/availability", response_model=List[AvailabilityResponse])
def get_my_availability(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Availability).filter(Availability.user_id == current_user.id).all()

@router.put("/availability", response_model=List[AvailabilityResponse])
@router.post("/availability", response_model=List[AvailabilityResponse])
@router.put("/me/availability", response_model=List[AvailabilityResponse])
@router.post("/me/availability", response_model=List[AvailabilityResponse])
def set_my_availability(
    availabilities: List[AvailabilityCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Availability).filter(Availability.user_id == current_user.id).delete()
    new_records = []
    for a in availabilities:
        rec = Availability(
            user_id=current_user.id,
            day=a.day,
            start_time=a.start_time,
            end_time=a.end_time,
            available=a.available
        )
        db.add(rec)
        new_records.append(rec)
    db.commit()
    return db.query(Availability).filter(Availability.user_id == current_user.id).all()
