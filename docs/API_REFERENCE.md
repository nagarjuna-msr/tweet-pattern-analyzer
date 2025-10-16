# API Reference

## LobstrTwitterScraper

Main class for Twitter scraping via Lobstr.io.

### Initialization

```python
LobstrTwitterScraper(
    api_key: str,
    twitter_auth_token: str = None,
    twitter_ct0: str = None
)
```

**Parameters:**
- `api_key` (required): Lobstr.io API key
- `twitter_auth_token` (optional): Twitter auth cookie
- `twitter_ct0` (optional): Twitter ct0 cookie

**Example:**
```python
scraper = LobstrTwitterScraper(
    api_key="abc123...",
    twitter_auth_token="def456...",
    twitter_ct0="ghi789..."
)
```

---

### scrape_tweets()

Main method to fetch tweets.

```python
scrape_tweets(params: Dict[str, Any]) -> List[Dict[str, Any]]
```

**Parameters:**
- `params['searchTerms']` (required, list): List of Twitter search queries
- `params['maxItems']` (optional, int): Max tweets to fetch (default: 100)

**Returns:**
List of tweet dictionaries with `raw_data` field

**Example:**
```python
results = scraper.scrape_tweets({
    'searchTerms': ['from:elonmusk -filter:retweets -filter:replies'],
    'maxItems': 20
})
```

**Important:** `searchTerms` must be a **list** containing complete Twitter search queries.

---

### check_health()

Check API connectivity and account status.

```python
check_health() -> None
```

**Prints:**
- API connection status
- User email
- Credit balance (if available)

**Example:**
```python
scraper.check_health()
# Output:
# ✅ Lobstr.io connected. User: your@email.com
# Credits: N/A
```

---

### estimate_cost()

Estimate cost for scraping N tweets.

```python
estimate_cost(num_tweets: int) -> float
```

**Parameters:**
- `num_tweets`: Number of tweets

**Returns:**
Cost in USD

**Example:**
```python
cost = scraper.estimate_cost(100)
print(f"Cost: ${cost:.6f}")  # Cost: $0.003000
```

---

## Twitter Search Query Syntax

### Basic Structure

```
from:username [filters] [operators]
```

### Common Filters

| Filter | Description |
|--------|-------------|
| `-filter:retweets` | Exclude retweets |
| `-filter:replies` | Exclude replies |
| `lang:en` | English tweets only |
| `min_faves:100` | Min 100 likes |
| `min_retweets:50` | Min 50 retweets |
| `since:2025-01-01` | After this date |
| `until:2025-12-31` | Before this date |

### Example Queries

**Original tweets only:**
```
from:elonmusk -filter:retweets -filter:replies
```

**Viral tweets (100+ likes):**
```
from:sama -filter:retweets -filter:replies min_faves:100
```

**Recent tweets (last 7 days):**
```
from:naval -filter:retweets since:2025-10-08
```

**English tweets with media:**
```
from:sama lang:en filter:images -filter:retweets
```

---

## Data Structure

### Tweet Result

```python
{
    'raw_data': {
        # Identity
        'username': 'elonmusk',
        'name': 'Elon Musk',
        'user_id': '123456789',
        
        # Content
        'content': 'Tweet text here...',
        'tweet_url': 'https://twitter.com/elonmusk/status/...',
        'internal_unique_id': '1234567890',
        
        # Engagement
        'likes': 12345,
        'retweets': 678,
        'reply_count': 90,
        'quote_count': 12,
        'views_count': 1000000,
        'bookmarks_count': 234,
        
        # Metadata
        'published_at': '2025-10-15T12:00:00Z',
        'scraping_time': '2025-10-15T12:05:00Z',
        
        # Media (if present)
        'media_0_url': 'https://pbs.twimg.com/...',
        'media_0_type': 'photo',
        'media_0_thumbnail': 'https://...',
        # ... up to media_3
        
        # Flags
        'is_quoted': False,
        'is_retweeted': False
    }
}
```

### Accessing Data

