# How It Works - Technical Deep Dive

## The Challenge We Solved

**Problem:** Lobstr.io was fetching ALL available tweets instead of respecting limits, causing:
- 127 tweets fetched when only 5 requested
- Wasted credits ($0.00381 instead of $0.00015)
- Unexpected costs

**Solution:** Discovered the exact method Lobstr's UI uses to set result limits.

---

## The Fix: max_unique_results_per_run

### What We Discovered

By inspecting Lobstr's UI network traffic, we found that result limiting requires:

1. **POST method** (not PUT/PATCH) to `/squids/{id}`
2. **Full squid data** in payload (not just params)
3. **Nested params structure**: `params.max_unique_results_per_run`
4. **Accounts as string list**: `['account_id']` not `[{id: "..."}]`

### Implementation

```python
def configure_squid(self, squid_id: str, max_results: int):
    # Get current squid
    squid = requests.get(f'/squids/{squid_id}').json()
    
    # Build payload matching UI
    payload = {
        'name': squid['name'],
        'no_line_breaks': squid['no_line_breaks'],
        'export_unique_results': squid['export_unique_results'],
        'to_complete': squid['to_complete'],
        'params': {
            'max_results': squid['params']['max_results'],
            'max_unique_results_per_run': max_results  # THE KEY
        },
        'accounts': [acc['id'] for acc in squid['accounts']]  # String list
    }
    
    # POST (not PUT/PATCH!)
    requests.post(f'/squids/{squid_id}', json=payload)
```

---

## Workflow

### 1. Sync Twitter Account

```python
POST /accounts/sync/twitter
{
    'auth_token': '...',
    'ct0': '...'
}
```

Returns account ID used for authentication.

### 2. Create Squid

```python
POST /squids
{
    'crawler': '1b16ff414d27920fb325b68436dbf5fc',  # Twitter Search
    'concurrency': 1,
    'export_unique_results': True
}
```

Returns squid ID (scraper instance).

### 3. Add Task

```python
POST /tasks
{
    'squid': 'squid_id',
    'tasks': [{
        'url': 'https://x.com/search?q=from:username...'
    }]
}
```

Adds the Twitter search URL to scrape.

### 4. Configure Squid ⚠️ CRITICAL STEP

```python
POST /squids/{squid_id}  # Note: POST, not PUT/PATCH
{
    'name': 'Twitter Search Results Scraper',
    'no_line_breaks': True,
    'export_unique_results': True,
    'to_complete': False,
    'params': {
        'max_results': None,
        'max_unique_results_per_run': 5  # LIMIT HERE
    },
    'accounts': ['account_id']  # Must be string list!
}
```

This sets the result limit. Without this, Lobstr fetches ALL tweets.

### 5. Launch Run

```python
POST /runs
{
    'squid': 'squid_id',
    'max_unique_results_per_run': 5,  # Backup: set here too
    'accounts': ['account_id']
}
```

Starts the scraping job.

### 6. Monitor Progress

```python
GET /runs/{run_id}
```

Poll until `status == 'done'` or `'completed'`.

### 7. Collect Results

```python
GET /results?run={run_id}&page=1&page_size=100
```

Paginate through results. Each page returns up to 100 items.

---

## Why Twitter Search Queries Must Be Complete

### Wrong Approach ❌

```python
'searchTerms': ['elonmusk']
```

This creates URL: `https://x.com/search?q=elonmusk`
- Searches for tweets **mentioning** "elonmusk"
- Returns tweets FROM anyone talking ABOUT Elon

### Correct Approach ✅

```python
'searchTerms': ['from:elonmusk -filter:retweets -filter:replies']
```

This creates URL: `https://x.com/search?q=from:elonmusk%20-filter:retweets%20-filter:replies`
- Searches for tweets **from** @elonmusk
- Excludes retweets and replies
- Returns only Elon's original tweets

The `build_search_url()` method passes the search term **as-is** to Twitter, so you must provide the complete query.

---

## API Quirks & Gotchas

### 1. Update Method

❌ **Does NOT work:**
```python
PUT /squids/{id}    # 405 Method Not Allowed
PATCH /squids/{id}  # 405 Method Not Allowed
```

✅ **Works:**
```python
POST /squids/{id}   # Updates the squid
```

### 2. Accounts Field

❌ **Does NOT work:**
```python
'accounts': [{'id': 'abc123', 'status': 'synchronized'}]  # Objects
```

✅ **Works:**
```python
'accounts': ['abc123']  # Just IDs as strings
```

### 3. SearchTerms Type

❌ **Does NOT work:**
```python
'searchTerms': 'username'  # String - iterates over characters!
```

✅ **Works:**
```python
'searchTerms': ['username']  # List
```

### 4. Slot Limit

Lobstr allows max 5 squids. When limit hit:
1. Auto-cleanup deletes all old squids
2. Retry squid creation
3. Proceeds normally

---

## Result Limiting: How It Works

### Squid Level (Primary)

Set during configuration:
```python
'params': {
    'max_unique_results_per_run': 20
}
```

This tells Lobstr: "Never return more than 20 results per run."

### Run Level (Backup)

Set during launch:
```python
'max_unique_results_per_run': 20
```

Redundant setting for safety.

### Client Level (Last Resort)

Trim results after collection:
```python
results = results[:max_results]
```

This doesn't save credits (already scraped), but ensures correct count.

---

## Why This Matters

### Before Fix

```
Request: 5 tweets
Lobstr fetches: 127 tweets
Cost: $0.00381 (2540% over budget!)
```

### After Fix

```
Request: 5 tweets  
Lobstr fetches: 5 tweets ✅
Cost: $0.00015 (100% accurate!)
```

**Savings: 98% reduction in unnecessary costs**

---

## Testing Methodology

### 1. Small Test (5 tweets)

```bash
python3 test_working.py
```

Verify:
- Got exactly 5 tweets ✅
- All from correct username ✅
- Cost matches estimate ✅

### 2. Scale Test (100 tweets)

Change `maxItems` to 100, verify same precision.

### 3. Edge Cases

- Account with < N tweets
- Private accounts
- Non-existent accounts
- Accounts with only retweets/replies

All handled gracefully with 0 results.

---

## Architecture

```
User Request
    ↓
TwitterScraper.fetch_profile_tweets()
    ↓
Build Twitter query: "from:username -filter:..."
    ↓
LobstrTwitterScraper._fetch_tweets()
    ↓
[Sync Account] → [Create Squid] → [Add Task]
    ↓
[Configure with max_unique_results_per_run] ⭐ KEY STEP
    ↓
[Launch Run] → [Wait] → [Collect Results]
    ↓
Parse & return Tweet objects
```

The critical step is **Configure with max_unique_results_per_run** - without this, Lobstr fetches everything.

---

## Key Insights

1. **API docs outdated** - Official docs show old "clusters" API, not "squids"
2. **UI inspection essential** - Network tab revealed the correct method
3. **POST for updates** - Counter-intuitive but required
4. **Field preservation** - Must send ALL fields or they reset
5. **Nested params** - `params.max_unique_results_per_run`, not top-level

These insights came from extensive debugging and testing, not documentation.
