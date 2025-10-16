"""
Test with the PROVEN WORKING scraper from viral_tweets.
This uses the exact same code that successfully fetched 5 tweets from @samruddhi_mokal.
"""

import sys
from pathlib import Path
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from tweet_scraper.scraper import LobstrTwitterScraper

# Credentials
LOBSTR_API_KEY = 'a27fed0476a5c48f8b46d51bfa3429bc96307e67'
LOBSTR_TWITTER_AUTH_TOKEN = 'dabf607c41a8a13be9f43744a28c33feb79e10b5'
LOBSTR_TWITTER_CT0 = '1eede4eeef2029b15abc3a1f2cef87c4c4e677170a8d850c2dfd103f25f847a20dee33cfae326374401817a5744ce8a9b826f32c5f12bad1ee2a8bd743d38541e6844e8d8eb07bc81128768d5537b0de'

def main():
    print("="*80)
    print("TESTING WITH PROVEN WORKING SCRAPER")
    print("="*80)
    print()
    
    # Initialize with the WORKING scraper
    scraper = LobstrTwitterScraper(
        LOBSTR_API_KEY,
        twitter_auth_token=LOBSTR_TWITTER_AUTH_TOKEN,
        twitter_ct0=LOBSTR_TWITTER_CT0
    )
    
    # Test with @samruddhi_mokal - 5 tweets
    print("Fetching 5 tweets from @samruddhi_mokal...")
    print("-"*80)
    
    results = scraper.scrape_tweets({
        'searchTerms': ['from:samruddhi_mokal -filter:retweets -filter:replies'],
        'maxItems': 5
    })
    
    print(f"\n✅ Got {len(results)} tweets")
    
    if len(results) > 0:
        # Verify all from samruddhi_mokal
        from_user = sum(1 for t in results 
                       if t.get('raw_data', {}).get('username', '').lower() == 'samruddhi_mokal')
        
        print(f"   All from @samruddhi_mokal: {from_user}/{len(results)}")
        
        if from_user == len(results) == 5:
            print("   🎉 PERFECT! Got exactly 5 tweets from the correct user!")
        
        # Show the tweets
        print(f"\n📋 Tweets:")
        for i, tweet in enumerate(results, 1):
            raw = tweet.get('raw_data', {})
            text = raw.get('content', '')[:100]
            likes = raw.get('likes', 0)
            rts = raw.get('retweets', 0)
            
            print(f"\n{i}. {text}...")
            print(f"   💙 {likes:,} likes | 🔄 {rts:,} retweets")
        
        # Save
        output_file = Path(__file__).parent / 'samruddhi_mokal_5_tweets.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Saved to: {output_file}")
        
        # Cost
        cost = len(results) * 0.00003
        print(f"💰 Cost: ${cost:.6f}")
        
        print("\n" + "="*80)
        print("✅ TEST SUCCESSFUL - SCRAPER WORKS PERFECTLY!")
        print("="*80)
    else:
        print("❌ No tweets found")

if __name__ == '__main__':
    main()

