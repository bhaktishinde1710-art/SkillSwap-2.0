from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.learning_interest import LearningInterest
from app.models.user import User
from app.schemas.skill import (
    SkillResponse, SkillCreate, UserSkillCreate, UserSkillResponse,
    LearningInterestCreate, LearningInterestResponse
)
from app.auth.dependencies import get_current_user
from app.services.trust_score_service import calculate_and_update_trust_score

router = APIRouter(prefix="/skills", tags=["Skills & Interests"])

@router.get("", response_model=List[SkillResponse])
def get_skills(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Skill)
    if category and category != "All":
        query = query.filter(Skill.category == category)
    if search:
        query = query.filter(Skill.name.ilike(f"%{search}%"))
    return query.order_by(Skill.name.asc()).all()

@router.get("/categories", response_model=List[str])
def get_skill_categories(db: Session = Depends(get_db)):
    cats = db.query(Skill.category).distinct().order_by(Skill.category.asc()).all()
    return [c[0] for c in cats]

@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")
    return skill

@router.post("/my-teaching", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
@router.post("/teaching", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def add_teaching_skill(
    skill_in: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_in.skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")

    existing = db.query(UserSkill).filter(
        UserSkill.user_id == current_user.id,
        UserSkill.skill_id == skill_in.skill_id
    ).first()
    if existing:
        existing.proficiency_level = skill_in.proficiency_level
        existing.years_of_experience = skill_in.years_of_experience
        db.commit()
        db.refresh(existing)
        calculate_and_update_trust_score(db, current_user.id)
        return existing

    usk = UserSkill(
        user_id=current_user.id,
        skill_id=skill_in.skill_id,
        proficiency_level=skill_in.proficiency_level,
        years_of_experience=skill_in.years_of_experience,
        verification_status="verified"
    )
    db.add(usk)
    db.commit()
    db.refresh(usk)
    calculate_and_update_trust_score(db, current_user.id)
    return usk

@router.delete("/my-teaching/{user_skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_teaching_skill(
    user_skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    usk = db.query(UserSkill).filter(
        UserSkill.id == user_skill_id,
        UserSkill.user_id == current_user.id
    ).first()
    if not usk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teaching skill not found.")
    db.delete(usk)
    db.commit()
    calculate_and_update_trust_score(db, current_user.id)
    return None

@router.post("/my-interests", response_model=LearningInterestResponse, status_code=status.HTTP_201_CREATED)
@router.post("/interests", response_model=LearningInterestResponse, status_code=status.HTTP_201_CREATED)
def add_learning_interest(
    interest_in: LearningInterestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == interest_in.skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")

    existing = db.query(LearningInterest).filter(
        LearningInterest.user_id == current_user.id,
        LearningInterest.skill_id == interest_in.skill_id
    ).first()
    if existing:
        existing.desired_level = interest_in.desired_level
        existing.priority = interest_in.priority
        db.commit()
        db.refresh(existing)
        return existing

    li = LearningInterest(
        user_id=current_user.id,
        skill_id=interest_in.skill_id,
        desired_level=interest_in.desired_level,
        priority=interest_in.priority
    )
    db.add(li)
    db.commit()
    db.refresh(li)
    return li

@router.delete("/my-interests/{interest_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_learning_interest(
    interest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    li = db.query(LearningInterest).filter(
        LearningInterest.id == interest_id,
        LearningInterest.user_id == current_user.id
    ).first()
    if not li:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Learning interest not found.")
    db.delete(li)
    db.commit()
    return None
