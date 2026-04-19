# Task: Per-User API Key

## Status: Done

## Description

Create profile page, allow users to set their own OpenAI API key, remove dependency on global OPENAI_API_KEY.

## Implementation

1. Created `app/profile/page.tsx` — profile page with language selector and API key management
2. Created `app/api/profile/route.ts` — GET and PATCH endpoints for user settings
3. Updated `app/api/_server/ai-provider.ts` — `getAIProvider()` and `getAIMode()` now accept optional `userApiKey`
4. Updated `app/api/quizzes/route.ts` — reads user's API key from settings before generating quiz
5. Updated `app/api/plans/route.ts` — reads user's API key from settings before generating plan
6. API key precedence: user key > global env > demo mode
7. Key never exposed to client — only `hasOpenaiKey: boolean` in profile response
