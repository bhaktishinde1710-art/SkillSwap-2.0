from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from app.database import get_db
from app.models.user import User
from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.models.session import Session as LearningSession
from app.models.review import Review
from app.models.report import Report
from app.schemas.user import UserResponse, UserDetailResponse
from app.schemas.skill import SkillCreate, SkillUpdate, SkillResponse
from app.schemas.session import SessionResponse
from app.schemas.report import ReportResponse, ReportStatusUpdate
from app.schemas.review import ReviewResponse
from app.auth.dependencies import require_admin
from app.routers.users import build_user_detail
from app.services.notification_service import create_notification
from app.services.trust_score_service import calculate_and_update_trust_score
from app.config import settings

router = APIRouter(prefix="/admin", tags=["Admin Suite"])

@router.get("/overview")
def get_admin_overview(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    total_students = db.query(User).filter(User.role == "student").count()
    verified_students = db.query(User).filter(User.role == "student", User.verification_status == "verified").count()
    suspended_users = db.query(User).filter(User.verification_status == "suspended").count()
    
    active_mentors = db.query(User.id).join(UserSkill).distinct().count()
    total_sessions = db.query(LearningSession).count()
    completed_sessions = db.query(LearningSession).filter(LearningSession.status.ilike("completed")).count()
    pending_sessions = db.query(LearningSession).filter(LearningSession.status.ilike("pending")).count()
    cancelled_sessions = db.query(LearningSession).filter(LearningSession.status.ilike("cancelled")).count()
    
    pending_reports = db.query(Report).filter(Report.status == "pending").count()
    
    avg_rating_res = db.query(func.avg(Review.rating)).scalar()
    avg_rating = round(float(avg_rating_res), 2) if avg_rating_res else 4.7
    
    completion_rate = round((completed_sessions / total_sessions * 100), 1) if total_sessions > 0 else 100.0

    return {
        "total_students": total_students,
        "verified_students": verified_students,
        "suspended_users": suspended_users,
        "active_mentors": active_mentors,
        "total_sessions": total_sessions,
        "completed_sessions": completed_sessions,
        "pending_sessions": pending_sessions,
        "cancelled_sessions": cancelled_sessions,
        "completion_rate": completion_rate,
        "pending_reports": pending_reports,
        "average_rating": avg_rating
    }

@router.get("/analytics")
def get_analytics(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Department distribution
    dept_distribution = db.query(
        User.department, func.count(User.id)
    ).filter(User.role == "student").group_by(User.department).all()
    
    dept_data = [{"department": d[0], "count": d[1]} for d in dept_distribution]

    # Popular skills (by user_skills and sessions)
    popular_skills = db.query(
        Skill.name, func.count(UserSkill.id).label("mentor_count")
    ).join(UserSkill, Skill.id == UserSkill.skill_id, isouter=True).group_by(Skill.name).order_by(desc("mentor_count")).limit(8).all()
    
    skills_data = [{"skill": s[0], "mentors": s[1]} for s in popular_skills]

    # Session status breakdown
    session_statuses = db.query(
        LearningSession.status, func.count(LearningSession.id)
    ).group_by(LearningSession.status).all()
    
    session_data = [{"status": s[0], "count": s[1]} for s in session_statuses]

    # Rating distribution
    rating_distribution = db.query(
        Review.rating, func.count(Review.id)
    ).group_by(Review.rating).order_by(Review.rating.asc()).all()
    
    rating_data = [{"stars": f"{r[0]} Star", "count": r[1]} for r in rating_distribution]

    # Academic year distribution
    year_distribution = db.query(
        User.year, func.count(User.id)
    ).filter(User.role == "student").group_by(User.year).all()
    
    year_data = [{"year": y[0], "students": y[1]} for y in year_distribution]

    return {
        "departments": dept_data,
        "popular_skills": skills_data,
        "sessions_breakdown": session_data,
        "rating_distribution": rating_data,
        "year_distribution": year_data
    }

# ---------------- USER MANAGEMENT ---------------- #

@router.get("/users", response_model=List[UserDetailResponse])
def get_all_users(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status_filter: Optional[str] = None,
    role_filter: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        search_like = f"%{search}%"
        query = query.filter(
            or_(
                User.first_name.ilike(search_like),
                User.last_name.ilike(search_like),
                User.college_email.ilike(search_like)
            )
        )
    if department:
        query = query.filter(User.department.ilike(f"%{department}%"))
    if status_filter:
        query = query.filter(User.verification_status == status_filter)
    if role_filter:
        query = query.filter(User.role == role_filter)

    users = query.order_by(User.created_at.desc()).all()
    return [build_user_detail(u, db) for u in users]

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status_action: str = Query(..., pattern="^(verify|suspend|activate|reject)$"),
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    if status_action == "verify":
        target.verification_status = "verified"
        create_notification(db, target.id, "Profile Verified", "Your SkillSwap student profile has been verified by the campus administrator.", "verified")
    elif status_action == "suspend":
        target.verification_status = "suspended"
    elif status_action == "activate":
        target.verification_status = "verified"
    elif status_action == "reject":
        target.verification_status = "rejected"
        create_notification(db, target.id, "Verification Status Updated", "Your college profile verification was reviewed and not approved. Please contact campus admin.", "warning")

    db.commit()
    return {"message": f"User status successfully updated to {target.verification_status}."}

# ---------------- SKILL MANAGEMENT ---------------- #

@router.post("/skills", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def admin_create_skill(
    skill_in: SkillCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Skill).filter(Skill.name.ilike(skill_in.name.strip())).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Skill already exists.")

    new_skill = Skill(
        name=skill_in.name.strip(),
        category=skill_in.category.strip(),
        description=skill_in.description
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return new_skill

@router.put("/skills/{skill_id}", response_model=SkillResponse)
def admin_update_skill(
    skill_id: int,
    skill_in: SkillUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")

    if skill_in.name:
        skill.name = skill_in.name.strip()
    if skill_in.category:
        skill.category = skill_in.category.strip()
    if skill_in.description is not None:
        skill.description = skill_in.description

    db.commit()
    db.refresh(skill)
    return skill

@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_skill(
    skill_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found.")
    db.delete(skill)
    db.commit()
    return None

# ---------------- SESSION AUDITING ---------------- #

@router.get("/sessions", response_model=List[SessionResponse])
def admin_get_all_sessions(
    status_filter: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(LearningSession)
    if status_filter:
        query = query.filter(LearningSession.status.ilike(status_filter))
    return query.order_by(LearningSession.scheduled_date.desc()).all()

# ---------------- REPORTS MANAGEMENT ---------------- #

@router.get("/reports", response_model=List[ReportResponse])
def admin_get_reports(
    status_filter: Optional[str] = None,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if status_filter:
        query = query.filter(Report.status == status_filter)
    return query.order_by(Report.created_at.desc()).all()

@router.patch("/reports/{report_id}/status", response_model=ReportResponse)
def admin_update_report_status(
    report_id: int,
    status_update: ReportStatusUpdate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    report.status = status_update.status
    db.commit()
    db.refresh(report)
    return report

# ---------------- REVIEW MANAGEMENT ---------------- #

@router.get("/reviews", response_model=List[ReviewResponse])
def admin_get_all_reviews(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return db.query(Review).order_by(Review.created_at.desc()).all()

@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_review(
    review_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    rev = db.query(Review).filter(Review.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")
    mentor_id = rev.reviewed_user_id
    db.delete(rev)
    db.commit()
    calculate_and_update_trust_score(db, mentor_id)
    return None

# ---------------- PLATFORM SETTINGS ---------------- #

@router.get("/settings")
def get_platform_settings(admin_user: User = Depends(require_admin)):
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "default_college": settings.DEFAULT_COLLEGE,
        "allowed_email_domains": settings.allowed_domains_list,
        "algorithm_weights": {
            "skill_match": settings.WEIGHT_SKILL_MATCH,
            "proficiency": settings.WEIGHT_PROFICIENCY,
            "availability": settings.WEIGHT_AVAILABILITY,
            "trust_score": settings.WEIGHT_TRUST_SCORE,
            "rating": settings.WEIGHT_RATING,
            "preferences": settings.WEIGHT_PREFERENCES
        }
    }
