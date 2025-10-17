from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    onboarding_data: dict
    submission_count: int
    weekly_submission_count: int
    is_admin: bool
    
    class Config:
        from_attributes = True

class OnboardingData(BaseModel):
    niche: str = Field(..., min_length=2, max_length=200)
    goals: str  # grow_following, drive_sales, build_authority
    experience_level: str  # beginner, intermediate, advanced

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

# Profile submission schemas
class ProfileSubmissionCreate(BaseModel):
    profile_urls: List[str] = Field(..., min_items=5, max_items=10)
    
    @validator('profile_urls')
    def validate_urls(cls, v):
        for url in v:
            if not ('twitter.com' in url or 'x.com' in url):
                raise ValueError(f'Invalid Twitter URL: {url}')
        return v

class ProfileSubmissionResponse(BaseModel):
    id: int
    user_id: int
    status: str
    submitted_at: datetime
    expected_delivery_at: Optional[datetime]
    profile_urls: List[str]
    
    class Config:
        from_attributes = True

# Analysis schemas
class PatternCard(BaseModel):
    name: str
    explanation: str
    example: str

class AnalysisResultResponse(BaseModel):
    id: int
    submission_id: int
    completed_at: datetime
    key_patterns: List[dict]
    document_url: Optional[str]
    document_type: Optional[str]
    
    class Config:
        from_attributes = True

# Content idea schemas
class ContentIdeaCreate(BaseModel):
    raw_content: str = Field(..., min_length=50, max_length=10000)

class ContentIdeaResponse(BaseModel):
    id: int
    user_id: int
    raw_content: str
    created_at: datetime
    status: str
    tweet_count: int = 0
    
    class Config:
        from_attributes = True

# Generated tweet schemas
class GeneratedTweetResponse(BaseModel):
    id: int
    idea_id: int
    tweet_text: str
    pattern_used: Optional[str]
    reasoning: Optional[str]
    feedback_type: Optional[str]
    feedback_notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TweetFeedback(BaseModel):
    feedback_type: str  # use_this, tweak, regenerate
    feedback_notes: Optional[str] = None

# Prompt template schemas
class PromptTemplateCreate(BaseModel):
    name: str
    category: str
    template_text: str

class PromptTemplateResponse(BaseModel):
    id: int
    name: str
    category: str
    template_text: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Admin schemas
class AnalysisResultCreate(BaseModel):
    submission_id: int
    key_patterns: List[dict]
    document_url: Optional[str] = None
    document_type: Optional[str] = None

class GeneratedTweetCreate(BaseModel):
    idea_id: int
    tweet_text: str
    pattern_used: Optional[str] = None
    reasoning: Optional[str] = None


