from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Configure database URL for Render PostgreSQL
database_url = settings.DATABASE_URL

# Determine if using Render Internal URL (no SSL needed) or External URL (SSL required)
# Internal URLs have format: postgresql://user:pass@host-a:5432/db (note the '-a:' in hostname)
# External URLs have format: postgresql://user:pass@host-a.region-postgres.render.com:5432/db
is_internal_url = "-a:" in database_url and "render.com" not in database_url

# Configure connection args based on URL type
connect_args = {"connect_timeout": 10}

if database_url.startswith("postgresql"):
    if is_internal_url:
        # Internal Render connection - no SSL needed (private network)
        pass  # Just use timeout
    else:
        # External connection or non-Render - require SSL
        if "sslmode" not in database_url:
            # Add sslmode=require to connection string
            separator = "&" if "?" in database_url else "?"
            database_url = f"{database_url}{separator}sslmode=require"

# Create engine with production-ready connection pool settings
engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,      # Verify connections before using (prevents stale connections)
    pool_recycle=300,         # Recycle connections after 5 minutes
    pool_size=5,              # Number of connections to maintain
    max_overflow=10,          # Max additional connections when pool is full
    echo=False                # Set to True for SQL query logging during debug
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


