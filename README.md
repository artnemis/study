# Artnemis

Artnemis is an open-source AI-powered exam preparation platform built with Next.js App Router and TypeScript.

The current repository ships a working MVP with:

* collaborative study modules
* invite-based access with owner, editor and viewer roles
* AI-generated quizzes
* AI-generated study plans
* App Router API endpoints
* PostgreSQL runtime support with a local JSON fallback for demo mode

## License

This repository is released under the MIT license. See [LICENSE](LICENSE).

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open http://localhost:3000

If DATABASE_URL is missing, the MVP runs in local JSON demo mode and stores data in .data/artnemis-mvp.json.

## Environment

* DATABASE_URL: PostgreSQL connection string for persistent runtime storage
* OPENAI_API_KEY: optional, enables OpenAI-backed quiz and plan generation

Without OPENAI_API_KEY, the app falls back to a deterministic demo AI provider so the MVP remains usable.

## Scripts

* npm run dev
* npm run build
* npm run start
* npm run lint
* npm test

## API Surface

* GET /api/modules
* POST /api/modules
* GET /api/modules/:moduleId
* POST /api/modules/:moduleId/invites
* POST /api/invites/accept
* POST /api/quizzes
* POST /api/plans

Detailed request and response examples live in [docs/api.md](docs/api.md).

## Architecture

* [docs/architecture.md](docs/architecture.md)
* [docs/setup.md](docs/setup.md)
* [docs/api.md](docs/api.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository conventions and contribution workflow.
