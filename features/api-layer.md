# Feature: API Layer

## Goal

Expose the Artnemis MVP through App Router route handlers.

---

## Endpoints

* GET /api/modules
* POST /api/modules
* GET /api/modules/:moduleId
* POST /api/modules/:moduleId/invites
* POST /api/invites/accept
* POST /api/quizzes
* POST /api/plans

---

## Rules

* route handlers are public endpoints
* validation errors must return safe client messages
* infrastructure failures must not expose internals
* node runtime required for database-backed routes

---

## Files

* /app/api/modules/route.ts
* /app/api/modules/[moduleId]/route.ts
* /app/api/modules/[moduleId]/invites/route.ts
* /app/api/invites/accept/route.ts
* /app/api/quizzes/route.ts
* /app/api/plans/route.ts