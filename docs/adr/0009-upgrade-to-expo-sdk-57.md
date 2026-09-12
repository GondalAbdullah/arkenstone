# 9. Upgrade to Expo SDK 57

Date: 2026-09-13

## Status

Accepted — supersedes [0005](0005-stay-on-expo-sdk-54.md)

## Context

[ADR 0005](0005-stay-on-expo-sdk-54.md) deliberately kept the app on SDK 54
to avoid dependency churn mid-feature-work. That trade-off stopped being
free: Expo Go on the user's phone auto-updates and always tracks the newest
SDK, so once it moved to SDK 57 it refused to open an SDK-54 project at all
(`Project is incompatible with this version of Expo Go`). Staying on 54 now
actively blocks live dev testing, not just deferred maintenance — and
v0.1.0 was already tagged, so this isn't mid-feature-work anymore either.

## Decision

Upgraded to SDK 57:

```bash
npx expo install expo@57.0.18
npx expo install --fix
```

`--fix` failed once on an npm `ERESOLVE` conflict: `@react-native-community/
datetimepicker@9.1.0` carries an *optional* peer dependency on
`react-native-windows`, which itself demands an older `react-native` than
0.86.3. We don't target Windows, so `npm install --legacy-peer-deps`
resolved it — this is a known npm peer-resolution false positive for
packages with platform-specific optional peers we don't use, not a real
incompatibility.

`@types/react` and `typescript` needed a manual bump too (`--fix` only
touches runtime `dependencies`, not `devDependencies`).

Notable version jumps: React Native 0.81.5 → 0.86.3, React 19.1 → 19.2.3,
TypeScript 5.9 → 6.0, `@expo/ui` `0.2.0-beta.9` → `57.0.18` (it switched to
tracking the Expo SDK number directly rather than its own semver).

## Verification

No manual code changes were needed — `expo-doctor` (21/21), `tsc --noEmit`,
and `expo export --platform android` (bundles cleanly, 3196 modules) all
pass unchanged. A fresh EAS build is still needed before the next release,
since SDK/RN version is baked into the native binary.

## Consequences

- `AGENTS.md`'s SDK 57 instruction is now actually followed, closing out
  the exception ADR 0005 recorded.
- Minimum requirements move up with SDK 57: iOS 16.4+, Xcode 26.4+, Node
  22.13.x+ (already satisfied here — Node 24.16.0).
- Expo Go will keep moving forward; this project should be re-upgraded
  again once it next falls far enough behind to matter, rather than waiting
  for it to block testing again.
