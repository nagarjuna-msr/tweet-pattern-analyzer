# Setup & Deployment

## Local Development

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env (edit values)
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./pattern_analyzer.db
JWT_SECRET=your-secret-key-minimum-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=43200
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
FRONTEND_URL=http://localhost:5173
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF

# Initialize database
alembic upgrade head
python create_admin.py

# Run
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env
npm run dev
```

**Access:** http://localhost:5173  
**Admin:** `admin@example.com` / `Admin123!`

---

## Render Deployment

### Step 1: GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/pattern-analyzer.git
git push -u origin main
```

### Step 2: PostgreSQL Database

Render Dashboard → New + → PostgreSQL

```
Name: pattern-analyzer-db
Plan: Starter ($7/mo)
Region: Oregon
```

Wait for provisioning (2-3 min).

### Step 3: Backend API

Render Dashboard → New + → Web Service

**Connect GitHub repository**

```
Name: pattern-analyzer-api
Region: Oregon
Environment: Python
Plan: Starter ($7/mo)

Build Command:
cd backend && pip install -r requirements.txt && python create_admin.py

Start Command:
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**

| Key | Value |
|-----|-------|
| DATABASE_URL | (Link database: pattern-analyzer-db) |
| JWT_SECRET | (Auto-generate) |
| JWT_ALGORITHM | HS256 |
| JWT_EXPIRATION_MINUTES | 43200 |
| ADMIN_EMAIL | your@email.com |
| ADMIN_PASSWORD | SecurePass123! |
| FRONTEND_URL | https://pattern-analyzer.onrender.com |
| TELEGRAM_BOT_TOKEN | (optional) |
| TELEGRAM_CHAT_ID | (optional) |

Click **Create Web Service** → Wait 5-10 min

**Copy URL:** `https://pattern-analyzer-api.onrender.com`

### Step 4: Frontend Static Site

Render Dashboard → New + → Static Site

**Connect same GitHub repository**

```
Name: pattern-analyzer
Region: Oregon

Build Command:
cd frontend && npm install && npm run build

Publish Directory:
frontend/dist
```

**Environment Variables:**

| Key | Value |
|-----|-------|
| VITE_API_URL | https://pattern-analyzer-api.onrender.com |

Click **Create Static Site** → Wait 3-5 min

### Step 5: Verify

1. Visit: https://pattern-analyzer.onrender.com
2. Create account or login as admin
3. Test submission flow
4. Test admin processing

---

## Telegram Bot (Optional)

```bash
# 1. Create bot
# Open Telegram → Search @BotFather → /newbot

# 2. Get chat ID
# Send message to your bot, then:
curl https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates

# 3. Add to Render backend environment
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_CHAT_ID=your-chat-id

# 4. Trigger manual deploy
```

---

## Database Migration

When you update models:

```bash
cd backend
source venv/bin/activate

# Create migration
alembic revision --autogenerate -m "Description"

# Apply locally
alembic upgrade head

# Deploy to Render
git add .
git commit -m "Database migration"
git push
```

Render auto-runs migrations on deploy.

---

## Update Code

```bash
# Local
git add .
git commit -m "Update feature"
git push

# Render auto-deploys
```

**Manual deploy:** Render Dashboard → Service → Manual Deploy

---

## Troubleshooting

**Port in use:**
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

**Module not found:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend build errors:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**Database connection:**
```bash
# Check format
echo $DATABASE_URL
# Should be: postgresql://... or sqlite:///...
```

**CORS errors:**
- Verify `FRONTEND_URL` in backend .env
- Check browser console for actual error

---

## Monitoring

**Backend logs:**
```bash
tail -f backend/backend.log
```

**Frontend logs:**
```bash
tail -f frontend/frontend.log
```

**Production logs:**
- Render Dashboard → Service → Logs tab

**Database query:**
```bash
cd backend
sqlite3 pattern_analyzer.db  # Local
# or use Render's "Connect" button
```

---

## Costs

- Backend: $7/mo
- PostgreSQL: $7/mo
- Frontend: Free
- **Total: $14/mo**

Upgrade when >50 users or >1GB database.

---

See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) for processing workflow.
