# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.5] - 2026-09-28

### Added
- Tap a transaction to open a read-only details view — full note/category/
  amount/date, with Edit and Delete actions. Previously the only way to see
  a transaction's full note was to enter edit mode directly.

### Changed
- Release APK no longer bundles x86/x86_64 native libraries — only
  `armeabi-v7a` and `arm64-v8a`, the two real Android phones actually use.
  Shrinks the release from ~118 MB to an estimated ~68 MB with no
  compatibility loss on any real device.
  ([ADR 0011](docs/adr/0011-drop-x86-native-libs.md))

### Removed
- Budget tracking from the Categories screen ("over budget" labels, "of Rs
  X" totals). There was never a way to actually set a budget — the numbers
  were hardcoded placeholders. The per-category progress bar now shows
  share of this month's total spending instead, a real figure.

## [0.1.4] - 2026-09-14

### Added
- Edit and delete for existing transactions. Tap a transaction (on the
  dashboard or in History) to edit it; long-press to delete it. Editing
  reuses the Add screen, now with a delete action too.

## [0.1.3] - 2026-09-13

### Fixed
- Duplicate back button on the Add screen — `expo-router`'s native header
  was enabled on the "add" route on top of add.tsx's own custom header, so
  two back arrows (one titled "Add Transaction", one "Add Expense"/"Add
  Income") showed up stacked on top of each other.

## [0.1.2] - 2026-09-13

Version bump only, no functional changes — needed a tag ahead of `v0.1.1`
(already pushed publicly) to release from, without force-pushing over it.
The released APK's internal version string still reads `0.1.1`; its
`versionCode` (3), which is what Android actually uses to identify the
build, is correct and unaffected.

## [0.1.1] - 2026-09-13

### Changed
- New app icon (book + leaf artwork), replacing the wallet icon — adaptive
  icon and splash screen background updated to match its light background.
- App renamed from "expense-tracker" to **Arkenstone**, including the
  Android package id and deep-link scheme.
  ([ADR 0008](docs/adr/0008-rename-to-arkenstone.md))
- Upgraded from Expo SDK 54 to **SDK 57** (React Native 0.86, React 19.2) —
  the SDK-54 pin was blocking Expo Go, which always tracks the newest SDK.
  ([ADR 0009](docs/adr/0009-upgrade-to-expo-sdk-57.md), supersedes
  [ADR 0005](docs/adr/0005-stay-on-expo-sdk-54.md))

### Fixed
- `DateTimePicker`'s deprecated `onChange` prop (pulled up to 9.1.0 by the
  SDK 57 upgrade) replaced with `onValueChange`/`onDismiss`.

## [0.1.0] - 2026-09-12

First tracked release. The app already recorded expenses; this release adds
income tracking, switches to Rupees, and cleans up a handful of bugs found
during a full repo review.

### Added
- Income tracking: the Add screen now has an Expense/Income toggle, with
  its own categories (Salary, Business, Gift, Other).
  ([ADR 0003](docs/adr/0003-unified-add-transaction-screen.md))
- Custom in-app numeric keypad for amount entry (digits + backspace),
  replacing the system keyboard.
  ([ADR 0004](docs/adr/0004-custom-numeric-keypad.md))
- `docs/adr/` — architecture decision records for this and future changes.
- EAS Build configuration (`eas.json`) for producing an installable Android
  APK. ([ADR 0007](docs/adr/0007-eas-build-android-apk.md))
- App icon, adaptive icon, and splash screen, replacing the default Expo
  scaffold branding.

### Changed
- Currency switched from USD (`$`, decimal cents) to Pakistani Rupees
  (`Rs.`, whole integers only — no paisa).
  ([ADR 0002](docs/adr/0002-currency-pkr-integer-amounts.md))
- Category definitions centralized in `src/constants/categories.ts`,
  shared by every screen instead of four separate, drifting copies.

### Fixed
- Manually-picked transaction dates were saved as UTC while auto-generated
  timestamps were local time, which could bucket a backdated entry into
  the wrong day/month for anyone outside UTC (relevant at UTC+5).
- History's "SUBSCRIPTIONS" filter matched a category that was never
  actually assignable to any transaction.
- History/Categories/Settings all showed the header "Balance", copy-pasted
  from the dashboard, instead of a title relevant to that screen.
- `react-native-svg` was used by the Categories screen but not declared in
  `package.json`, relying on it being installed transitively by chance.
