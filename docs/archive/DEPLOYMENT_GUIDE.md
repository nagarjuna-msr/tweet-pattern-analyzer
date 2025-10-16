# Render Deployment Guide - Pattern Analyzer MVP

## Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account with repository
- ✅ Render account (render.com)
- ✅ Telegram bot token and chat ID
- ✅ (Optional) Cloudinary account for file uploads

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository

```bash
cd /Users/nagarjuna/Documents/Projects/tweet_scraper

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "MVP implementation complete"

# Create repository on GitHub, then:
git remote add origin https://github.com/yourusername/pattern-analyzer.git
git branch -M main
git push -u origin main
```

### 1.2 Verify Required Files

Ensure these files exist:
- `backend/requirements.txt`
- `backend/alembic.ini`
- `backend/app/main.py`
- `frontend/package.json`
- `frontend/vite.config.js`
- `render.yaml` (in project root)

## Step 2: Set Up Telegram Bot

### 2.1 Create Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow prompts to name your bot
4. Copy the **bot token** provided

### 2.2 Get Your Chat ID

1. Send a message to your bot
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find `"chat":{"id":YOUR_CHAT_ID}` in the response
4. Copy your **chat ID**

## Step 3: Deploy to Render

### 3.1 Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `pattern-analyzer-db`
   - **Database:** `pattern_analyzer`
   - **User:** (auto-generated)
   - **Region:** Oregon
   - **Plan:** Starter ($7/month)
4. Click **"Create Database"**
5. **Wait** for database to provision (2-3 minutes)
6. Copy the **Internal Database URL** for later

### 3.2 Deploy Backend API

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** and authorize GitHub
3. Select your repository: `pattern-analyzer`
4. Configure:

**Basic Settings:**
- **Name:** `pattern-analyzer-api`
- **Region:** Oregon
- **Branch:** main
- **Root Directory:** (leave empty)
- **Environment:** Python
- **Build Command:**
  ```
  cd backend && pip install --upgrade pip && pip install -r requirements.txt && python create_admin.py && python seed_prompts.py
  ```
- **Start Command:**
  ```
  cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```
- **Plan:** Starter ($7/month)

**Environment Variables:**
Click **"Advanced"** → **"Add Environment Variable"** for each:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_URL` | (Select database: pattern-analyzer-db) | Link to your DB |
| `JWT_SECRET` | (Click "Generate") | Auto-generate |
| `JWT_ALGORITHM` | `HS256` | Fixed value |
| `JWT_EXPIRATION_MINUTES` | `43200` | 30 days |
| `TELEGRAM_BOT_TOKEN` | `your-bot-token-here` | From Step 2.1 |
| `TELEGRAM_CHAT_ID` | `your-chat-id-here` | From Step 2.2 |
| `ADMIN_EMAIL` | `your-email@example.com` | Your admin email |
| `ADMIN_PASSWORD` | `SecurePassword123!` | Change after first login |
| `FRONTEND_URL` | `https://pattern-analyzer.onrender.com` | Will be created next |
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Optional |
| `CLOUDINARY_API_KEY` | `your-api-key` | Optional |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | Optional |

5. Click **"Create Web Service"**
6. **Wait** for deployment (5-10 minutes)
7. Once deployed, copy your API URL: `https://pattern-analyzer-api.onrender.com`

### 3.3 Deploy Frontend

1. Click **"New +"** → **"Static Site"**
2. Select your repository again
3. Configure:

**Basic Settings:**
- **Name:** `pattern-analyzer`
- **Region:** Oregon
- **Branch:** main
- **Root Directory:** (leave empty)
- **Build Command:**
  ```
  cd frontend && npm install && npm run build
  ```
- **Publish Directory:** `frontend/dist`

**Environment Variables:**

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://pattern-analyzer-api.onrender.com` |

4. Click **"Create Static Site"**
5. **Wait** for deployment (3-5 minutes)

### 3.4 Configure Custom Subdomain

1. Go to your static site dashboard
2. Click **"Settings"**
3. Under **"Custom Domain"**, click **"Add Custom Domain"**
4. Enter: `pattern-analyzer` (without .onrender.com)
5. Click **"Save"**

Your site will now be available at: `https://pattern-analyzer.onrender.com`

## Step 4: Verify Deployment

### 4.1 Test Backend

Visit: `https://pattern-analyzer-api.onrender.com/health`

Expected response:
```json
{"status": "healthy"}
```

Check API docs: `https://pattern-analyzer-api.onrender.com/docs`

### 4.2 Test Frontend

1. Visit: `https://pattern-analyzer.onrender.com`
2. You should see the login page
3. Click **"Sign Up"**
4. Create a test account
5. Complete onboarding

### 4.3 Test Telegram Notifications

1. Submit a profile analysis request
2. Check Telegram - you should receive a notification
3. If no notification, check:
   - Telegram bot token is correct
   - Chat ID is correct
   - Backend logs in Render dashboard

