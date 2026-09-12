# Arkenstone

A small offline-first expense & income tracker for personal use, built with
[Expo](https://expo.dev) and React Native. It replaces a paper journal:
every entry — expense or income — is saved locally in a SQLite database on
the device, with a dashboard, category breakdown, and searchable history.

- **Offline-first** — no backend, no account, no network calls. All data
  lives in an on-device SQLite database (`expo-sqlite`).
- **Currency** — Pakistani Rupees, entered and stored as whole integers (no
  paisa/cents). See [docs/adr/0002](docs/adr/0002-currency-pkr-integer-amounts.md).
- **Expense and income** in one unified Add screen with a type toggle. See
  [docs/adr/0003](docs/adr/0003-unified-add-transaction-screen.md).
- **Custom in-app keypad** for amount entry instead of the system keyboard.
  See [docs/adr/0004](docs/adr/0004-custom-numeric-keypad.md).

Significant design decisions are recorded as ADRs in [docs/adr/](docs/adr/README.md).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

   From there you can open the app in a
   [development build](https://docs.expo.dev/develop/development-builds/introduction/),
   an Android emulator, an iOS simulator, or [Expo Go](https://expo.dev/go).

## Building an APK

Release builds go through [EAS Build](https://docs.expo.dev/build/introduction/)
(config in [eas.json](eas.json), see [ADR 0007](docs/adr/0007-eas-build-android-apk.md)):

```bash
npm install -g eas-cli   # once, if you don't already have it
eas login                # once, needs an Expo account
eas build --platform android --profile production   # or: npm run build:android
```

This produces a signed, directly-installable `.apk` — not a Play Store
bundle. The command prompts to link an EAS project the first time you run
it in this repo.

## Project structure

```
src/
  app/            # expo-router screens ((tabs)/ = bottom tab screens, add.tsx = modal)
  components/     # shared UI: numeric keypad, screen header
  constants/      # category definitions (icons, colors, budgets) shared across screens
  db/             # SQLite provider, schema, and TypeScript row types
  utils/          # currency formatting, local-time date helpers
docs/adr/         # architecture decision records
```

## Tech stack

Expo SDK 57 · Expo Router · TypeScript (strict) · expo-sqlite · React Native
Reanimated · lucide-react-native icons.

## License

MIT — see [LICENSE](LICENSE).
