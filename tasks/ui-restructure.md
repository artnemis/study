# Task: Restructure UI into Multi-Page Layout

## Requirements

1. Replace monolithic MvpShell with separate pages
2. Create shared Navbar component with active-link highlighting
3. Build clean landing page at `/`
4. Build dashboard overview at `/dashboard`
5. Build modules browser at `/modules`
6. Build module detail at `/modules/[moduleId]`
7. Build standalone quiz page at `/quiz`
8. Build standalone plans page at `/plans`
9. Create shared UI primitives (Panel, Badge, Field, EmptyState)

## Acceptance Criteria

- [ ] Landing page loads with hero, features, CTA – no forms
- [ ] Navbar visible on all pages with working links
- [ ] Dashboard shows module count and quick actions
- [ ] Modules page allows search, create, and navigate to detail
- [ ] Module detail shows info, members, invite, quiz/plan launch
- [ ] Quiz page generates quizzes standalone
- [ ] Plans page generates plans standalone
- [ ] All existing API routes still work
- [ ] npm run build succeeds
- [ ] npm run lint succeeds

## Files

- app/page.tsx
- app/layout.tsx
- app/dashboard/page.tsx
- app/modules/page.tsx
- app/modules/[moduleId]/page.tsx
- app/quiz/page.tsx
- app/plans/page.tsx
- app/_components/navbar.tsx
- app/_components/ui.tsx
