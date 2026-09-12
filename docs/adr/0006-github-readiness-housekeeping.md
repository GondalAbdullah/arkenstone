# 6. GitHub-readiness housekeeping

Date: 2026-09-12

## Status

Accepted

## Context

The repo was still carrying its `create-expo-app` scaffold identity: the
`LICENSE` file's copyright was Expo's own ("650 Industries, Inc."), and
`README.md` was the generic Expo template text with no mention of what this
app actually does. Neither is a functional bug, but both would be
misleading — or just unhelpful — to anyone (including the author, later)
landing on the repo on GitHub.

A secrets/credentials scan of tracked source and config files found nothing
to redact, and `.gitignore` already excludes `node_modules/`, `.expo/`,
native build output, and env files, plus a stray `example/` scaffold folder
left over from a prior `reset-project` run.

## Decision

- Update `LICENSE`'s copyright line to the actual author.
- Rewrite `README.md` to describe this app, its offline/local-data model,
  its currency choice, link to the ADR log, and give real setup steps.
- Leave `.gitignore` as-is — it already covers the right things.
- Leave the actual `git push`/remote creation to the user — preparing the
  repo's content is this change's scope; publishing it is a separate,
  explicit action.

## Consequences

Nothing runtime-visible changes. This is purely so the repo reads correctly
to a human (or another AI session) encountering it for the first time on
GitHub.
