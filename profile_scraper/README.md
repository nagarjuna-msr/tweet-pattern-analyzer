# Twitter Profile Scraper (Lobstr.io Integration)

## 🎯 Purpose

This is the **core data collection module** for Pattern Analyzer. It scrapes tweets from Twitter profiles using the Lobstr.io API, which is the foundation for pattern analysis.

**⚠️ IMPORTANT: DO NOT DELETE THIS FOLDER**  
This is **active production code**, not archived/old code.

---

## 💰 Cost

- **$0.03 per 1,000 tweets**
- **1,333x cheaper than Apify**
- Example: Scraping 5 tweets costs **$0.00015** (less than a penny!)

---

## 📁 Files

```
profile_scraper/
├── README.md          # This file
├── __init__.py        # Package initialization
└── scraper.py         # Main scraper implementation (664 lines)
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install requests python-dotenv
```

### 2. Set Environment Variables

```bash
# Required
export LOBSTR_API_KEY="your_lobstr_api_key"

# Optional (for authenticated scraping)
export LOBSTR_TWITTER_AUTH_TOKEN="your_twitter_auth_token"
export LOBSTR_TWITTER_CT0="your_twitter_ct0"
```

### 3. Run the Test

```bash
cd /path/to/tweet_scraper
python3 tests/test_scraper.py
```

**Expected Output:**
```
✅ Got 5 tweets
   All from @samruddhi_mokal: 5/5
   🎉 PERFECT! Got exactly 5 tweets from the correct user!

💰 Cost: $0.000150

✅ TEST SUCCESSFUL - SCRAPER WORKS PERFECTLY!
```

---

## 📖 Usage Examples

### Basic Usage

```python
from profile_scraper.scraper import LobstrTwitterScraper

# Initialize
scraper = LobstrTwitterScraper(
    api_key='your_lobstr_api_key',
    twitter_auth_token='your_twitter_auth_token',  # Optional
    twitter_ct0='your_twitter_ct0'                 # Optional
)

# Scrape tweets from a profile
results = scraper.scrape_tweets({
    'searchTerms': ['from:elonmusk -filter:retweets -filter:replies'],
    'maxItems': 20
})

print(f"Got {len(results)} tweets")
```

### Scrape Multiple Profiles

```python
profiles = ['elonmusk', 'naval', 'paulg']

all_tweets = []
for profile in profiles:
    results = scraper.scrape_tweets({
        'searchTerms': [f'from:{profile} -filter:retweets -filter:replies'],
        'maxItems': 20
    })
    all_tweets.extend(results)
    print(f"✅ {profile}: {len(results)} tweets")

print(f"\nTotal: {len(all_tweets)} tweets")
print(f"Cost: ${len(all_tweets) * 0.00003:.6f}")
```

### Extract Tweet Data

```python
for tweet in results:
    raw = tweet.get('raw_data', {})
    
    # Basic info
    text = raw.get('content', '')
    username = raw.get('username', '')
    
    # Engagement metrics
    likes = raw.get('likes', 0)
    retweets = raw.get('retweets', 0)
    replies = raw.get('replies', 0)
    views = raw.get('views', 0)
    
    # Metadata
    created_at = raw.get('created_at', '')
    tweet_url = raw.get('url', '')
    
    print(f"@{username}: {text[:50]}...")
    print(f"  💙 {likes:,} | 🔄 {retweets:,} | 💬 {replies:,} | 👁️ {views:,}")
```

---

## 🔧 API Reference

### Class: `LobstrTwitterScraper`

#### Constructor

```python
LobstrTwitterScraper(
    api_key: str,
    twitter_auth_token: str = None,
    twitter_ct0: str = None
)
```

**Parameters:**
- `api_key` (required): Your Lobstr.io API key
- `twitter_auth_token` (optional): Twitter auth token for authenticated scraping
- `twitter_ct0` (optional): Twitter ct0 cookie for authenticated scraping

#### Main Method: `scrape_tweets`

```python
scraper.scrape_tweets(params: dict) -> List[Dict[str, Any]]
```

