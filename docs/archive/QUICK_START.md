# Quick Start Guide - Pattern Analyzer MVP

Get your MVP running locally in under 10 minutes.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (or use Docker)

## 1. Clone & Setup (2 min)

```bash
cd /Users/nagarjuna/Documents/Projects/tweet_scraper

# Create Python virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

## 2. Database Setup (2 min)

```bash
# Create database
createdb pattern_analyzer

# Set environment variables
cp .env.example .env
nano .env  # Edit with your values
```

Minimum `.env` configuration:
```
DATABASE_URL=postgresql://localhost:5432/pattern_analyzer
JWT_SECRET=your-super-secret-key-change-this
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

```bash
# Run migrations
alembic upgrade head

# Create admin user & seed data
python create_admin.py
python seed_prompts.py
```

## 3. Start Backend (1 min)

```bash
# From backend directory
uvicorn app.main:app --reload --port 8000
```

Backend running at: http://localhost:8000
API Docs at: http://localhost:8000/docs

## 4. Start Frontend (3 min)

Open new terminal:

```bash
cd /Users/nagarjuna/Documents/Projects/tweet_scraper/frontend

# Install dependencies
npm install

# Create env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

Frontend running at: http://localhost:5173

## 5. Test It Out (2 min)

1. Open http://localhost:5173
2. Click "Sign Up"
3. Create account: `test@example.com` / `Password123`
4. Complete onboarding
5. Submit 5 Twitter profile URLs
6. Check dashboard for status

## Admin Access

Login with:
- Email: `admin@example.com`
- Password: `admin123`

Then navigate to: http://localhost:5173/admin

## Optional: Telegram Notifications

1. Create bot with @BotFather
2. Get bot token
3. Get your chat ID
4. Add to `.env`:
```
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_CHAT_ID=your-chat-id
```
5. Restart backend

## Common Issues

**Port already in use:**
```bash
# Backend (8000)
lsof -ti:8000 | xargs kill -9

# Frontend (5173)
lsof -ti:5173 | xargs kill -9
```

**Database connection error:**
```bash
# Check PostgreSQL is running
psql -l

# Recreate database if needed
dropdb pattern_analyzer
createdb pattern_analyzer
alembic upgrade head
```

**Module not found:**
```bash
# Reinstall dependencies
cd backend
pip install --upgrade pip
pip install -r requirements.txt
```

## API Testing

Use the interactive docs at http://localhost:8000/docs

Or with curl:

```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

## Next Steps

1. ✅ Test full user flow locally
2. ✅ Test admin workflow
3. ✅ Prepare for deployment (see DEPLOYMENT_GUIDE.md)
4. ✅ Deploy to Render
5. ✅ Share with first users

## Development Tips

**Hot reload:**
- Backend: Changes auto-reload with `--reload`
- Frontend: Changes auto-reload with Vite

**View database:**
```bash
psql pattern_analyzer
\dt  # List tables
SELECT * FROM users;
```

**Reset everything:**
```bash
# Backend
dropdb pattern_analyzer
createdb pattern_analyzer
cd backend
alembic upgrade head
python create_admin.py
python seed_prompts.py

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

That's it! You're ready to develop and test the MVP locally.

For deployment to production, see: **DEPLOYMENT_GUIDE.md**


