# Task: Add Coming Soon Mode

## Status: Done

## Description

Add a global coming soon page that can be enabled through an environment variable without changing application routes.

## Implementation

1. Added `COMING_SOON_ENABLED` to `.env.example`
2. Created `/coming-soon` page with dedicated launch-gate UI
3. Added `middleware.ts` to redirect every non-API request to `/coming-soon` when the flag is enabled
4. Excluded `/api`, `/_next`, public files, and `/coming-soon` itself from redirects
5. Updated the navbar to stay hidden on `/coming-soon`
6. Updated context and navigation documentation to reflect the new route and gate behavior