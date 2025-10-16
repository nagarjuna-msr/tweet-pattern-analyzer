# MVP Technical Specification

This document outlines the technical requirements, architecture, and known challenges for the Twitter Pattern Analysis Service MVP.

## 1. High-Level Architecture
The MVP will follow a **"Wizard of Oz"** model. The frontend will be a fully functional web application, but the core analysis and content generation logic will be performed manually by the founder on the backend.

-   **Frontend:** A modern web framework (e.g., React, Vue, Svelte) to deliver a responsive and interactive user experience.
-   **Backend:** A simple backend service (e.g., Python/Flask, Node.js/Express) responsible for user authentication, data storage, and providing an admin interface.
-   **Database:** A relational database (e.g., PostgreSQL, Supabase, Firebase Firestore) to store user data, submissions, and results.

## 2. Frontend Requirements
The frontend application must include the following views/pages, as detailed in the `USER_FLOW_AND_UX.md`:

-   **`AuthenticationPages`**: Login, Sign Up, Forgot Password.
-   **`ProfileSubmissionPage`**: The initial view where users submit URLs for analysis.
-   **`StatusDashboard`**: The view shown to users after they've submitted profiles, displaying the analysis status and expected turnaround time.
-   **`AnalysisResultsView`**: The dashboard that presents the "Key Pattern" cards and provides a link to the full documents.
-   **`ContentSubmissionPage`**: The view with the text area for users to input their content ideas.
-   **`GeneratedTweetsView`**: The final view displaying the crafted tweets, the "Why it Works" notes, and the structured feedback buttons.

## 3. Backend Requirements
-   **User Authentication:** Secure user registration and login (e.g., using JWTs).
-   **Database Schemas:**
    -   `Users`: (id, email, password_hash, created_at)
    -   `Submissions`: (id, user_id, status, submitted_at, profile_urls)
    -   `AnalysisResults`: (id, submission_id, key_patterns_json, document_urls)
    -   `ContentIdeas`: (id, user_id, raw_content, created_at)
    -   `GeneratedTweets`: (id, idea_id, tweet_text, pattern_used, status, feedback_notes)
-   **Admin Interface:** A simple, secure internal page where the founder can:
    -   View new submissions.
    -   Upload analysis results (both the JSON for the key pattern cards and the URLs for the full docs) for a specific submission.
    -   View new content ideas.
    -   Add/edit/delete generated tweets for a user.
-   **Notification System:**
    -   An API endpoint that can receive a webhook from a service like Telegram or Slack.
    -   This will be used to notify the founder of new user submissions and feedback.

## 4. Key Challenges & Risks
These are the known constraints and potential failure points for the MVP.

1.  **The Manual Bottleneck:** The entire system's throughput is limited by the founder's availability. This is acceptable for an MVP but is the primary blocker to scale. The `StatusDashboard` is critical for managing user expectations around this.
2.  **Data Acquisition Dependency:** The ability to perform analysis is entirely dependent on the successful scraping of tweets. A change in Twitter's API or anti-scraping measures could disrupt the service. This is an accepted risk for the MVP phase.
3.  **Managing User Input Quality:** The "garbage in, garbage out" problem. If users submit irrelevant profiles or vague content ideas, the quality of the output will suffer. The UX recommendations (e.g., helper text) are designed to mitigate this, but it remains a risk.
4.  **Subjectivity of Content:** "Good content" can be subjective. The structured feedback loop and the "Why it Works" justifications are designed to anchor the conversation in data-driven logic, but user taste will always be a factor.

## 5. Out of Scope for MVP
To maintain focus, the following features will **NOT** be built for the initial MVP:
-   Automated integration with any AI service (Claude, GPT, etc.).
-   Real-time, automated tweet scraping.
-   Complex user analytics or A/B testing frameworks.
-   Team or multi-user accounts.
-   Directly posting to a user's Twitter account.

