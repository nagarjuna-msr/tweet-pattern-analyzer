import requests
from .config import settings
from typing import Optional

def send_telegram_message(message: str) -> bool:
    """Send message via Telegram bot"""
    if not settings.TELEGRAM_BOT_TOKEN or not settings.TELEGRAM_CHAT_ID:
        print("Telegram not configured, skipping notification")
        return False
    
    url = f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendMessage"
    
    payload = {
        "chat_id": settings.TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }
    
    try:
        response = requests.post(url, json=payload)
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to send Telegram message: {e}")
        return False

def notify_new_submission(submission, user):
    """Notify admin of new profile submission"""
    profiles_preview = ', '.join(submission.profile_urls[:3])
    if len(submission.profile_urls) > 3:
        profiles_preview += f"... (+{len(submission.profile_urls) - 3} more)"
    
    message = f"""
🆕 *New Profile Submission!*

*User:* {user.email}
*Submission ID:* {submission.id}
*Profiles:* {len(submission.profile_urls)}
*URLs:* {profiles_preview}
*Expected Delivery:* {submission.expected_delivery_at.strftime('%Y-%m-%d %H:%M UTC')}

[View in Admin Panel]
"""
    send_telegram_message(message)

def notify_new_content_idea(content_idea, user):
    """Notify admin of new content submission"""
    content_preview = content_idea.raw_content[:200]
    if len(content_idea.raw_content) > 200:
        content_preview += "..."
    
    message = f"""
📝 *New Content Idea Submitted!*

*User:* {user.email}
*Idea ID:* {content_idea.id}
*Content Length:* {len(content_idea.raw_content)} characters

*Preview:*
{content_preview}

[View in Admin Panel]
"""
    send_telegram_message(message)

def notify_tweet_feedback(tweet, feedback, user):
    """Notify admin of tweet feedback"""
    feedback_emoji = {
        "use_this": "👍",
        "tweak": "✏️",
        "regenerate": "🔄"
    }
    
    emoji = feedback_emoji.get(feedback.feedback_type, "💬")
    
    message = f"""
{emoji} *Tweet Feedback Received!*

*User:* {user.email}
*Tweet ID:* {tweet.id}
*Feedback Type:* {feedback.feedback_type}

*Tweet:*
{tweet.tweet_text[:200]}

*Feedback Notes:*
{feedback.feedback_notes or 'No notes provided'}

[View in Admin Panel]
"""
    send_telegram_message(message)


