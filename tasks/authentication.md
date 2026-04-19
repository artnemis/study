# Task: Authentication Setup

## Status: Done

## Description

Implement real authentication replacing simulated `"demo-owner"` userId.

## Implementation

1. Installed `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`
2. Created `auth.ts` — NextAuth config with Credentials provider
3. Created `core/auth/auth.types.ts` — AppUser, UserSettings, UserRepository interfaces
4. Created `app/api/_server/user-repository.ts` — local JSON user storage
5. Created `app/api/auth/[...nextauth]/route.ts` — NextAuth API handler
6. Created `app/api/auth/sign-up/route.ts` — registration endpoint
7. Created `app/auth/sign-in/page.tsx` and `app/auth/sign-up/page.tsx` — UI pages
8. Created `app/_components/auth-provider.tsx` — SessionProvider wrapper
9. Updated `app/layout.tsx` — wrapped app with AuthProvider
10. Updated all pages — replaced `"demo-owner"` with `session.user.id`
11. Updated navbar — sign-in/sign-out buttons based on session state
