from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Onboarding data
    onboarding_data = Column(JSON, default={})  # {niche, goals, experience_level}
    
    # Submission tracking
    submission_count = Column(Integer, default=0)
    weekly_submission_count = Column(Integer, default=0)
    last_submission_reset = Column(DateTime(timezone=True), server_default=func.now())
    
    # Admin flag
    is_admin = Column(Boolean, default=False)
    
    # Relationships
    profile_submissions = relationship("ProfileSubmission", back_populates="user")
    content_ideas = relationship("ContentIdea", back_populates="user")


class ProfileSubmission(Base):
    __tablename__ = "profile_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    status = Column(String, default="pending")  # pending, processing, completed, error
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    expected_delivery_at = Column(DateTime(timezone=True))
    
    profile_urls = Column(JSON, nullable=False)  # Array of Twitter URLs
    
    # Relationships
    user = relationship("User", back_populates="profile_submissions")
    analysis_result = relationship("AnalysisResult", back_populates="submission", uselist=False)


class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("profile_submissions.id"), unique=True, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Key patterns displayed in UI
    key_patterns = Column(JSON, default=[])  # [{name, explanation, example}]
    
    # Full analysis document
    document_url = Column(String)  # Cloudinary URL or file path
    document_type = Column(String)  # md, pdf, txt
    
    # Relationships
    submission = relationship("ProfileSubmission", back_populates="analysis_result")


class ContentIdea(Base):
    __tablename__ = "content_ideas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    raw_content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="pending")  # pending, processing, completed
    
    # Relationships
    user = relationship("User", back_populates="content_ideas")
    generated_tweets = relationship("GeneratedTweet", back_populates="content_idea")


class GeneratedTweet(Base):
    __tablename__ = "generated_tweets"
    
    id = Column(Integer, primary_key=True, index=True)
    idea_id = Column(Integer, ForeignKey("content_ideas.id"), nullable=False)
    
    tweet_text = Column(Text, nullable=False)
    pattern_used = Column(String)  # Pattern name
    reasoning = Column(Text)  # Why it works explanation
    
    # Feedback tracking (latest state)
    feedback_type = Column(String)  # use_this, tweak, regenerate
    feedback_notes = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    content_idea = relationship("ContentIdea", back_populates="generated_tweets")
    feedback_history = relationship("TweetFeedbackHistory", back_populates="tweet", order_by="TweetFeedbackHistory.created_at.desc()")


class TweetFeedbackHistory(Base):
    __tablename__ = "tweet_feedback_history"
    
    id = Column(Integer, primary_key=True, index=True)
    tweet_id = Column(Integer, ForeignKey("generated_tweets.id"), nullable=False)
    
    feedback_type = Column(String, nullable=False)  # use_this, tweak, regenerate
    feedback_notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tweet = relationship("GeneratedTweet", back_populates="feedback_history")


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # analysis, tweet_generation, pattern_extraction
    template_text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


