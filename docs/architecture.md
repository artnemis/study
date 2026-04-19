# Architecture Overview

## Frontend

* Next.js App Router
* main dashboard on /app/page.tsx
* client data access through hooks and app/_lib/api-client.ts

## Backend For Frontend

* public route handlers in /app/api
* request parsing and safe error mapping in /app/api/_server/http.ts
* storage selection in /app/api/_server/module-repository.ts

## Core Domain

* /core/module for modules, invites and permissions
* /core/quiz for quiz generation and validation
* /core/plan for plan generation and validation
* /core/ai for pluggable AI providers

## Storage Modes

PostgreSQL mode:

* enabled when DATABASE_URL exists
* schema initialized automatically
* repository implemented through /core/module/postgres-module.repository.ts

Demo mode:

* enabled when DATABASE_URL is missing
* local JSON store under .data/
* useful for local demos and GitHub onboarding

## AI Modes

OpenAI mode:

* enabled when OPENAI_API_KEY exists

Demo mode:

* deterministic fallback provider
* keeps the MVP fully usable without external credentials