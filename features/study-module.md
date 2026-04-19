# Feature: Study Module

## Goal

Allow users to create and manage study modules.

---

## Data Model

StudyModule:

* id
* name
* description
* visibility (public | private)
* ownerId
* createdAt

---

## Actions

* create module
* update module
* delete module
* get module

---

## Rules

* creator becomes owner
* private modules require membership
* public modules are readable by anyone

---

## Files

* /core/module/module.service.ts
* /core/module/module.types.ts
