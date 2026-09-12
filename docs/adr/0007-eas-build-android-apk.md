# 7. EAS Build for internal Android APK distribution

Date: 2026-09-12

## Status

Accepted

## Context

The app has no CI/build pipeline yet — testing meant running through Expo Go
or a dev build. For a v0.1.0 GitHub release, the app needs to be installable
as a plain `.apk` a person can sideload, without going through the Play
Store (no store listing exists yet, and this is a personal-project release,
not a public launch).

[EAS Build](https://docs.expo.dev/build/introduction/) is Expo's hosted
build service and the standard way to produce a signed Android build from
an Expo project without a local Android SDK/toolchain.

## Decision

- Installed `eas-cli` **globally**, not as a project `devDependency` —
  `expo-doctor` explicitly flags a locally-installed `eas-cli` as a legacy
  pattern; the recommended path is a global install or `npx eas-cli`.
- Added `eas.json` with three profiles (`development`, `preview`,
  `production`), all building an Android **APK** (`buildType: "apk"`) with
  `distribution: "internal"` — including `production`.

  This is a deliberate deviation from EAS's usual convention, where
  `production` defaults to `distribution: "store"` and an `.aab` app
  bundle (Play Store's required format). Since there's no store submission
  yet, `production` here means "the build to hand to a real user/GitHub
  release," not "submitted to a store." **When Play Store submission is
  wanted, add a distinct profile (e.g. `store`) with
  `distribution: "store"` and `buildType: "app-bundle"` — don't repurpose
  `production`,** since existing internal testers/release links depend on
  it producing an installable APK.
- `cli.appVersionSource: "local"` plus `android.versionCode` in `app.json`
  (starting at `1`) — the version code lives in the repo, not on EAS's
  servers, so it's visible in diffs and tags alongside `app.json`'s
  `version`. `production`'s `autoIncrement: true` bumps it automatically on
  each production build.
- Set `android.package` to `com.abdullahgondal.expensetracker` — required
  by EAS to produce a signed build. Once a release ships, this should be
  treated as permanent: changing it later means a new, unrelated Android
  app identity (fresh install, no update path from the old one).

  > **Update ([ADR 0008](0008-rename-to-arkenstone.md)):** the app was
  > renamed to Arkenstone before any public release, so this was changed
  > anyway, to `com.abdullahgondal.arkenstone` — while it was still cheap.

## Consequences

- `eas build --platform android --profile production` (or
  `npm run build:android`) is the release build; it needs `eas login`
  first (interactive — not something this assistant can do on the user's
  behalf) and will prompt to create/link an EAS project on first run.
- The resulting APK is meant for direct install / GitHub release assets,
  not Play Store — see the note above if that changes.
- No credentials are stored in the repo; EAS manages the Android signing
  keystore remotely once the project is linked.
