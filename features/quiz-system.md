# Feature: Quiz System

## Goal

Generate and validate quizzes.

---

## Input

* topic
* difficulty
* previousMistakes

---

## Output

Quiz:

* questions[]
* answers
* explanations

Question:

* prompt
* options[4]
* correctAnswer
* explanation

---

## Rules

* 4 options per question
* 1 correct answer
* no duplicates
* invalid AI output must be rejected

---

## Files

* /core/quiz/quiz.types.ts
* /core/quiz/generateQuiz.ts
* /core/quiz/validateQuiz.ts
