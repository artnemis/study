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
* list modules

Get module output:

* module fields
* members[]

---

## Rules

* creator becomes owner
* private modules require membership
* public modules are readable by anyone
* module reads must include members

---

## Files

* /core/module/module.service.ts
* /core/module/module.types.ts
* /core/module/postgres-module.repository.ts
