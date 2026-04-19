# Authentication

## Overview

Artnemis uses NextAuth.js v5 (Auth.js) with a Credentials provider for email/password authentication.

## Flow

1. User visits `/auth/sign-up` and creates an account (name, email, password)
2. Password is hashed with bcryptjs (12 rounds) before storage
3. After registration, auto-sign-in via NextAuth credentials flow
4. JWT session strategy — no server-side session store needed
5. Session includes `user.id`, `user.email`, `user.name`

## Storage

- Users and settings stored in `.data/artnemis-users.json` (local JSON fallback)
- Each user has a settings record with `openaiApiKey` and `locale`

## Protected Routes

- Dashboard, modules, quiz, plans, and profile pages read the session to get the authenticated userId
- API routes for profile management require a valid session
- Quiz and plan generation use per-user API key from settings

## Configuration

- `NEXTAUTH_SECRET` environment variable (falls back to dev-only default)
- Auth pages: `/auth/sign-in`, `/auth/sign-up`
