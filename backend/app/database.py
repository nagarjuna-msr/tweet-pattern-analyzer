from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Configure database URL with SSL for Render PostgreSQL
database_url = settings.DATABASE_URL

# Render PostgreSQL requires sslmode=require
if database_url.startswith("postgresql") and "sslmode" not in database_url:
    # Add sslmode parameter to connection string
    separator = "&" if "?" in database_url else "?"
    database_url = f"{database_url}{separator}sslmode=require"

# Connection pool and timeout settings
connect_args = {}
if database_url.startswith("postgresql"):
    connect_args = {
        "connect_timeout": 10,
        "sslmode": "require"  # Explicitly require SSL
    }

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,      # Verify connections before using
    pool_recycle=300,         # Recycle connections after 5 minutes
    pool_size=5,              # Connection pool size
    max_overflow=10           # Max overflow connections
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for FastAPI routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


