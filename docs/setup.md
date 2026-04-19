# Setup Guide

## Requirements

* Node.js 20+
* npm 10+

Optional for production-like storage:

* PostgreSQL 15+

---

## Local MVP Mode

1. Install dependencies with npm install.
2. Copy .env.example to .env.local.
3. Leave DATABASE_URL empty to use the local JSON fallback.
4. Run npm run dev.

The local fallback writes data to .data/artnemis-mvp.json.

---

## PostgreSQL Mode

1. Provision a PostgreSQL database.
2. Set DATABASE_URL in .env.local.
3. Run npm run dev.

The schema is initialized automatically on first request.

---

## AI Modes

Demo mode:

* no OPENAI_API_KEY required
* deterministic quiz and plan output for MVP demos

OpenAI mode:

* set OPENAI_API_KEY
* route handlers instantiate OpenAIProvider automatically

---

## Quality Gates

Run both before pushing:

```bash
npm test
npm run lint
```