# 8. Rename the app to Arkenstone

Date: 2026-09-13

## Status

Accepted

## Context

The app was named "expense-tracker" everywhere — a description, not a name.
The user chose "Arkenstone" as the app's actual name. Two layers were
affected:

- **Display-only**: `app.json`'s `name`, the README, the in-app header text.
- **Technical identifiers baked into the build**: `app.json`'s `slug` (which
  the EAS project — [ADR 0007](0007-eas-build-android-apk.md) — is keyed
  by), the deep-link `scheme`, and the Android `package` id
  (`com.abdullahgondal.expensetracker`).

Nothing had been publicly released yet — only an internal EAS test build
existed, never distributed — so this was the cheap moment to rename the
technical identifiers too, before an Android package id became effectively
permanent (changing it post-release means a new, unrelated app with no
upgrade path from the old one, as ADR 0007 already warned).

## Decision

Full rename, not just display text:

| | Before | After |
|---|---|---|
| `name` | `expense-tracker` | `Arkenstone` |
| `slug` | `expense-tracker` | `arkenstone` |
| `scheme` | `expensetracker` | `arkenstone` |
| `android.package` | `com.abdullahgondal.expensetracker` | `com.abdullahgondal.arkenstone` |
| `package.json` name | `expense-tracker` | `arkenstone` |

Consequences of the technical rename:
- `android.versionCode` reset to `1` — the new package id is a distinct
  Android app identity with no history to continue numbering from.
- The old EAS project (`@datasaaz/expense-tracker`,
  `68fc2990-f0d1-485a-a4b2-09244c3a4c44`) is abandoned; `extra.eas.projectId`
  was removed from `app.json` and re-created via `eas init` under the new
  slug. The one APK already built under the old package id
  (`com.abdullahgondal.expensetracker`) still works but is superseded — it
  was never distributed beyond this session, so nothing depends on it.
- `v0.1.0`'s tag was moved to include the rename rather than cutting a new
  version for it, since the tag hadn't been pushed anywhere yet.

## Consequences

A fresh production build is needed under the new package id before this can
be released — the previously-built APK is for a now-defunct app identity.
