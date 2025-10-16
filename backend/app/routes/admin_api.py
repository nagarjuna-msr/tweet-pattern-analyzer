from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os
import requests
from datetime import datetime

from ..database import get_db
from ..models import (
    User, ProfileSubmission, AnalysisResult,
    ContentIdea, GeneratedTweet, PromptTemplate, TweetFeedbackHistory
)
from ..schemas import (
    AnalysisResultCreate,
    AnalysisResultResponse,
    GeneratedTweetCreate,
    GeneratedTweetResponse,
    PromptTemplateCreate,
    PromptTemplateResponse,
    ProfileSubmissionResponse,
    ContentIdeaResponse
)
from ..auth import get_current_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Admin view all users with stats
@router.get("/users")
def get_all_users(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all users with activity stats (admin only)"""
    users = db.query(User).filter(User.is_admin == False).order_by(
        User.created_at.desc()
    ).all()
    
    result = []
    for user in users:
        # Get counts
        submission_count = db.query(ProfileSubmission).filter(
            ProfileSubmission.user_id == user.id
        ).count()
        
        content_count = db.query(ContentIdea).filter(
            ContentIdea.user_id == user.id
        ).count()
        
        pending_submissions = db.query(ProfileSubmission).filter(
            ProfileSubmission.user_id == user.id,
            ProfileSubmission.status == 'pending'
        ).count()
        
        pending_content = db.query(ContentIdea).filter(
            ContentIdea.user_id == user.id,
            ContentIdea.status == 'pending'
        ).count()
        
        # Get feedback count
        feedback_count = db.query(GeneratedTweet).join(ContentIdea).filter(
            ContentIdea.user_id == user.id,
            GeneratedTweet.feedback_type.isnot(None)
        ).count()
        
        result.append({
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
            "onboarding_data": user.onboarding_data,
            "submission_count": submission_count,
            "content_count": content_count,
            "pending_submissions": pending_submissions,
            "pending_content": pending_content,
            "feedback_count": feedback_count,
            "has_pending_work": pending_submissions > 0 or pending_content > 0
        })
    
    return result

# Admin view specific user details
@router.get("/users/{user_id}")
def get_user_details(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get complete user details with all submissions, content, and feedback (admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all profile submissions with analysis
    submissions = db.query(ProfileSubmission).filter(
        ProfileSubmission.user_id == user_id
    ).order_by(ProfileSubmission.submitted_at.desc()).all()
    
    submissions_data = []
    for sub in submissions:
        analysis = db.query(AnalysisResult).filter(
            AnalysisResult.submission_id == sub.id
        ).first()
        
        submissions_data.append({
            "id": sub.id,
            "status": sub.status,
            "submitted_at": sub.submitted_at,
            "expected_delivery_at": sub.expected_delivery_at,
            "profile_urls": sub.profile_urls,
            "analysis": {
                "id": analysis.id,
                "key_patterns": analysis.key_patterns,
                "document_url": analysis.document_url,
                "completed_at": analysis.completed_at
            } if analysis else None
        })
    
    # Get all content ideas with tweets and feedback
    content_ideas = db.query(ContentIdea).filter(
        ContentIdea.user_id == user_id
    ).order_by(ContentIdea.created_at.desc()).all()
    
    content_data = []
    for idea in content_ideas:
        tweets = db.query(GeneratedTweet).filter(
            GeneratedTweet.idea_id == idea.id
        ).order_by(GeneratedTweet.created_at.desc()).all()
        
        tweets_data = []
        for tweet in tweets:
            # Get feedback history for this tweet
            feedback_history = db.query(TweetFeedbackHistory).filter(
                TweetFeedbackHistory.tweet_id == tweet.id
            ).order_by(TweetFeedbackHistory.created_at.desc()).all()
            
            history_data = [{
                "id": fh.id,
                "feedback_type": fh.feedback_type,
                "feedback_notes": fh.feedback_notes,
                "created_at": fh.created_at
            } for fh in feedback_history]
            
            tweets_data.append({
                "id": tweet.id,
                "tweet_text": tweet.tweet_text,
                "pattern_used": tweet.pattern_used,
                "reasoning": tweet.reasoning,
                "feedback_type": tweet.feedback_type,
                "feedback_notes": tweet.feedback_notes,
                "created_at": tweet.created_at,
                "feedback_history": history_data
            })
        
        content_data.append({
            "id": idea.id,
            "raw_content": idea.raw_content,
            "status": idea.status,
            "created_at": idea.created_at,
            "tweets": tweets_data
        })
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at,
            "onboarding_data": user.onboarding_data
        },
        "submissions": submissions_data,
        "content_ideas": content_data
    }

# Admin view all submissions
@router.get("/submissions", response_model=List[ProfileSubmissionResponse])
def get_all_submissions(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all profile submissions (admin only)"""
    submissions = db.query(ProfileSubmission).order_by(
        ProfileSubmission.submitted_at.desc()
    ).all()
    return submissions

# Admin view all content ideas
@router.get("/content-ideas", response_model=List[ContentIdeaResponse])
def get_all_content_ideas(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all content ideas (admin only)"""
    ideas = db.query(ContentIdea).order_by(
        ContentIdea.created_at.desc()
    ).all()
    
    # Add tweet count to each idea
    result = []
    for idea in ideas:
        idea_dict = {
            "id": idea.id,
            "user_id": idea.user_id,
            "raw_content": idea.raw_content,
            "created_at": idea.created_at,
            "status": idea.status,
            "tweet_count": db.query(GeneratedTweet).filter(GeneratedTweet.idea_id == idea.id).count()
        }
        result.append(idea_dict)
    
    return result

# Cloudinary configuration (free tier)
CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")

def upload_to_cloudinary(file_content: bytes, filename: str) -> str:
    """Upload file to Cloudinary and return URL"""
    if not all([CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET]):
        # Fallback: save locally if Cloudinary not configured
        upload_dir = "/tmp/uploads"
        os.makedirs(upload_dir, exist_ok=True)
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, "wb") as f:
            f.write(file_content)
        return f"/uploads/{filename}"
    
    url = f"https://api.cloudinary.com/v1_1/{CLOUDINARY_CLOUD_NAME}/raw/upload"
    files = {"file": file_content}
    data = {
        "api_key": CLOUDINARY_API_KEY,
        "timestamp": int(datetime.now().timestamp()),
        "upload_preset": "ml_default"
    }
    
    response = requests.post(url, files=files, data=data)
    if response.status_code == 200:
        return response.json()["secure_url"]
    else:
        raise HTTPException(status_code=500, detail="File upload failed")

@router.post("/analysis/create", response_model=AnalysisResultResponse)
def create_analysis_result(
    analysis_data: AnalysisResultCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create analysis result for a submission (admin only)"""
    # Verify submission exists
    submission = db.query(ProfileSubmission).filter(
        ProfileSubmission.id == analysis_data.submission_id
    ).first()
    
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Create analysis result
    analysis = AnalysisResult(
        submission_id=analysis_data.submission_id,
        key_patterns=analysis_data.key_patterns,
        document_url=analysis_data.document_url,
        document_type=analysis_data.document_type
    )
    
    db.add(analysis)
    
    # Update submission status
    submission.status = "completed"
    
    db.commit()
    db.refresh(analysis)
    
    return analysis

@router.post("/analysis/upload-document")
async def upload_analysis_document(
    submission_id: int,
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Upload analysis document (admin only)"""
    # Read file content
    content = await file.read()
    
    # Determine file type
    file_ext = file.filename.split(".")[-1].lower()
    if file_ext not in ["md", "pdf", "txt"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only MD, PDF, TXT allowed")
    
    # Upload to Cloudinary
    url = upload_to_cloudinary(content, file.filename)
    
    return {
        "document_url": url,
        "document_type": file_ext
    }

@router.post("/tweets/create", response_model=GeneratedTweetResponse)
def create_generated_tweet(
    tweet_data: GeneratedTweetCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create generated tweet (admin only)"""
    # Verify idea exists
    idea = db.query(ContentIdea).filter(ContentIdea.id == tweet_data.idea_id).first()
    if not idea:
        raise HTTPException(status_code=404, detail="Content idea not found")
    
    # Create tweet
    tweet = GeneratedTweet(
        idea_id=tweet_data.idea_id,
        tweet_text=tweet_data.tweet_text,
        pattern_used=tweet_data.pattern_used,
        reasoning=tweet_data.reasoning
    )
    
    db.add(tweet)
    
    # Update idea status
    idea.status = "completed"
    
    db.commit()
    db.refresh(tweet)
    
    return tweet

@router.put("/tweets/{tweet_id}", response_model=GeneratedTweetResponse)
def update_generated_tweet(
    tweet_id: int,
    tweet_data: GeneratedTweetCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update generated tweet (admin only)"""
    tweet = db.query(GeneratedTweet).filter(GeneratedTweet.id == tweet_id).first()
    if not tweet:
        raise HTTPException(status_code=404, detail="Tweet not found")
    
    tweet.tweet_text = tweet_data.tweet_text
    if tweet_data.pattern_used:
        tweet.pattern_used = tweet_data.pattern_used
    if tweet_data.reasoning:
        tweet.reasoning = tweet_data.reasoning
    
    db.commit()
    db.refresh(tweet)
    
    return tweet

@router.delete("/tweets/{tweet_id}")
def delete_generated_tweet(
    tweet_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete generated tweet (admin only)"""
    tweet = db.query(GeneratedTweet).filter(GeneratedTweet.id == tweet_id).first()
    if not tweet:
        raise HTTPException(status_code=404, detail="Tweet not found")
    
    db.delete(tweet)
    db.commit()
    
    return {"message": "Tweet deleted successfully"}

# Prompt Templates
@router.post("/prompts", response_model=PromptTemplateResponse)
def create_prompt_template(
    prompt_data: PromptTemplateCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create prompt template (admin only)"""
    prompt = PromptTemplate(**prompt_data.dict())
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt

@router.get("/prompts", response_model=List[PromptTemplateResponse])
def get_prompt_templates(
    category: str = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all prompt templates (admin only)"""
    query = db.query(PromptTemplate)
    if category:
        query = query.filter(PromptTemplate.category == category)
    prompts = query.order_by(PromptTemplate.created_at.desc()).all()
    return prompts

@router.put("/prompts/{prompt_id}", response_model=PromptTemplateResponse)
def update_prompt_template(
    prompt_id: int,
    prompt_data: PromptTemplateCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update prompt template (admin only)"""
    prompt = db.query(PromptTemplate).filter(PromptTemplate.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    
    prompt.name = prompt_data.name
    prompt.category = prompt_data.category
    prompt.template_text = prompt_data.template_text
    
    db.commit()
    db.refresh(prompt)
    return prompt

@router.delete("/prompts/{prompt_id}")
def delete_prompt_template(
    prompt_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete prompt template (admin only)"""
    prompt = db.query(PromptTemplate).filter(PromptTemplate.id == prompt_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt template not found")
    
    db.delete(prompt)
    db.commit()
    return {"message": "Prompt template deleted successfully"}


