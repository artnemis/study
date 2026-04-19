# Profile & Per-User API Key

## Overview

Each authenticated user has a profile page at `/profile` where they can:
- View their account info (name, email)
- Change the interface language
- Set or remove their personal OpenAI API key

## Per-User API Key

- The user's OpenAI API key is stored in the user settings (local JSON or PostgreSQL)
- When generating quizzes or study plans, the API routes check the user's API key first
- If the user has a key → OpenAI mode
- If no user key → falls back to global `OPENAI_API_KEY` env var
- If neither → Demo mode (deterministic responses)

## API

- `GET /api/profile` — returns user info and settings (requires auth)
- `PATCH /api/profile` — updates locale and/or API key (requires auth)

## Security

- API keys are stored server-side only
- The `GET /api/profile` response only indicates `hasOpenaiKey: boolean`, never returns the actual key
- Keys are never sent to the client
