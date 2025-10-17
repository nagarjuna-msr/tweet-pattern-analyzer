from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .config import settings
from .database import engine, Base
from .routes import auth, submissions, analysis, content, admin_api

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Create FastAPI app
app = FastAPI(
    title="Pattern Analyzer API",
    description="Twitter Pattern Analysis Service API",
    version="1.0.0"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration - Allow all Render frontend URLs
allowed_origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",  # Vite alternate port
    "https://pattern-analyzer-frontend.onrender.com",  # Static site
    "https://pattern-analyzer-frontend-app.onrender.com",  # Web service (if exists)
]

# Filter out empty strings and ensure unique origins
allowed_origins = list(set(filter(None, allowed_origins)))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(submissions.router)
app.include_router(analysis.router)
app.include_router(content.router)
app.include_router(admin_api.router)

@app.get("/")
def root():
    return {"message": "Pattern Analyzer API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


