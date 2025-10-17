"""
Lobstr.io Twitter Scraper Integration
Cost: $0.03 per 1,000 tweets (1,333x cheaper than Apify!)
"""
import requests
import time
import json
from typing import Dict, Any, List, Optional
from urllib.parse import urljoin, quote


class LobstrTwitterScraper:
    """Twitter scraper using Lobstr.io API"""
    
    def __init__(self, api_key: str, twitter_auth_token: str = None, twitter_ct0: str = None):
        self.base_url = 'https://api.lobstr.io/v1/'
        self.api_key = api_key
        self.twitter_auth_token = twitter_auth_token
        self.twitter_ct0 = twitter_ct0
        
        # Setup session with authentication
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Token {self.api_key}',
            'Content-Type': 'application/json'
        })
        
        # Crawler hashes
        self.crawler_hash = '1b16ff414d27920fb325b68436dbf5fc'  # Twitter Search
        
        self.sync_id = None
        self._last_run_params = None
        self._account_id = None
    
    def sync_twitter_account(self) -> str:
        """
        Synchronize Twitter account with Lobstr.io
        
        Returns:
            Sync ID
        """
        if not self.twitter_auth_token or not self.twitter_ct0:
            print("⚠️ Warning: No Twitter cookies provided. Some features may be limited.")
            return None
        
        print('Syncing Twitter account...')
        
        payload = {
            'type': 'twitter-sync',
            'cookies': {
                'auth_token': self.twitter_auth_token,
                'ct0': self.twitter_ct0
            }
        }
        
        url = urljoin(self.base_url, 'accounts/cookies')
        
        try:
            response = self.session.post(url, json=payload)
            
            if response.ok:
                sync_id = response.json().get('id')
                print(f'✅ Twitter account synced: {sync_id}')
                self.sync_id = sync_id
                return sync_id
            else:
                print(f'⚠️ Account sync failed: {response.status_code} - {response.text}')
                return None
        except Exception as e:
            print(f'⚠️ Account sync error: {e}')
            return None
    
    def list_squids(self) -> List[Dict[str, Any]]:
        """List all squids in account"""
        url = urljoin(self.base_url, 'squids')
        response = self.session.get(url)
        
        if response.ok:
            data = response.json()
            return data.get('data', [])
        return []
    
    def list_accounts(self) -> List[Dict[str, Any]]:
        """List connected accounts"""
        url = urljoin(self.base_url, 'accounts')
        response = self.session.get(url)
        if response.ok:
            data = response.json()
            if isinstance(data, dict):
                return data.get('data', []) or data.get('results', []) or []
            if isinstance(data, list):
                return data
        return []

    def get_primary_account_id(self) -> Optional[str]:
        """Return the first available account id (Twitter)"""
        if self._account_id:
            return self._account_id
        accounts = self.list_accounts()
        for acc in accounts:
            acc_id = acc.get('id') or acc.get('account_id')
            platform = acc.get('platform') or acc.get('type') or acc.get('name', '')
            if acc_id and ('twitter' in str(platform).lower() or not platform):
                self._account_id = acc_id
                return acc_id
        return None

    def delete_squid(self, squid_id: str):
        """Delete a squid"""
        url = urljoin(self.base_url, f'squids/{squid_id}')
        response = self.session.delete(url)
        
        if response.ok:
            print(f'✅ Deleted squid: {squid_id}')
            return True
        else:
            print(f'⚠️ Failed to delete squid: {response.status_code}')
            return False
    
    def cleanup_old_squids(self):
        """Delete all existing squids to free up slots"""
        print('Cleaning up old squids...')
        squids = self.list_squids()
        
        if not squids:
            print('  No squids to clean up')
            return
        
        print(f'  Found {len(squids)} squids to delete')
        for squid in squids:
            squid_id = squid.get('id')
            if squid_id:
                self.delete_squid(squid_id)
    
    def create_squid(self, crawler_hash: str, max_results: int = 1000) -> str:
        """
        Create a new scraper instance (Squid)
        Will cleanup old squids if slot limit reached
        
        Uses max_pages and results_per_page to control result count
        
        Returns:
            Squid ID
        """
        print('Creating squid...')
        
        # Calculate pages based on max_results
        # Lobstr uses max_pages and results_per_page, not max_results
        results_per_page = min(max_results, 100)  # Cap at 100 per page
        max_pages = max(1, (max_results + results_per_page - 1) // results_per_page)
        
        print(f'  Calculated: max_pages={max_pages}, results_per_page={results_per_page}')
        
        # Build initial payload with params and accounts so squid is ready
        account_id = self.get_primary_account_id()
        payload = {
            'crawler': crawler_hash,
            'concurrency': 1,
            'export_unique_results': True,
            'to_complete': False,
            # max_results goes at TOP LEVEL, not in params!
            'max_results': max_results,
            'max_unique_results_per_run': max_results
        }
        if account_id:
            payload['accounts'] = [account_id]
        
        url = urljoin(self.base_url, 'squids')
        response = self.session.post(url, json=payload)
        
        # If slot limit reached, cleanup and retry
        if not response.ok and 'SlotsLimitExceeded' in response.text:
            print('⚠️ Slot limit reached - cleaning up old squids...')
            self.cleanup_old_squids()
            
            # Retry creation
            response = self.session.post(url, json=payload)
        
        if not response.ok:
            raise Exception(f'Squid creation failed: {response.status_code} - {response.text}')
        
        squid = response.json()
        squid_id = squid.get('id')
        print(f"✅ Squid created: {squid_id} (is_ready={squid.get('is_ready')}, accounts={squid.get('accounts')})")
        return squid_id
    
    def add_tasks(self, squid_id: str, urls: List[str]):
        """Add Twitter URLs as tasks"""
        print(f'Adding {len(urls)} tasks...')
        
        tasks = [{'url': url} for url in urls]
        
        payload = {
            'squid': squid_id,
            'tasks': tasks
        }
        
        url = urljoin(self.base_url, 'tasks')
        response = self.session.post(url, json=payload)
        
        if not response.ok:
            raise Exception(f'Task addition failed: {response.status_code} - {response.text}')
        
        print(f'✅ Added {len(tasks)} tasks')
    
    def attach_account_to_squid(self, squid_id: str):
        """Attach synced Twitter account to squid via supported endpoints"""
        account_id = self.get_primary_account_id()
        if not account_id:
            print('ℹ️ No synced account to attach')
            return
        
        print(f'Attaching account {account_id} to squid {squid_id}...')
        
        tried = []
        # 1) POST /squids/{id}/accounts
        url_accounts = urljoin(self.base_url, f'squids/{squid_id}/accounts')
        payload_accounts = {'accounts': [account_id]}
        resp = self.session.post(url_accounts, json=payload_accounts)
        tried.append(('POST', url_accounts, resp.status_code, resp.text))
        if resp.ok:
            print('✅ Account attached via /accounts endpoint')
            return
        
        # 2) Try singular key
        payload_account = {'account': account_id}
        resp = self.session.post(url_accounts, json=payload_account)
        tried.append(('POST', url_accounts, resp.status_code, resp.text))
        if resp.ok:
            print('✅ Account attached via singular key')
            return
        
        # 3) PUT /squids/{id} with top-level accounts
        url_base = urljoin(self.base_url, f'squids/{squid_id}')
        payload_top = {'accounts': [account_id]}
        resp = self.session.put(url_base, json=payload_top)
        tried.append(('PUT', url_base, resp.status_code, resp.text))
        if resp.ok:
            print('✅ Account attached via top-level PUT')
            return
        
        # 4) POST /squids/{id} with top-level accounts
        resp = self.session.post(url_base, json=payload_top)
        tried.append(('POST', url_base, resp.status_code, resp.text))
        if resp.ok:
            print('✅ Account attached via top-level POST')
            return
        
        # Log attempts for debugging
        print('⚠️ Failed to attach account; attempts:')
        for method, u, code, text in tried:
            print(f'   {method} {u} -> {code} {text[:120]}')
    
    def configure_squid(self, squid_id: str, max_results: int = 1000):
        """Configure squid parameters using UI's method: POST with full squid data"""
        print(f'Configuring squid with max_unique_results_per_run={max_results}...')
        
        url = urljoin(self.base_url, f'squids/{squid_id}')
        
        # Step 1: Get current squid data
        response = self.session.get(url)
        if not response.ok:
            raise Exception(f'Failed to get squid: {response.status_code} - {response.text}')
        
        squid = response.json()
        
        # Step 2: Ensure account is attached first
        account_id = self.get_primary_account_id()
        if account_id:
            # Attach account if not already attached
            current_accounts = squid.get('accounts', [])
            account_ids = [acc['id'] if isinstance(acc, dict) else acc for acc in current_accounts]
            if account_id not in account_ids:
                print(f'  Attaching account {account_id} to squid...')
                self.attach_account_to_squid(squid_id)
                # Refresh squid data after attaching account
                response = self.session.get(url)
                if response.ok:
                    squid = response.json()
        
        # Step 3: Build update payload exactly like the UI does
        # The UI sends: name, no_line_breaks, export_unique_results, to_complete, params
        # IMPORTANT: We must preserve the accounts field!
        payload = {
            'name': squid.get('name'),
            'no_line_breaks': squid.get('no_line_breaks', True),
            'export_unique_results': squid.get('export_unique_results', True),
            'to_complete': squid.get('to_complete', False),
            'params': {
                'max_results': squid.get('params', {}).get('max_results'),
                'max_unique_results_per_run': max_results
            }
        }
        
        # Preserve accounts if they exist (convert to list of IDs)
        if squid.get('accounts'):
            accounts = squid.get('accounts')
            # Convert from [{id: "...", status: "..."}] to ["id1", "id2"]
            account_ids = [acc['id'] if isinstance(acc, dict) else acc for acc in accounts]
            payload['accounts'] = account_ids
        
        # Step 4: POST to update (this is what the UI does!)
        print(f'  Sending POST to {url} with params: {payload["params"]}')
        response = self.session.post(url, json=payload)
        
        if not response.ok:
            raise Exception(f'Failed to configure squid: {response.status_code} - {response.text}')
        
        # Step 5: Verify it worked
        response = self.session.get(url)
        if response.ok:
            squid = response.json()
            actual = squid.get('params', {}).get('max_unique_results_per_run')
            if actual == max_results:
                print(f'  ✅ Successfully set max_unique_results_per_run={actual}')
            else:
                print(f'  ⚠️ Expected {max_results}, got {actual}')
        else:
            print(f'  ⚠️ Could not verify configuration')
    
    def launch_scraping(self, squid_id: str, max_results: int = None) -> str:
        """Start the scraping job"""
        print('Launching scraper...')
        
        payload = {
            'squid': squid_id
        }
        # If configuration failed, try passing params at run level
        if self._last_run_params:
            payload.update(self._last_run_params)
        # Ensure accounts attached at run level
        account_id = self.get_primary_account_id()
        if account_id and 'accounts' not in payload:
            payload['accounts'] = [account_id]
        
        # Add max_unique_results_per_run at RUN level (this is what the UI does!)
        if max_results:
            payload['max_unique_results_per_run'] = max_results
            print(f'  Setting max_unique_results_per_run={max_results} at RUN level')
        
        url = urljoin(self.base_url, 'runs')
        response = self.session.post(url, json=payload)
        if response.ok:
            data = response.json()
            run_id = data.get('id') or data.get('run') or data.get('run_id')
            if not run_id:
                raise Exception(f'Launch succeeded but no run id in response: {data}')
            print(f'✅ Scraping job launched: {run_id}')
            return run_id
        
        # Fallback: try /squids/{id}/launch endpoint
        launch_url_alt = urljoin(self.base_url, f'squids/{squid_id}/launch')
        response_alt = self.session.post(launch_url_alt, json=payload)
        if response_alt.ok:
            data = response_alt.json()
            run_id = data.get('id') or data.get('run') or data.get('run_id')
            if not run_id:
                raise Exception(f'Alt launch succeeded but no run id in response: {data}')
            print(f'✅ Scraping job launched (alt): {run_id}')
            return run_id
        
        # Fetch squid info to display readiness flags
        info_url = urljoin(self.base_url, f'squids/{squid_id}')
        info_resp = self.session.get(info_url)
        if info_resp.ok:
            info = info_resp.json()
            print(f"  Squid is_ready={info.get('is_ready')} accounts={info.get('accounts')} params={info.get('params')}")
        raise Exception(f'Launch failed: {response.status_code} - {response.text}')

    def launch_instant_run(self, search_urls: List[str], max_results: int = 1000) -> Optional[str]:
        """Attempt to run without a squid by providing crawler directly"""
        print('Attempting instant run without squid...')
        tasks = [{'url': u} for u in search_urls]
        payload = {
            'crawler': self.crawler_hash,
            'tasks': tasks,
            'params': {
                'max_results': max_results,
                'max_unique_results_per_run': max_results
            },
            'export_unique_results': True
        }
        account_id = self.get_primary_account_id()
        if account_id:
            payload['accounts'] = [account_id]
        url = urljoin(self.base_url, 'runs')
        resp = self.session.post(url, json=payload)
        if resp.ok:
            run_id = resp.json().get('id')
            print(f'✅ Instant run launched: {run_id}')
            return run_id
        print(f'⚠️ Instant run failed: {resp.status_code} - {resp.text}')
        return None
    
    def wait_for_completion(self, run_id: str, timeout: int = 300) -> bool:
        """Wait for scraping job to complete"""
        print('Monitoring job progress...')
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            url = urljoin(self.base_url, f'runs/{run_id}')
            response = self.session.get(url)
            
            if not response.ok:
                raise Exception(f'Status check failed: {response.status_code}')
            
            run_data = response.json()
            
            status = run_data.get('status', 'unknown')
            if run_data.get('is_done') or status == 'done':
                total = run_data.get('total_results', 0)
                print(f'✅ Job completed! Total results: {total}')
                return True
            results = run_data.get('total_results', 0)
            print(f'  Status: {status} - Results: {results}')
            
            time.sleep(10)
        
        raise Exception('Job timeout')
    
    def cancel_run(self, run_id: str) -> bool:
        """Cancel a running scraping job"""
        url = urljoin(self.base_url, f'runs/{run_id}/cancel')
        response = self.session.post(url)
        
        if response.ok:
            print(f'✅ Run cancelled: {run_id}')
            return True
        else:
            print(f'⚠️ Cancel failed: {response.status_code} - {response.text}')
            return False
    
    def collect_results(self, run_id: str, page_size: int = 100, max_results: int = None, cancel_early: bool = False) -> List[Dict[str, Any]]:
        """Collect all results from completed job"""
        print(f'Collecting results{f" (limit: {max_results})" if max_results else ""}...')
        
        all_results = []
        page = 1
        
        while True:
            # If we have a max_results limit, check if we've reached it
            if max_results and len(all_results) >= max_results:
                print(f'  Reached max_results limit: {max_results}')
                # Try to cancel the run to stop further scraping
                if cancel_early:
                    print('  Attempting to cancel run to save credits...')
                    self.cancel_run(run_id)
                break
            
            params = {
                'run': run_id,
                'page': page,
                'page_size': page_size
            }
            
            url = urljoin(self.base_url, 'results')
            response = self.session.get(url, params=params)
            
            if not response.ok:
                print(f'⚠️ Results collection warning: {response.status_code}')
                break
            
            data = response.json()
            results = data.get('data', [])
            
            if not results:
                break
            
            all_results.extend(results)
            print(f'  Collected page {page}: {len(results)} results (total: {len(all_results)})')
            page += 1
            
            time.sleep(1)  # Rate limiting
        
        # Apply client-side limit if specified
        if max_results and len(all_results) > max_results:
            print(f'  Trimming results from {len(all_results)} to {max_results}')
            all_results = all_results[:max_results]
        
        print(f'✅ Total results collected: {len(all_results)}')
        return all_results
    
    def build_search_url(self, search_term: str, filters: Dict[str, Any] = None) -> str:
        """
        Build Twitter search URL with filters
        
        Args:
            search_term: Search query
            filters: Optional filters (min_retweets, min_likes, verified, etc.)
        """
        # Encode search term
        query_parts = [search_term]
        
        if filters:
            # Add filter operators to Twitter search
            if filters.get('minimumRetweets'):
                query_parts.append(f"min_retweets:{filters['minimumRetweets']}")
            
            if filters.get('minimumFavorites'):
                query_parts.append(f"min_faves:{filters['minimumFavorites']}")
            
            if filters.get('minimumReplies'):
                query_parts.append(f"min_replies:{filters['minimumReplies']}")
            
            if filters.get('onlyVerifiedUsers'):
                query_parts.append("filter:verified")
            
            if filters.get('onlyImage'):
                query_parts.append("filter:images")
            elif filters.get('onlyVideo'):
                query_parts.append("filter:videos")
            
            # Date filters
            if filters.get('start'):
                query_parts.append(f"since:{filters['start']}")
            if filters.get('end'):
                query_parts.append(f"until:{filters['end']}")
            
            # Language
            if filters.get('tweetLanguage'):
                query_parts.append(f"lang:{filters['tweetLanguage']}")
        
        query = ' '.join(query_parts)
        encoded_query = quote(query)
        
        return f'https://x.com/search?q={encoded_query}&src=typed_query&f=live'
    
    def scrape_tweets(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Main scraping method - compatible with existing pipeline
        
        Args:
            params: Search parameters (searchTerms, maxItems, filters, etc.)
            
        Returns:
            List of tweets
        """
        try:
            # Sync account if not already synced
            if not self.sync_id and self.twitter_auth_token:
                self.sync_twitter_account()
            
            # Build search URLs from terms
            search_terms = params.get('searchTerms', [])
            if not search_terms:
                raise ValueError("searchTerms is required")
            
            search_urls = []
            for term in search_terms:
                url = self.build_search_url(term, params)
                search_urls.append(url)
            
            max_results = params.get('maxItems', 100)
            
            # Create squid with params & accounts so it's ready
            squid_id = self.create_squid(self.crawler_hash, max_results=max_results)
            
            # Add tasks
            self.add_tasks(squid_id, search_urls)
            
            # Try to configure (may be unsupported) but proceed regardless
            try:
                self.configure_squid(squid_id, max_results)
            except Exception as cfg_err:
                print(f'ℹ️ Skipping configure step: {cfg_err}')
            
            # Launch with max_results at RUN level
            run_id = self.launch_scraping(squid_id, max_results=max_results)
            
            # Wait and collect
            self.wait_for_completion(run_id, timeout=600)
            results = self.collect_results(run_id, max_results=max_results)
            
            # Transform to standard format
            return self._transform_results(results)
            
        except Exception as e:
            print(f'❌ Lobstr.io scraping failed: {e}')
            import traceback
            traceback.print_exc()
            return []
    
    def _transform_results(self, raw_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform Lobstr.io results to standard tweet format"""
        transformed = []
        
        for item in raw_results:
            # Extract tweet data from Lobstr.io response
            # Adapt field names based on actual Lobstr.io response structure
            tweet = {
                'id': item.get('tweet_id') or item.get('id') or '',
                'tweet_id': item.get('tweet_id') or item.get('id') or '',
                'text': item.get('text') or item.get('full_text') or '',
                'created_at': item.get('created_at') or item.get('timestamp'),
                'author': {
                    'userName': item.get('username') or item.get('author_username') or '',
                    'fullName': item.get('author_name') or '',
                    'followers': item.get('author_followers') or item.get('followers_count') or 0,
                    'following': item.get('author_following') or item.get('following_count') or 0,
                    'verified': item.get('verified') or False,
                },
                'retweetCount': item.get('retweet_count') or item.get('retweets') or 0,
                'likeCount': item.get('like_count') or item.get('likes') or item.get('favorites') or 0,
                'replyCount': item.get('reply_count') or item.get('replies') or 0,
                'quoteCount': item.get('quote_count') or item.get('quotes') or 0,
                'viewCount': item.get('view_count') or item.get('views') or 0,
                'media': item.get('media') or [],
                'hashtags': item.get('hashtags') or [],
                'urls': item.get('urls') or [],
                'raw_data': item,  # Store full raw data
            }
            
            transformed.append(tweet)
        
        return transformed
    
    def estimate_cost(self, max_items: int) -> float:
        """Estimate cost for scraping"""
        cost_per_1k = 0.03  # $0.03 per 1,000 tweets
        return (max_items / 1000) * cost_per_1k
    
    def check_health(self) -> bool:
        """Check if Lobstr.io API is accessible"""
        try:
            url = urljoin(self.base_url, 'me')
            response = self.session.get(url)
            
            if response.ok:
                user_info = response.json()
                print(f"✅ Lobstr.io connected. User: {user_info.get('email', 'N/A')}")
                print(f"   Credits: {user_info.get('credits', 'N/A')}")
                return True
            else:
                print(f"❌ Lobstr.io health check failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Lobstr.io connection error: {e}")
            return False


if __name__ == '__main__':
    # Test Lobstr.io integration
    import os
    
    api_key = 'a27fed0476a5c48f8b46d51bfa3429bc96307e67'
    
    scraper = LobstrTwitterScraper(api_key)
    
    # Health check
    print("\nTesting Lobstr.io connection...")
    print("="*70)
    is_healthy = scraper.check_health()
    
    if is_healthy:
        print("\n✅ Lobstr.io is ready!")
        print(f"   Cost: $0.03 per 1,000 tweets (1,333x cheaper!)")
        print(f"   Your $4 spent could now get: 133,333 tweets!")
    else:
        print("\n❌ Lobstr.io connection failed")
        print("   Check API key and try again")

