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

---

## Rules

* 4 options per question
* 1 correct answer
* no duplicates

---

## Files

* /core/quiz/generateQuiz.ts
* /core/quiz/validateQuiz.ts
