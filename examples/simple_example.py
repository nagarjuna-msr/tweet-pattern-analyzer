#!/usr/bin/env python3
"""
SIMPLE EXAMPLE - Fetch tweets from any Twitter profile.

Usage:
    python3 simple_example.py

This script fetches 20 tweets from @samruddhi_mokal.
Edit the USERNAME and LIMIT variables to scrape different profiles.
"""

from tweet_scraper.scraper import LobstrTwitterScraper
import json
from pathlib import Path

# ============================================================================
# CONFIGURATION - Edit these values
# ============================================================================

USERNAME = "samruddhi_mokal"  # Twitter username (without @)
LIMIT = 5                    # Number of tweets to fetch
EXCLUDE_RETWEETS = True        # Skip retweets?
EXCLUDE_REPLIES = True         # Skip replies? (original tweets only)

# Credentials (replace with yours or use environment variables)
LOBSTR_API_KEY = "a27fed0476a5c48f8b46d51bfa3429bc96307e67"
TWITTER_AUTH_TOKEN = "dabf607c41a8a13be9f43744a28c33feb79e10b5"
TWITTER_CT0 = "1eede4eeef2029b15abc3a1f2cef87c4c4e677170a8d850c2dfd103f25f847a20dee33cfae326374401817a5744ce8a9b826f32c5f12bad1ee2a8bd743d38541e6844e8d8eb07bc81128768d5537b0de"

# ============================================================================
# MAIN SCRIPT - No need to edit below this line
# ============================================================================

def main():
    print("="*80)
    print(f"Fetching {LIMIT} tweets from @{USERNAME}")
    print("="*80)
    print()
    
    # Initialize scraper
    scraper = LobstrTwitterScraper(
        LOBSTR_API_KEY,
        twitter_auth_token=TWITTER_AUTH_TOKEN,
        twitter_ct0=TWITTER_CT0
    )
    
    # Check connection
    print("📊 Checking API connection...")
    scraper.check_health()
    print()
    
    # Estimate cost
    cost = scraper.estimate_cost(LIMIT)
    print(f"💰 Estimated cost: ${cost:.6f}")
    print()
    
    # Build query
    query_parts = [f'from:{USERNAME}']
    if EXCLUDE_RETWEETS:
        query_parts.append('-filter:retweets')
    if EXCLUDE_REPLIES:
        query_parts.append('-filter:replies')
    
    query = ' '.join(query_parts)
    print(f"🔍 Query: {query}")
    print()
    
    # Fetch tweets
    print("🚀 Starting scrape...")
    print("-"*80)
    
    try:
        results = scraper.scrape_tweets({
            'searchTerms': [query],  # Must be a LIST!
            'maxItems': LIMIT
        })
        
        print(f"\n{'='*80}")
        print("✅ SCRAPING COMPLETE")
        print("="*80)
        
        # Filter to only tweets from target user
        user_tweets = [
            t for t in results
            if t.get('raw_data', {}).get('username', '').lower() == USERNAME.lower()
        ]
        
        print(f"\nResults:")
        print(f"  Total collected: {len(results)}")
        print(f"  From @{USERNAME}: {len(user_tweets)}")
        
        if len(user_tweets) == LIMIT:
            print(f"  ✅ PERFECT! Got exactly {LIMIT} tweets")
        elif len(user_tweets) == 0:
            print(f"  ⚠️  No tweets found from @{USERNAME}")
            print(f"     The account may:")
            print(f"       - Not exist or be private")
            print(f"       - Have no original tweets (only retweets/replies)")
            return
        else:
            print(f"  ✅ Got {len(user_tweets)} tweets (account has < {LIMIT} tweets)")
        
        # Display tweets
        print(f"\n📋 Tweets:")
        print("-"*80)
        
        for i, tweet in enumerate(user_tweets[:10], 1):  # Show first 10
            raw = tweet.get('raw_data', {})
            
            text = raw.get('content', '')
            text_display = text[:100] + ('...' if len(text) > 100 else '')
            
            likes = raw.get('likes', 0)
            retweets = raw.get('retweets', 0)
            replies = raw.get('reply_count', 0)
            views = raw.get('views_count', 0)
            
            print(f"\n{i}. {text_display}")
            print(f"   💙 {likes:,} likes | 🔄 {retweets:,} RTs | 💬 {replies:,} replies", end='')
            if views:
                print(f" | 👁️  {views:,} views", end='')
            print()
        
        if len(user_tweets) > 10:
            print(f"\n   ... and {len(user_tweets) - 10} more tweets")
        
        # Save to JSON
        output_file = Path(__file__).parent / f'{USERNAME}_{LIMIT}_tweets.json'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Saved to: {output_file}")
        
        # Final cost
        actual_cost = len(results) * 0.00003
        print(f"\n💰 Final Cost:")
        print(f"   Estimated: ${cost:.6f}")
        print(f"   Actual: ${actual_cost:.6f}")
        print(f"   Difference: ${abs(actual_cost - cost):.6f}")
        
        if len(user_tweets) == LIMIT:
            print(f"\n{'🎉'*20}")
            print(f"✅ SUCCESS! Got exactly {LIMIT} tweets as requested!")
            print(f"{'🎉'*20}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()

