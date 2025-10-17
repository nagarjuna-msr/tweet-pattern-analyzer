"""
Test with the PROVEN WORKING scraper from viral_tweets.
This uses the exact same code that successfully fetched 5 tweets from @samruddhi_mokal.
"""

import sys
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from profile_scraper.scraper import LobstrTwitterScraper

# Credentials
LOBSTR_API_KEY = 'a27fed0476a5c48f8b46d51bfa3429bc96307e67'
LOBSTR_TWITTER_AUTH_TOKEN = 'dabf607c41a8a13be9f43744a28c33feb79e10b5'
LOBSTR_TWITTER_CT0 = '1eede4eeef2029b15abc3a1f2cef87c4c4e677170a8d850c2dfd103f25f847a20dee33cfae326374401817a5744ce8a9b826f32c5f12bad1ee2a8bd743d38541e6844e8d8eb07bc81128768d5537b0de'

def main():
    print("="*80)
    print("Scraping tweets for @dharmeshba")
    print("="*80)
    print()
    
    # Initialize with the WORKING scraper
    scraper = LobstrTwitterScraper(
        LOBSTR_API_KEY,
        twitter_auth_token=LOBSTR_TWITTER_AUTH_TOKEN,
        twitter_ct0=LOBSTR_TWITTER_CT0
    )
    
    # Test with @dharmeshba - 150 tweets
    print("Fetching 150 tweets from @dharmeshba...")
    print("-"*80)
    
    results = scraper.scrape_tweets({
        'searchTerms': ['from:dharmeshba -filter:retweets -filter:replies'],
        'maxItems': 150
    })
    
    print(f"\n✅ Got {len(results)} tweets")
    
    if len(results) > 0:
        # Verify all from dharmeshba
        from_user = sum(1 for t in results 
                       if t.get('raw_data', {}).get('username', '').lower() == 'dharmeshba')
        
        print(f"   All from @dharmeshba: {from_user}/{len(results)}")
        
        if from_user == len(results) and len(results) >= 150:
            print(f"   🎉 PERFECT! Got {len(results)} tweets from the correct user!")
        elif from_user == len(results):
            print(f"   🎉 All tweets are from the correct user! Got {len(results)} tweets.")
        
        # Show the first 5 tweets
        print(f"\n📋 Tweets (showing first 5):")
        for i, tweet in enumerate(results[:5], 1):
            raw = tweet.get('raw_data', {})
            text = raw.get('content', '')[:100]
            likes = raw.get('likes', 0)
            rts = raw.get('retweets', 0)
            
            print(f"\n{i}. {text}...")
            print(f"   💙 {likes:,} likes | 🔄 {rts:,} retweets")
        
        # Save
        output_file = Path(__file__).parent / 'dharmeshba_150_tweets.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Saved to: {output_file}")
        
        # Cost
        cost = len(results) * 0.00003
        print(f"💰 Cost: ${cost:.6f}")
        
        print("\n" + "="*80)
        print("✅ SCRAPING SUCCESSFUL!")
        print("="*80)
    else:
        print("❌ No tweets found")

if __name__ == '__main__':
    main()

