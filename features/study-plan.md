# Feature: Study Plan

## Goal

Generate a structured study plan with configurable question templates.

---

## Input

* examDate
* topics
* dailyStudyMinutes
* template (multiple-choice | free-response | mixed)

---

## Output

StudyPlan:

* days[]

  * date
  * tasks

StudyTask:

* kind (study | quiz | review | exercise)
* topic
* durationMinutes
* description

---

## Templates

* **multiple-choice**: plan focuses on quiz-style review with MC questions
* **free-response**: plan emphasises open-ended exercises and written practice
* **mixed**: balanced combination of both approaches

---

## Rules

* early phase → more study
* late phase → more quizzes
* max 3 tasks per day
* generated output must be validated before use
* template defaults to "mixed" if not specified

---

## Files

* /core/plan/plan.types.ts
* /core/plan/generatePlan.ts
