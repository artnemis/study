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

---

## Rules

* early phase → more study
* late phase → more quizzes
* max 3 tasks per day

---

## Files

* /core/plan/generatePlan.ts
