# 5. Stay on Expo SDK 54 despite AGENTS.md's SDK 57 guidance

Date: 2026-09-12

## Status

Superseded by [0009](0009-upgrade-to-expo-sdk-57.md)

## Context

`AGENTS.md` at the repo root says Expo has moved on and to read the SDK 57
docs before writing code. During this review, `package.json` in the working
tree was found pinned to SDK 54 (`expo ^54.0.0`, React Native 0.81, React
19.1), while the version already staged in git — the original
`create-expo-app` scaffold — was on SDK 57 (React Native 0.86, React 19.2).
App code and `app.json` in the working tree were already written/configured
against the SDK-54 package set (e.g. `expo-sqlite`, the DateTimePicker
plugin) and were confirmed to be what the app currently runs against.

`expo@57.0.18` was confirmed to still exist and install from the npm
registry, and the installed Node version (24.16.0) satisfies SDK 57's
minimum. So the downgrade to 54 was not a case of SDK 57 being unavailable —
it was a prior, undocumented change away from what `AGENTS.md` specifies.

This was surfaced explicitly and the user chose to **stay on SDK 54** rather
than restore SDK 57, to avoid dependency churn (a jump to React Native 0.86
and its higher iOS/Xcode minimums) while mid-way through unrelated feature
work, on an app that already runs on 54 today.

## Decision

Keep `package.json` / `app.json` on the Expo SDK 54 dependency set. Do not
restore SDK 57 as part of this round of changes.

## Consequences

- This is a **deliberate, recorded exception** to `AGENTS.md`'s instruction —
  not an oversight. A future contributor (human or AI) re-reading
  `AGENTS.md` should check this ADR before "fixing" the version again.
- The app remains on React Native 0.81 / React 19.1 for now, with iOS 15.1+
  / Xcode 16.1+ minimums instead of SDK 57's 16.4+ / 26.4+.
- Revisit this decision once the current feature work (income tracking,
  PKR currency, custom keypad) has landed and been used for a while — SDK 57
  is a real, installable target whenever the upgrade is scheduled
  deliberately rather than done incidentally.
