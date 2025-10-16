"""Script to create admin user"""
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash
from app.config import settings

def create_admin():
    db = SessionLocal()
    
    # Check if admin exists
    existing_admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if existing_admin:
        print(f"Admin user already exists: {settings.ADMIN_EMAIL}")
        return
    
    # Create admin user
    admin = User(
        email=settings.ADMIN_EMAIL,
        password_hash=get_password_hash(settings.ADMIN_PASSWORD),
        is_admin=True
    )
    
    db.add(admin)
    db.commit()
    
    print(f"Admin user created: {settings.ADMIN_EMAIL}")
    print(f"Password: {settings.ADMIN_PASSWORD}")
    print("Please change the password after first login!")

if __name__ == "__main__":
    create_admin()


