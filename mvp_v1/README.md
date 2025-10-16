# Pattern Analyzer MVP

Twitter Pattern Analysis Service - A "Wizard of Oz" MVP where users submit profiles for analysis and receive AI-generated tweets based on discovered patterns.

**Live URL:** `pattern-analyzer.onrender.com` (after deployment)

## What It Does

1. **Users** submit 5-10 Twitter profile URLs from their niche
2. **You** manually analyze patterns using the scraper + Claude
3. **Users** receive analysis with key patterns
4. **Users** submit content ideas
5. **You** manually generate tweets using patterns
6. **Users** receive 2-10 ready-to-post tweets with reasoning

## Tech Stack

- **Backend:** FastAPI + PostgreSQL + SQLAlchemy
- **Frontend:** React + Vite + Tailwind CSS
- **Deployment:** Render (2 services)
- **Cost:** $14/month

## Project Structure

```
tweet_scraper/
├── backend/          # FastAPI app
│   ├── app/         # Routes, models, auth
│   └── alembic/     # Database migrations
├── frontend/        # React app
│   ├── src/pages/   # User & admin pages
│   └── src/lib/     # API client
├── tweet_scraper/   # Twitter scraper module
└── docs/           # Documentation
```

## Quick Links

- **Setup & Deploy:** [SETUP.md](./SETUP.md)
- **Admin Workflow:** [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- **Scraper API:** [docs/API_REFERENCE.md](./docs/API_REFERENCE.md)
- **Original Plan:** [mvp_v1/MVP_PLAN.md](./mvp_v1/MVP_PLAN.md)

## Quick Start

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python create_admin.py
uvicorn app.main:app --reload --port 8000

# Frontend  
cd frontend
npm install
npm run dev
```

**Access:** http://localhost:5173

**Admin:** `admin@example.com` / `Admin123!`

## Features

**User Side:**
- Email/password auth
- Submit 5-10 profile URLs for analysis
- View pattern analysis results
- Submit content ideas
- View generated tweets with "Why it Works"
- Provide feedback (👍 Use This, ✏️ Tweak, 🔄 Regenerate)

**Admin Side:**
- View all pending submissions
- Upload analysis (key patterns + documents)
- View pending content ideas
- Create tweets with pattern reasoning
- Telegram notifications

## Success Metrics (Target)

- 70%+ complete onboarding
- 50%+ submit profiles
- 30%+ submit content after analysis
- 10+ users in first week

## License

Proprietary

---

**Documentation:** See [SETUP.md](./SETUP.md) for deployment | [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for workflow