## Step 5: Post-Deployment Configuration

### 5.1 Login as Admin

1. Go to login page
2. Use credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Navigate to `/admin`
4. You should see the admin panel

### 5.2 Verify Prompt Templates

1. In backend logs, verify:
   ```
   Seeded 3 prompt templates
   ```
2. Test API:
   ```bash
   curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
     https://pattern-analyzer-api.onrender.com/api/admin/prompts
   ```

### 5.3 Test Full Workflow

1. **As regular user:**
   - Create account
   - Complete onboarding
   - Submit 5 profile URLs
   - Check status dashboard

2. **As admin (you):**
   - Check Telegram for notification
   - Note submission ID
   - Prepare to process manually

## Step 6: Update Backend CORS (If Needed)

If you encounter CORS errors:

1. Go to Render backend dashboard
2. Click **"Environment"**
3. Add/update `FRONTEND_URL`:
   ```
   https://pattern-analyzer.onrender.com
   ```
4. Trigger manual deploy

## Step 7: Set Up Cloudinary (Optional)

For file uploads:

1. Go to https://cloudinary.com/users/register/free
2. Sign up for free tier
3. Get credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret
4. Add to Render backend environment variables
5. Trigger manual deploy

Without Cloudinary, files will be stored temporarily on Render's ephemeral filesystem (not recommended for production).

## Troubleshooting

### Backend Won't Start

**Error:** `ModuleNotFoundError`
- **Solution:** Check build command includes `pip install -r requirements.txt`
- Verify `requirements.txt` is in `/backend/` directory

**Error:** Database connection failed
- **Solution:** Ensure `DATABASE_URL` is linked correctly
- Check database is running (green status in Render)

### Frontend Shows Blank Page

**Error:** CORS error in browser console
- **Solution:** Add frontend URL to backend CORS configuration
- Check `FRONTEND_URL` env var in backend

**Error:** `VITE_API_URL` not defined
- **Solution:** Add `VITE_API_URL` to frontend environment variables
- Trigger manual deploy

### Telegram Not Working

**Error:** No notifications received
- **Solution:** 
  1. Verify bot token with: `curl https://api.telegram.org/bot<TOKEN>/getMe`
  2. Ensure you've sent at least one message to the bot
  3. Verify chat ID is correct
  4. Check backend logs for Telegram errors

### Database Migration Errors

**Error:** Alembic errors during deployment
- **Solution:** 
  1. Connect to database via Render dashboard
  2. Run: `DROP TABLE IF EXISTS alembic_version;`
  3. Trigger manual deploy

## Monitoring

### View Logs

**Backend logs:**
1. Go to backend service dashboard
2. Click **"Logs"** tab
3. Watch for errors in real-time

**Frontend logs:**
1. Go to static site dashboard  
2. Click **"Logs"** tab
3. Check build logs

### Monitor Costs

1. Go to Render dashboard
2. Click **"Account"** → **"Billing"**
3. Expected monthly: ~$14/mo
   - Backend: $7
   - Database: $7
   - Frontend: Free

### Database Backups

Render automatically backs up PostgreSQL:
- Daily backups retained for 7 days
- Point-in-time recovery available

## Maintenance

### Update Code

```bash
# Make changes locally
git add .
git commit -m "Update feature X"
git push origin main
```

Render will automatically deploy the changes.

### Manual Deploy

In Render dashboard:
1. Go to service (backend or frontend)
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### View Database

1. Go to database dashboard
2. Click **"Connect"** 
3. Use provided connection string with psql or pgAdmin

### Backup Database

```bash
# From local machine
pg_dump $(render database connection string) > backup.sql
```

## Security Best Practices

1. **Change admin password immediately after first login**
2. **Use strong JWT_SECRET** (auto-generated is fine)
3. **Keep Telegram bot token private**
4. **Enable 2FA on Render account**
5. **Regularly update dependencies**:
   ```bash
   # Backend
   pip list --outdated
   
   # Frontend
   npm outdated
   ```

## Scaling Considerations

When you exceed 50 users:

1. **Upgrade plans:**
   - Backend: Starter → Standard ($25/mo)
   - Database: Starter → Standard ($20/mo)

2. **Add monitoring:**
   - Integrate Sentry for error tracking
   - Set up uptime monitoring (UptimeRobot)

3. **Optimize:**
   - Add Redis for caching
   - Enable database connection pooling
   - Implement CDN for static assets

## Support

If you encounter issues:

1. **Check Render Status:** https://status.render.com
2. **Render Docs:** https://render.com/docs
3. **Contact Render Support:** support@render.com
4. **Community:** https://community.render.com

---

**Deployment Complete! 🎉**

Your MVP is now live at: `https://pattern-analyzer.onrender.com`

Next: Share with your first users and start validating the concept!


