from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

from ..database import get_db
from ..models import User, ProfileSubmission
from ..schemas import ProfileSubmissionCreate, ProfileSubmissionResponse
from ..auth import get_current_user
from ..telegram_bot import notify_new_submission

router = APIRouter(prefix="/api/submissions", tags=["submissions"])

def check_weekly_limit(user: User, db: Session):
    """Check and reset weekly submission limit"""
    # Calculate start of current week (Monday)
    today = datetime.utcnow()
    days_since_monday = today.weekday()
    week_start = (today - timedelta(days=days_since_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Reset if last reset was before this week
    if user.last_submission_reset < week_start:
        user.weekly_submission_count = 0
        user.last_submission_reset = datetime.utcnow()
        db.commit()
    
    # Check limit
    if user.weekly_submission_count >= 10:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Weekly submission limit reached (10 submissions per week)"
        )

@router.post("/profiles", response_model=ProfileSubmissionResponse)
def submit_profiles(
    submission_data: ProfileSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit Twitter profiles for analysis"""
    # Check weekly limit
    check_weekly_limit(current_user, db)
    
    # Calculate expected delivery (8 hours from now)
    expected_delivery = datetime.utcnow() + timedelta(hours=8)
    
    # Create submission
    submission = ProfileSubmission(
        user_id=current_user.id,
        profile_urls=submission_data.profile_urls,
        expected_delivery_at=expected_delivery,
        status="pending"
    )
    
    db.add(submission)
    
    # Update user counters
    current_user.submission_count += 1
    current_user.weekly_submission_count += 1
    
    db.commit()
    db.refresh(submission)
    
    # Send Telegram notification
    notify_new_submission(submission, current_user)
    
    return submission

@router.get("/my-submissions", response_model=List[ProfileSubmissionResponse])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all submissions for current user"""
    submissions = db.query(ProfileSubmission).filter(
        ProfileSubmission.user_id == current_user.id
    ).order_by(ProfileSubmission.submitted_at.desc()).all()
    
    return submissions

@router.get("/{submission_id}", response_model=ProfileSubmissionResponse)
def get_submission(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific submission"""
    submission = db.query(ProfileSubmission).filter(
        ProfileSubmission.id == submission_id,
        ProfileSubmission.user_id == current_user.id
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    return submission


