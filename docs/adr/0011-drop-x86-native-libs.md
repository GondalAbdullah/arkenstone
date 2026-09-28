# 11. Drop x86/x86_64 native libraries from the release APK

Date: 2026-09-28

## Status

Accepted

## Context

The universal `.apk` produced per [ADR 0007](0007-eas-build-android-apk.md)
bundles native code (`lib/*.so`) for all four Android ABIs: `armeabi-v7a`,
`arm64-v8a`, `x86`, `x86_64`. Inspecting the v0.1.4 release APK, `lib/`
accounted for 90.3 MB of its 112 MB compressed size — split roughly evenly
across the four architectures — while any single device only ever uses one.

`x86`/`x86_64` specifically exist for Android emulators and a small number
of long-discontinued Intel tablets; no real phone in normal use runs on
them. Dropping just those two, while keeping both ARM variants, removes
~50 MB with no compatibility cost for any real device.

## Decision

Added `expo-build-properties` and set `android.buildArchs` to restrict the
build to ARM only:

```json
["expo-build-properties", { "android": { "buildArchs": ["armeabi-v7a", "arm64-v8a"] } }]
```

Kept **both** ARM variants (not arm64-only) — `armeabi-v7a` covers older
32-bit devices at effectively no size cost of its own (it's the smallest of
the four, 16.4 MB), so there's no reason to narrow further and risk
excluding real (if old) hardware for a marginal size win.

## Consequences

- Release APK shrinks from ~118 MB to an estimated ~68 MB, with no change
  in which real devices can install it.
- If iOS or an x86-based target (an emulator build, say) is ever needed
  again, this plugin config would need a profile-specific override — the
  restriction as written applies to every build, including `development`
  and `preview`.
