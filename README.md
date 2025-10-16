# Tweet Pattern Analyzer

> **Status:** Private MVP - In Development

An intelligent platform for analyzing tweet patterns from successful profiles and generating engaging content based on proven strategies.

## 🎯 Overview

Tweet Pattern Analyzer helps users understand what makes great tweets work by analyzing successful profiles and generating personalized content ideas and tweet drafts.

### Key Features

- **Profile Analysis**: Submit Twitter profiles for in-depth pattern analysis
- **Content Ideas**: Get AI-generated content ideas based on analyzed patterns
- **Tweet Generation**: Receive 3 tweet variations for each content idea
- **User Feedback**: Rate tweets and provide feedback (Save/Tweak/Regenerate)
- **Admin Panel**: User-centric admin interface with complete feedback history

## 🏗 Tech Stack

**Backend:**
- FastAPI (Python 3.9+)
- PostgreSQL (Production) / SQLite (Development)
- SQLAlchemy ORM
- Alembic for migrations
- JWT Authentication
- Telegram Bot for admin notifications

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Query for state management
- React Router for navigation

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ (for production)
- Docker (optional, for local PostgreSQL)

### Local Development

1. **Clone the repository**
   ```bash
   git clone git@github.com:YOUR_USERNAME/tweet-pattern-analyzer.git
   cd tweet-pattern-analyzer
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Copy environment template
   cp ../env.example .env
   # Edit .env with your configuration
   
   # Run migrations
   alembic upgrade head
   
   # Create admin user
   python create_admin.py
   
   # Start server
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
tweet-pattern-analyzer/
├── backend/
│   ├── alembic/              # Database migrations
│   ├── app/
│   │   ├── routes/           # API endpoints
│   │   ├── models.py         # SQLAlchemy models
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # JWT authentication
│   │   └── main.py           # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/            # React pages
│   │   ├── components/       # Reusable components
│   │   └── App.jsx           # Main app component
│   └── package.json
├── docs/                     # Documentation
├── mvp_v1/                   # MVP planning docs
└── README.md
```

## 🔐 Environment Variables

Required environment variables (see `env.example`):

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256

# Telegram (for admin notifications)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ADMIN_CHAT_ID=your-chat-id

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Lobstr.io (for Twitter scraping)
LOBSTR_API_KEY=your-api-key
```

## 📊 Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Check migrations
alembic upgrade head
alembic downgrade base
alembic upgrade head
```

## 🚢 Deployment

### Render Deployment

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Create new PostgreSQL instance
   - Copy connection URL

2. **Deploy Backend**
   - Connect GitHub repository
   - Select `backend/render.yaml`
   - Add environment variables
   - Deploy

3. **Deploy Frontend**
   - Create new Static Site
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
   - Deploy

Detailed deployment guide: [mvp_v1/SETUP.md](mvp_v1/SETUP.md)

## 📖 Documentation

- [MVP Plan](mvp_v1/MVP_PLAN.md)
- [Setup Guide](mvp_v1/SETUP.md)
- [Admin Guide](mvp_v1/ADMIN_GUIDE.md)
- [Technical Spec](mvp_v1/TECHNICAL_SPEC.md)
- [API Reference](docs/API_REFERENCE.md)
- [How It Works](docs/HOW_IT_WORKS.md)

## 🔄 Recent Updates

- ✅ PostgreSQL migration complete
- ✅ User-centric admin interface
- ✅ Complete feedback history tracking
- ✅ Context-aware dashboard UI
- ✅ Multi-user support

## 🛠 Development Workflow

1. Create feature branch from `main`
2. Make changes and test locally
3. Commit with descriptive messages
4. Push to GitHub
5. Create Pull Request
6. Review and merge

## 📝 License

Private - All Rights Reserved

## 👥 Team

Private MVP project - Access restricted to authorized users only.

---

**Note:** This is a private repository. Do not share credentials or access tokens in commits or issues.

