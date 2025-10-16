from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, AnalysisResult, ProfileSubmission
from ..schemas import AnalysisResultResponse
from ..auth import get_current_user

router = APIRouter(prefix="/api/analysis", tags=["analysis"])

@router.get("/{submission_id}", response_model=AnalysisResultResponse)
def get_analysis(
    submission_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get analysis results for a submission"""
    # Verify submission belongs to user
    submission = db.query(ProfileSubmission).filter(
        ProfileSubmission.id == submission_id,
        ProfileSubmission.user_id == current_user.id
    ).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission not found"
        )
    
    # Get analysis result
    analysis = db.query(AnalysisResult).filter(
        AnalysisResult.submission_id == submission_id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not yet available"
        )
    
    return analysis

@router.get("/{analysis_id}/download")
def download_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get download URL for full analysis document"""
    analysis = db.query(AnalysisResult).join(ProfileSubmission).filter(
        AnalysisResult.id == analysis_id,
        ProfileSubmission.user_id == current_user.id
    ).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if not analysis.document_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not available"
        )
    
    return {
        "download_url": analysis.document_url,
        "document_type": analysis.document_type
    }


