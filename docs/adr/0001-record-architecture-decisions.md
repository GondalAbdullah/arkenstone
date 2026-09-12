# 1. Record architecture decisions

Date: 2026-09-12

## Status

Accepted

## Context

This app is maintained by one person, evolving from a personal paper-journal
workflow into a small offline React Native app. Decisions about data model,
currency handling, and UI conventions were previously only implicit in the
code — a later change (or a later AI coding session) had no record of *why*
something was built a certain way, only what it currently did.

## Decision

We will keep a set of Architecture Decision Records (ADRs) in `docs/adr/`,
one Markdown file per decision, numbered sequentially. Each record captures
the context, the decision, and the consequences/alternatives considered.

## Consequences

Any future change that affects the data model, currency/locale handling, or
a cross-cutting UI convention should add a new ADR rather than only a commit
message. Small, purely local UI tweaks don't need one.