```python
for tweet in results:
    raw = tweet['raw_data']
    
    # Text content
    text = raw.get('content', '')
    
    # Engagement metrics
    likes = raw.get('likes', 0)
    retweets = raw.get('retweets', 0)
    replies = raw.get('reply_count', 0)
    views = raw.get('views_count', 0)
    
    # Metadata
    username = raw.get('username', '')
    url = raw.get('tweet_url', '')
    date = raw.get('published_at', '')
    
    # Media
    has_media = raw.get('media_0_url') is not None
    media_url = raw.get('media_0_url')
```

---

## Error Handling

```python
try:
    results = scraper.scrape_tweets({
        'searchTerms': ['from:username -filter:retweets -filter:replies'],
        'maxItems': 50
    })
except ValueError as e:
    print(f"Invalid parameters: {e}")
except Exception as e:
    print(f"Scraping failed: {e}")
```

---

## Advanced Usage

### Multiple Search Queries

```python
# Fetch from multiple users in one run
results = scraper.scrape_tweets({
    'searchTerms': [
        'from:elonmusk -filter:retweets -filter:replies',
        'from:sama -filter:retweets -filter:replies',
    ],
    'maxItems': 50  # 50 total across all queries
})
```

### Custom Processing

```python
results = scraper.scrape_tweets({
    'searchTerms': ['from:elonmusk -filter:retweets -filter:replies'],
    'maxItems': 100
})

# Filter high-engagement tweets
viral_tweets = [
    tweet for tweet in results
    if tweet['raw_data'].get('likes', 0) > 1000
]

# Extract just the text
texts = [tweet['raw_data'].get('content', '') for tweet in results]

# Save to CSV
import csv
with open('tweets.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Username', 'Text', 'Likes', 'Retweets', 'URL'])
    
    for tweet in results:
        raw = tweet['raw_data']
        writer.writerow([
            raw.get('username'),
            raw.get('content'),
            raw.get('likes'),
            raw.get('retweets'),
            raw.get('tweet_url')
        ])
```

---

## Performance

- **Speed**: ~30-60 seconds for 20 tweets
- **Rate limiting**: Built-in delays between pages
- **Auto-cleanup**: Automatically deletes old squids if slot limit reached
- **Concurrency**: Uses 1 concurrent connection (safer, more reliable)

---

## Limits

- **Lobstr slot limit**: 5 squids max (auto-cleaned)
- **Results per request**: Recommended max 1,000 tweets
- **Page size**: 100 results per page
- **Timeout**: 600 seconds (10 minutes) default

---

## Best Practices

1. **Start small**: Test with 5-10 tweets first
2. **Use filters**: Exclude retweets/replies to get original content only
3. **Check costs**: Use `estimate_cost()` before large fetches
4. **Handle errors**: Wrap in try/except for production use
5. **Save results**: Always save to JSON immediately after fetching

---

## Complete Example

```python
from lobstr_scraper_core import LobstrTwitterScraper
import json

# Initialize
scraper = LobstrTwitterScraper(
    api_key="your_key",
    twitter_auth_token="your_token",
    twitter_ct0="your_ct0"
)

# Check connection
scraper.check_health()

# Estimate cost
cost = scraper.estimate_cost(100)
print(f"Estimated cost for 100 tweets: ${cost:.6f}")

# Fetch tweets
results = scraper.scrape_tweets({
    'searchTerms': ['from:sama -filter:retweets -filter:replies lang:en'],
    'maxItems': 100
})

# Process and save
tweets_data = []
for tweet in results:
    raw = tweet['raw_data']
    tweets_data.append({
        'text': raw.get('content', ''),
        'likes': raw.get('likes', 0),
        'retweets': raw.get('retweets', 0),
        'url': raw.get('tweet_url', ''),
        'date': raw.get('published_at', '')
    })

# Save to JSON
with open('tweets.json', 'w', encoding='utf-8') as f:
    json.dump(tweets_data, f, indent=2, ensure_ascii=False)

print(f"✅ Saved {len(tweets_data)} tweets")
```

That's all you need! 🚀
