# Feature: Quiz System

## Goal

Generate and validate quizzes with configurable question templates.

---

## Input

* topic
* difficulty
* previousMistakes
* template (multiple-choice | free-response | mixed)

---

## Output

Quiz:

* template
* questions[]
* answers
* explanations

Question:

* type (multiple-choice | free-response)
* prompt
* options[4] (multiple-choice) or options[] (free-response)
* correctAnswer
* explanation

---

## Templates

* **multiple-choice**: 4 options per question, 1 correct answer
* **free-response**: open-ended answer, no options
* **mixed**: combination of both types

---

## Rules

* multiple-choice: 4 options per question
* 1 correct answer
* no duplicates
* invalid AI output must be rejected
* template defaults to "multiple-choice" if not specified

---

## Files

* /core/quiz/quiz.types.ts
* /core/quiz/generateQuiz.ts
* /core/quiz/validateQuiz.ts
