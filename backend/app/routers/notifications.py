from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.notification import Notification
from app.models.report import Report
from app.models.user import User
from app.schemas.notification import NotificationResponse
from app.schemas.report import ReportCreate, ReportResponse
from app.auth.dependencies import get_current_user

router = APIRouter(tags=["Notifications & Reports"])

@router.get("/notifications", response_model=List[NotificationResponse])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()

@router.get("/notifications/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).count()
    return {"unread_count": count}

@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    notif.read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.post("/notifications/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.read == False
    ).update({"read": True})
    db.commit()
    return {"message": "All notifications marked as read."}

@router.post("/reports", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def submit_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reported_user = db.query(User).filter(User.id == report_in.reported_user_id).first()
    if not reported_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reported user not found.")

    new_report = Report(
        reporter_id=current_user.id,
        reported_user_id=report_in.reported_user_id,
        reason=report_in.reason,
        description=report_in.description,
        status="pending"
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report