**Parameters:**
```python
params = {
    'searchTerms': [        # List of search queries
        'from:username -filter:retweets -filter:replies'
    ],
    'maxItems': 20,         # Max tweets to fetch (default: 20)
    'sortBy': 'Latest'      # 'Latest' or 'Top' (default: Latest)
}
```

**Returns:**
```python
[
    {
        'id': 'tweet_id',
        'raw_data': {
            'username': 'elonmusk',
            'content': 'Tweet text...',
            'likes': 12345,
            'retweets': 678,
            'replies': 90,
            'views': 100000,
            'created_at': '2024-10-17T10:00:00Z',
            'url': 'https://twitter.com/...'
        }
    },
    # ... more tweets
]
```

---

## 🔍 Search Filters

### Common Filters

```python
# From specific user, no retweets or replies
'from:username -filter:retweets -filter:replies'

# Only tweets with media
'from:username filter:media'

# Only tweets with links
'from:username filter:links'

# Minimum engagement
'from:username min_faves:100'

# Date range
'from:username since:2024-01-01 until:2024-12-31'

# Combine multiple filters
'from:username -filter:retweets -filter:replies filter:media min_faves:50'
```

### Multiple Search Terms

```python
params = {
    'searchTerms': [
        'from:user1 -filter:retweets',
        'from:user2 -filter:replies',
        'from:user3 filter:media'
    ],
    'maxItems': 50
}
```

---

## 📊 Response Structure

Each tweet contains:

```python
{
    'id': str,              # Unique tweet ID
    'raw_data': {
        # Content
        'content': str,                  # Tweet text
        'username': str,                 # Author username
        'display_name': str,             # Author display name
        'url': str,                      # Tweet URL
        
        # Engagement
        'likes': int,
        'retweets': int,
        'replies': int,
        'views': int,
        'bookmarks': int,
        
        # Metadata
        'created_at': str,               # ISO timestamp
        'language': str,                 # Tweet language
        'possibly_sensitive': bool,
        
        # Media (if present)
        'media': [
            {
                'type': 'photo' | 'video' | 'gif',
                'url': str,
                'preview_url': str
            }
        ],
        
        # User info
        'user_followers': int,
        'user_following': int,
        'user_verified': bool
    }
}
```

---

## 🧪 Testing

### Run Full Test

```bash
python3 tests/test_scraper.py
```

This will:
1. Initialize scraper with credentials
2. Fetch 5 tweets from `@samruddhi_mokal`
3. Verify all tweets are from correct user
4. Display tweet previews
5. Save results to `tests/samruddhi_mokal_5_tweets.json`
6. Show cost breakdown

### Test Data

Sample test data is available:
- `tests/samruddhi_mokal_5_tweets.json` - 5 tweets
- `tests/samruddhi_mokal_100_tweets.json` - 100 tweets

You can examine these files to see the full response structure.

---

## 🔐 Authentication

### Getting Lobstr API Key

