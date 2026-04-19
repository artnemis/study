# Contributing

## Scope

Artnemis is a public MIT-licensed GitHub project. Contributions should preserve the current architecture:

* business logic in /core
* hooks in /hooks
* route handlers in /app/api
* source of truth in /docs, /features and /tasks

## Workflow

1. Read docs/ai-context.md.
2. Update or add the relevant feature and task files.
3. Add tests for core logic.
4. Run npm test and npm run lint.

## Pull Requests

Keep PRs focused. Include:

* problem statement
* approach summary
* test evidence

## Coding Rules

* strict TypeScript
* no any
* validate external input
* no business logic in React components
* do not call real AI in tests