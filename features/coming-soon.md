# Feature: Coming Soon Gate

## Goal

Provide a temporary launch / maintenance mode that can disable access to the full app through a server-side environment variable.

---

## Activation

- env flag: `COMING_SOON_ENABLED=true`
- when enabled, every non-API request is redirected to `/coming-soon`
- when disabled, the application behaves normally without code changes

---

## Behavior

- API routes remain reachable
- Next.js assets and public files are excluded from redirects
- `/coming-soon` stays reachable to avoid redirect loops
- the shared navbar is hidden on `/coming-soon`

---

## Files

- /middleware.ts
- /app/coming-soon/page.tsx
- /app/_components/navbar.tsx
- /.env.example