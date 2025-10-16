from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import User, ContentIdea, GeneratedTweet, TweetFeedbackHistory
from ..schemas import (
    ContentIdeaCreate,
    ContentIdeaResponse,
    GeneratedTweetResponse,
    TweetFeedback
)
from ..auth import get_current_user
from ..telegram_bot import notify_new_content_idea, notify_tweet_feedback

router = APIRouter(prefix="/api/content", tags=["content"])

@router.post("/submit", response_model=ContentIdeaResponse)
def submit_content_idea(
    content_data: ContentIdeaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit content ideas for tweet generation"""
    content_idea = ContentIdea(
        user_id=current_user.id,
        raw_content=content_data.raw_content,
        status="pending"
    )
    
    db.add(content_idea)
    db.commit()
    db.refresh(content_idea)
    
    # Send Telegram notification
    notify_new_content_idea(content_idea, current_user)
    
    return content_idea

@router.get("/my-ideas", response_model=List[ContentIdeaResponse])
def get_my_content_ideas(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all content ideas for current user"""
    ideas = db.query(ContentIdea).filter(
        ContentIdea.user_id == current_user.id
    ).order_by(ContentIdea.created_at.desc()).all()
    
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

@router.get("/{idea_id}/tweets", response_model=List[GeneratedTweetResponse])
def get_generated_tweets(
    idea_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get generated tweets for a content idea"""
    # Verify idea belongs to user
    idea = db.query(ContentIdea).filter(
        ContentIdea.id == idea_id,
        ContentIdea.user_id == current_user.id
    ).first()
    
    if not idea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content idea not found"
        )
    
    tweets = db.query(GeneratedTweet).filter(
        GeneratedTweet.idea_id == idea_id
    ).order_by(GeneratedTweet.created_at.desc()).all()
    
    return tweets

@router.post("/tweets/{tweet_id}/feedback")
def submit_tweet_feedback(
    tweet_id: int,
    feedback: TweetFeedback,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit feedback for a generated tweet"""
    # Verify tweet belongs to user
    tweet = db.query(GeneratedTweet).join(ContentIdea).filter(
        GeneratedTweet.id == tweet_id,
        ContentIdea.user_id == current_user.id
    ).first()
    
    if not tweet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tweet not found"
        )
    
    # Save to feedback history
    feedback_history = TweetFeedbackHistory(
        tweet_id=tweet_id,
        feedback_type=feedback.feedback_type,
        feedback_notes=feedback.feedback_notes
    )
    db.add(feedback_history)
    
    # Update current feedback state on tweet
    tweet.feedback_type = feedback.feedback_type
    tweet.feedback_notes = feedback.feedback_notes
    
    db.commit()
    
    # Send Telegram notification
    notify_tweet_feedback(tweet, feedback, current_user)
    
    return {"message": "Feedback submitted successfully"}


