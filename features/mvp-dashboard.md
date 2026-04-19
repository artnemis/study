# Feature: MVP Dashboard

## Goal

Provide a single working page for the public MVP.

---

## User Flows

* browse visible modules
* create module
* inspect members and visibility
* create invite token
* accept invite token
* generate quiz
* generate study plan

---

## Rules

* no business logic in components
* data fetching goes through hooks or API client helpers
* interface must work on desktop and mobile

---

## Files

* /app/page.tsx
* /app/_components/mvp-shell.tsx
* /app/_lib/api-client.ts
* /hooks/useModule.ts
* /hooks/useModuleCatalog.ts