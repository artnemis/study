# Feature: Invite System

## Goal

Allow users to invite others to a module.

---

## Data Model

ModuleInvite:

* id
* moduleId
* email
* role
* token
* expiresAt
* acceptedAt

---

## Flow

* create invite
* send link
* accept invite
* add member

---

## Rules

* token must be unique
* expiration: 48h
* single-use token
* invited role: editor | viewer

---

## Files

* /core/module/invite.service.ts
