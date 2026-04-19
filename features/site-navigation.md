# Feature: Site Navigation

## Goal

Provide a clear, consistent navigation experience across all pages.
Users must always know where they are and how to reach any section.

---

## Structure

| Route           | Label        | Description                        |
|-----------------|--------------|------------------------------------|
| /               | Home         | Public landing page                |
| /coming-soon    | Coming Soon  | Temporary launch / maintenance gate |
| /dashboard      | Dashboard    | Overview with stats and shortcuts  |
| /modules        | Moduli       | Browse, search, create modules     |
| /modules/[id]   | (detail)     | Single module workspace            |
| /quiz           | Quiz         | Generate AI quizzes                |
| /plans          | Piani        | Generate AI study plans            |

---

## Shared Components

### Navbar
- fixed top bar on every page except `/coming-soon`
- logo on the left, nav links centered or right
- highlights active route
- responsive: hamburger menu on mobile

### Footer (optional, landing only)
- minimal footer with project links

---

## Rules

- navbar is hidden on `/coming-soon` to avoid exposing unavailable sections during the launch gate
- active link detection uses `usePathname()`
- no business logic in navigation components; global access gating is handled in middleware

---

## Files

- /app/_components/navbar.tsx
- /app/layout.tsx
- /middleware.ts
