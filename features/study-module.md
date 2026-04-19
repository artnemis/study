# Feature: Study Module

## Goal

Allow users to create and manage study modules with structured curriculum and study materials.

---

## Data Model

StudyModule:

* id
* name
* description
* visibility (public | private)
* ownerId
* createdAt
* curriculum: ModuleSection[]
* materials: StudyMaterial[]

ModuleSection:

* id
* title
* order
* lessons: ModuleLesson[]

ModuleLesson:

* id
* title
* type (reading | video | exercise | quiz)
* durationMinutes
* content
* completed

StudyMaterial:

* id
* moduleId
* filename
* mimeType
* sizeBytes
* extractedTopics[]
* estimatedTokens
* uploadedAt

---

## Actions

* create module
* update module
* delete module
* get module
* list modules
* upload study material
* extract topics from material (AI)
* manage curriculum sections and lessons

Get module output:

* module fields
* members[]
* curriculum[]
* materials[]

---

## Rules

* creator becomes owner
* private modules require membership
* materials upload limited to 10 MB (PDF, PPTX, DOCX, TXT)
* topic extraction includes cost estimation
* public modules are readable by anyone
* module reads must include members

---

## Files

* /core/module/module.service.ts
* /core/module/module.types.ts
* /core/module/postgres-module.repository.ts
