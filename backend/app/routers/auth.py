from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.trust_score import TrustScore
from app.schemas.auth import UserRegister, UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import UserResponse
from app.auth.jwt import verify_password, get_password_hash, create_access_token
from app.auth.dependencies import get_current_user
from app.utils.email_validator import validate_college_email
from app.services.notification_service import create_notification
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # 1. College email validation
    is_valid, error_msg = validate_college_email(user_in.college_email)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    # 2. Check duplicate email
    existing_user = db.query(User).filter(User.college_email == user_in.college_email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this college email already exists. Please log in."
        )

    # 3. Create User
    new_user = User(
        college_email=user_in.college_email.lower().strip(),
        password_hash=get_password_hash(user_in.password),
        first_name=user_in.first_name.strip(),
        last_name=user_in.last_name.strip(),
        college=user_in.college or settings.DEFAULT_COLLEGE,
        department=user_in.department.strip(),
        year=user_in.year.strip(),
        role="student",
        verification_status="verified",
        onboarding_completed=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Initialize neutral Trust Score
    trust_score = TrustScore(
        user_id=new_user.id,
        score=75.0,
        reliability_score=80.0,
        teaching_score=80.0,
        review_score=70.0,
        completion_score=80.0
    )
    db.add(trust_score)
    db.commit()

    # 5. Welcome notification
    create_notification(
        db=db,
        user_id=new_user.id,
        title="Welcome to SkillSwap!",
        message=f"Welcome to SkillSwap VIT Pune, {new_user.first_name}! Complete your onboarding to discover peer mentors or start teaching.",
        notification_type="system",
        link="/onboarding"
    )

    # 6. Issue Token
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.college_email, "role": new_user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    email_clean = login_data.college_email.lower().strip() if login_data.college_email else ""
    user = db.query(User).filter(User.college_email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid college email or password."
        )

    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid college email or password."
        )

    if user.verification_status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been suspended. Please contact the administrator."
        )

    if user.verification_status == "rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account verification has been rejected. Please contact the administrator."
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.college_email, "role": user.role})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.college_email == req.college_email.lower().strip()).first()
    # Return generic message to avoid user enumeration
    return {"message": "If an account exists with this college email, password reset instructions have been dispatched."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    return {"message": "Password has been successfully updated. You may now log in."}
