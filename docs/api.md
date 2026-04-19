# API Reference

## GET /api/modules

Returns visible modules.

Query params:

* requesterId optional

Response:

```json
{
  "modules": [],
  "storageMode": "local-json"
}
```

## POST /api/modules

Creates a module and owner membership.

Body:

```json
{
  "name": "Linear Algebra Sprint",
  "description": "Matrices, eigenspaces and oral exam prompts.",
  "visibility": "public",
  "ownerId": "demo-owner"
}
```

## GET /api/modules/:moduleId

Returns a module with members.

Query params:

* requesterId optional

## POST /api/modules/:moduleId/invites

Creates a token invite.

Body:

```json
{
  "email": "colleague@example.com",
  "role": "viewer"
}
```

## POST /api/invites/accept

Accepts a token invite and creates membership.

Body:

```json
{
  "token": "invite-token",
  "userId": "viewer-1"
}
```

## POST /api/quizzes

Generates and validates a quiz.

Body:

```json
{
  "topic": "Linear Algebra",
  "difficulty": "medium",
  "previousMistakes": ["eigenvectors", "rank-nullity"]
}
```

Response includes:

* aiMode
* quiz

## POST /api/plans

Generates and validates a study plan.

Body:

```json
{
  "examDate": "2026-06-30",
  "topics": ["Linear Algebra", "Probability"],
  "dailyStudyMinutes": 90
}
```

Response includes:

* aiMode
* plan