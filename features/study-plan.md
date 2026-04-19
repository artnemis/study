# Feature: Study Plan

## Goal

Generate a structured study plan.

---

## Input

* examDate
* topics
* dailyStudyMinutes

---

## Output

StudyPlan:

* days[]

  * date
  * tasks

StudyTask:

* kind (study | quiz)
* topic
* durationMinutes
* description

---

## Rules

* early phase → more study
* late phase → more quizzes
* max 3 tasks per day
* generated output must be validated before use

---

## Files

* /core/plan/plan.types.ts
* /core/plan/generatePlan.ts
