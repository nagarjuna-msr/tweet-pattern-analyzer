"""Seed initial prompt templates"""
from app.database import SessionLocal
from app.models import PromptTemplate

def seed_prompts():
    db = SessionLocal()
    
    # Check if prompts already exist
    existing = db.query(PromptTemplate).first()
    if existing:
        print("Prompt templates already exist, skipping seed")
        return
    
    prompts = [
        {
            "name": "Profile Analysis - Basic",
            "category": "analysis",
            "template_text": """Analyze the following Twitter profiles and identify:

1. Common content patterns (hooks, formats, structures)
2. Engagement drivers (what makes people interact)
3. Tone and voice patterns
4. Topic clustering

Profiles to analyze:
{profile_urls}

Provide 3-5 key patterns with:
- Pattern name
- Clear explanation
- Best example tweet"""
        },
        {
            "name": "Tweet Generation - From Content",
            "category": "tweet_generation",
            "template_text": """Based on the following pattern analysis, create 2-10 tweets from the user's content.

Patterns identified:
{patterns}

User's content:
{content}

For each tweet:
1. Apply a specific pattern
2. Keep it under 280 characters
3. Make it engaging and actionable
4. Explain why the pattern works"""
        },
        {
            "name": "Pattern Extraction - Deep Dive",
            "category": "pattern_extraction",
            "template_text": """Extract detailed patterns from these high-performing tweets:

{tweets}

For each pattern, provide:
1. Pattern name (catchy, memorable)
2. Structure breakdown
3. Psychology behind it
4. When to use it
5. 2-3 examples"""
        }
    ]
    
    for prompt_data in prompts:
        prompt = PromptTemplate(**prompt_data)
        db.add(prompt)
    
    db.commit()
    print(f"Seeded {len(prompts)} prompt templates")

if __name__ == "__main__":
    seed_prompts()


