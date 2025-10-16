# Admin Workflow Guide

How to process user requests manually.

## Admin Access

**Login:** http://localhost:5173/login (or your Render URL)
- Email: `admin@example.com`
- Password: `Admin123!`

**Auto-redirects to:** `/admin`

**Admin Navigation:**
- Admin Panel (overview + pending counts)
- Submissions (process profile requests)
- Content & Tweets (generate tweets)

---

## Workflow 1: Process Profile Submissions

### When User Submits Profiles

**1. You'll see notification** (if Telegram configured)
```
🆕 New Profile Submission!
User: user@example.com
Submission ID: 5
Profiles: 5
```

**2. Go to Admin → Submissions**
- See all pending submissions
- View profile URLs

**3. Run Scraper Locally**

```bash
cd tweet_scraper

# Use existing scraper
python3 examples/simple_example.py
# Edit USERNAME and LIMIT as needed

# Or use module directly
# See docs/API_REFERENCE.md
```

**4. Analyze with Claude**

Prompt structure (keep in your notes):
```
Analyze these Twitter profiles:
[paste profile URLs]

Identify 3-5 key patterns:
1. Pattern name
2. Explanation (2 sentences)
3. Best example tweet

Focus on: hooks, formats, engagement drivers
```

**5. Upload Analysis via UI**

Admin → Submissions → Click "Upload Analysis"

Form fields:
- **Pattern 1-5:** Name, Explanation, Example
- **Document (optional):** Upload MD/PDF/TXT file
- Click "Upload Analysis"

**Done!** User will see:
- Pattern cards in their analysis view
- Download button (if document uploaded)

---

## Workflow 2: Generate Tweets from Content

### When User Submits Content

**1. Notification** (if Telegram configured)
```
📝 New Content Idea Submitted!
User: user@example.com
Content preview: "I've been thinking about..."
```

**2. Go to Admin → Content & Tweets**
- See pending content ideas
- Read full content in expanded view

**3. Generate Tweets with Claude**

Prompt structure:
```
Using these patterns:
[paste patterns from their analysis]

Create 2-10 tweets from this content:
[paste user's content]

For each tweet:
- Max 280 characters
- Apply specific pattern
- Explain why it works
```

**4. Create Tweets via UI**

Admin → Content & Tweets → Click "Create Tweet"

Form fields:
- **Tweet Text:** Max 280 chars
- **Pattern Used:** e.g., "Question-Tension-Promise"
- **Reasoning:** Why this tweet will work

**Repeat 2-10 times** for same content idea (create multiple tweets)

**Done!** User will see:
- All tweets in "My Content" page
- "Why it Works" explanations
- Feedback buttons

---

## Workflow 3: Handle Feedback

### When User Provides Feedback

**Notification:**
```
✏️ Tweet Feedback Received!
Feedback Type: tweak
Notes: "Make it more casual"
```

**Actions:**

**If "Use This" (👍):**
- No action needed
- Track for metrics

**If "Request Tweak" (✏️):**
- Read feedback notes
- Adjust tweet with Claude
- Update via API or recreate

**If "Regenerate" (🔄):**
- Read notes
- Create new tweet
- Delete old one if needed

---

## Quick Reference

### Admin URLs

**Local:**
- Admin Panel: http://localhost:5173/admin
- Submissions: http://localhost:5173/admin/submissions
- Content: http://localhost:5173/admin/content

**Production:**
- Admin Panel: https://pattern-analyzer.onrender.com/admin
- Submissions: https://pattern-analyzer.onrender.com/admin/submissions
- Content: https://pattern-analyzer.onrender.com/admin/content

### Status Flow

**Profile Submissions:**
```
pending → (you upload analysis) → completed
```

**Content Ideas:**
```
pending → (you create tweets) → completed
```

### File Upload

**Supported formats:** .md, .pdf, .txt  
**Storage:** Cloudinary (if configured) or local temp

---

## Tips

**Pattern Quality:**
- 3-5 patterns per analysis
- Clear, memorable names
- Real examples from submitted profiles

**Tweet Quality:**
- Always under 280 characters
- Always apply a specific pattern
- Always explain why it works

**Speed:**
- Target: 8 hours delivery (as shown to users)
- Batch process multiple requests
- Use saved Claude prompts

---

## Database Queries (if needed)

```bash
cd backend
sqlite3 pattern_analyzer.db

# View pending work
SELECT COUNT(*) FROM profile_submissions WHERE status='pending';
SELECT COUNT(*) FROM content_ideas WHERE status='pending';

# View user details
SELECT id, email, submission_count FROM users;
```

---

## API Endpoints (if UI doesn't work)

**Create Analysis:**
```bash
curl -X POST http://localhost:8000/api/admin/analysis/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": 1,
    "key_patterns": [
      {"name": "Pattern", "explanation": "...", "example": "..."}
    ]
  }'
```

**Create Tweet:**
```bash
curl -X POST http://localhost:8000/api/admin/tweets/create \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "idea_id": 1,
    "tweet_text": "Your tweet...",
    "pattern_used": "Pattern Name",
    "reasoning": "Why it works..."
  }'
```

**Get your token:** Login → Browser DevTools → Application → LocalStorage → `token`

---

**See [SETUP.md](./SETUP.md) for deployment details.**