1. Sign up at [lobstr.io](https://lobstr.io)
2. Get your API key from the dashboard
3. Add to environment: `export LOBSTR_API_KEY="your_key"`

### Optional: Twitter Cookies (for rate limits)

If you hit rate limits, you can add your Twitter session cookies:

1. Login to Twitter in your browser
2. Open DevTools → Application → Cookies
3. Copy `auth_token` and `ct0` values
4. Add to environment:
   ```bash
   export LOBSTR_TWITTER_AUTH_TOKEN="your_auth_token"
   export LOBSTR_TWITTER_CT0="your_ct0"
   ```

**Note**: Most scraping works fine without cookies. Only needed for high-volume scraping.

---

## ⚙️ Advanced Configuration

### Pagination

```python
# Fetch more than max_items per request
results = scraper.scrape_tweets({
    'searchTerms': ['from:elonmusk'],
    'maxItems': 100  # Will paginate automatically
})
```

### Error Handling

```python
try:
    results = scraper.scrape_tweets(params)
    print(f"✅ Got {len(results)} tweets")
except Exception as e:
    print(f"❌ Error: {e}")
    # Handle error (retry, log, etc.)
```

### Monitoring Progress

The scraper provides detailed progress logs:
```
Creating squid...
✅ Squid created: 3af6b74869894b6eaf2eb5a8cd71476d
Adding 1 tasks...
✅ Added 1 tasks
Launching scraper...
✅ Scraping job launched: 08af9ea5ee8e4412be611aea09ad6bc4
Monitoring job progress...
  Status: running - Results: 5
✅ Job completed! Total results: 5
```

---

## 📝 Integration with Pattern Analyzer

### In Admin Workflow

When admin processes a profile submission:

```python
from profile_scraper.scraper import LobstrTwitterScraper

# Initialize
scraper = LobstrTwitterScraper(
    api_key=os.getenv('LOBSTR_API_KEY')
)

# Get profile URLs from submission
profile_urls = submission.profile_urls  # ['@elonmusk', '@naval']

all_tweets = []
for url in profile_urls:
    # Extract username
    username = url.split('/')[-1].replace('@', '')
    
    # Scrape tweets
    results = scraper.scrape_tweets({
        'searchTerms': [f'from:{username} -filter:retweets -filter:replies'],
        'maxItems': 20
    })
    
    all_tweets.extend(results)

# Analyze patterns from all_tweets
# Create analysis document
# Save to database
```

---

## 🐛 Troubleshooting

### Issue: "No tweets found"

**Causes:**
- Invalid username
- User has no tweets matching filters
- Account is private

**Solution:**
- Verify username is correct
- Try without filters first: `from:username`
- Check if account is public

### Issue: Rate limits

**Solution:**
- Add Twitter cookies (auth_token, ct0)
- Add delays between requests
- Reduce maxItems per request

### Issue: "Invalid API key"

**Solution:**
- Check `LOBSTR_API_KEY` is set correctly
- Verify key is active on lobstr.io dashboard

### Issue: Slow scraping

**Causes:**
- Large maxItems (100+)
- Multiple search terms

**Solution:**
- Normal for 100+ tweets (takes 1-2 minutes)
- Monitor progress logs to confirm it's working

---

## 💡 Tips & Best Practices

### 1. Start Small
```python
# Test with 5 tweets first
results = scraper.scrape_tweets({
    'searchTerms': ['from:username'],
    'maxItems': 5
})
```

### 2. Use Filters
```python
# Only original content (no RTs/replies)
'from:username -filter:retweets -filter:replies'
```

### 3. Monitor Costs
```python
cost = len(results) * 0.00003
print(f"💰 Cost: ${cost:.6f}")
```

### 4. Save Results
```python
import json

with open('tweets.json', 'w') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
```

### 5. Batch Processing
```python
# Process multiple profiles efficiently
for profile in profiles:
    results = scraper.scrape_tweets({
        'searchTerms': [f'from:{profile} -filter:retweets -filter:replies'],
        'maxItems': 20
    })
    process_tweets(results)
    time.sleep(1)  # Be nice to API
```

---

## 📞 Support

### Issues with Scraper

1. Check environment variables are set
2. Run test script to verify setup
3. Check Lobstr API status
4. Review error messages in output

### Lobstr API Documentation

- [API Docs](https://lobstr.io/docs)
- [Support](https://lobstr.io/support)

---

## 🔄 Changelog

### Current Version
- ✅ Fully functional Lobstr.io integration
- ✅ Automatic pagination
- ✅ Progress monitoring
- ✅ Cost tracking
- ✅ Comprehensive error handling
- ✅ Twitter cookie support
- ✅ Verified working (664 lines, production-ready)

---

## ⚠️ Important Notes

1. **DO NOT DELETE THIS FOLDER** - It's core functionality
2. **Keep credentials secure** - Never commit API keys
3. **Monitor costs** - Though very cheap, track usage
4. **Respect rate limits** - Add delays for bulk scraping
5. **Test before production** - Always test with 5 tweets first

---

**Last Updated**: October 17, 2025  
**Status**: ✅ Production Ready  
**Tested**: ✅ Verified Working (5 tweets from @samruddhi_mokal)

