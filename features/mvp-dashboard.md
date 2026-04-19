# Feature: MVP Multi-Page UI

## Goal

Provide a clean, navigable multi-page interface for the public MVP.
Each concern gets its own page. The home page is a public landing.

---

## Pages

### Landing (`/`)
- hero section with tagline and CTA
- feature highlights (modules, quiz, plans, collaboration)
- clean, inviting design – no forms, no clutter

### Dashboard (`/dashboard`)
- overview of user's modules (recent / count)
- quick-action cards linking to /modules, /quiz, /plans
- storage mode and AI mode badges

### Modules (`/modules`)
- searchable list of visible modules
- create-module form (inline or modal)
- each module card links to detail page

### Module Detail (`/modules/[id]`)
- module info, members list
- invite creation and accept forms
- launch quiz/plan generation scoped to this module

### Quiz (`/quiz`)
- standalone quiz generator form
- displays generated quiz with questions

### Study Plans (`/plans`)
- standalone plan generator form
- displays generated study plan calendar

---

## Rules

* no business logic in components
* data fetching goes through hooks or API client helpers
* interface must work on desktop and mobile
* pages share a common navbar via root layout

---

## Files

* /app/page.tsx (landing)
* /app/dashboard/page.tsx
* /app/modules/page.tsx
* /app/modules/[moduleId]/page.tsx
* /app/quiz/page.tsx
* /app/plans/page.tsx
* /app/_components/navbar.tsx
* /app/_components/ui.tsx (shared UI primitives)
* /app/_lib/api-client.ts
* /hooks/useModule.ts
* /hooks/useModuleCatalog.ts