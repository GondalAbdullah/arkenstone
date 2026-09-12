# Arkenstone

Arkenstone is an offline-first expense and income tracker for personal use,
built to replace the friction of maintaining a paper expense journal by
hand. It runs entirely on local SQLite storage — no account, no backend, no
internet connection required.

## Download

[Download Android APK](https://github.com/GondalAbdullah/arkenstone/releases/latest)

## Features

- **Offline-first** — all data lives in an on-device SQLite database
  (`expo-sqlite`); no network calls, no account.
- **Expense and income tracking** in one unified Add screen with a type
  toggle, plus a dashboard, category breakdown, and searchable history.
- **Pakistani Rupees** as the currency, entered and stored as whole
  integers — no paisa/cents.
- **Custom in-app numeric keypad** for amount entry, instead of the system
  keyboard.

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
(config in [eas.json](eas.json)):

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
```

## Tech stack

Expo SDK 57 · Expo Router · TypeScript (strict) · expo-sqlite · React Native
Reanimated · lucide-react-native icons.

## License

MIT — see [LICENSE](LICENSE).
