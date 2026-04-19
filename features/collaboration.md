# Feature: Module Collaboration

## Goal

Enable multiple users to collaborate on modules.

---

## Roles

* owner
* editor
* viewer

---

## Permissions

Owner:

* full access

Editor:

* edit content
* update config

Viewer:

* read-only

---

## Data Model

ModuleMember:

* moduleId
* userId
* role

---

## Rules

* owner cannot be removed
* editors cannot change roles

---

## Files

* /core/module/permissions.ts
