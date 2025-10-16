from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Add SSL and connection pool settings for PostgreSQL on Render
connect_args = {}
if settings.DATABASE_URL.startswith("postgresql"):
    connect_args = {
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000"
    }

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=300,     # Recycle connections after 5 minutes
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


