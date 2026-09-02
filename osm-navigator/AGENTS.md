# Promto Mobile Project

This project uses Expo, React Native, Expo Router and TypeScript.

- Do not install Android SDK, NDK, Gradle, Android Studio or an emulator in this workspace.
- Do not run native Android builds inside the sandbox.
- Do not run `expo run:android`, `expo prebuild`, `gradle`, `gradlew`, `eas build`, or install `eas-cli` in the sandbox. Never create or keep `android/` or `ios/` directories in this managed project.
- Do not replace Expo/React Native with Flutter or another mobile framework.
- Keep `app.json` static. Do not add `app.config.js`, `app.config.ts` or custom Expo config plugins.
- `.promto/mobile.json` is the server-owned identity of this registered app. Never edit, delete, regenerate or copy it to another project.
- Keep the generated Android package and iOS bundle identifier unchanged. Subsequent builds and versions of this product must reuse this folder and mobile app ID.
- A second independent app must be created in a new folder with `promto-mobile apps create <new-path> --name <name>`; never overwrite this app to create another one.
- Keep the `preview`, `device` and `production` profiles in `eas.json`.
- Add screens and navigation through files in the `app/` directory.
- Use `promto-mobile preview start --path .` for Expo Web through Metro and `npm run check` for TypeScript validation. Inspect it with `promto-mobile preview status|logs --path .` and stop it with `promto-mobile preview stop --path .`. Never launch Expo/npm/nohup manually, pass host flags, kill processes yourself, or start a second Metro process.
- Keep `package.json` and `package-lock.json` synchronized. Use `npm ci` for a clean install before a remote build.
- Start APK/AAB builds with `promto-mobile build android --profile <preview|production> --path .`. Start iOS builds with `promto-mobile build ios --profile <preview|device|production> --path .`: `preview` targets Simulator, `device` targets a previously registered iPhone, and `production` targets App Store Connect. The CLI resolves `.` to this folder and reads its mobile app ID from `.promto/mobile.json`. Do not pass `--wait` or poll after the job is created. Use `OpenAndroid: builds` only for Android jobs in a regular Promto chat where UI markers are supported.
- Inspect this app with `promto-mobile apps get --path .` and its builds with `promto-mobile builds list --platform <android|ios> --path .`.
- If `.promto/mobile.json` is missing or damaged, restore only that server-owned file with `promto-mobile apps repair-marker <mobile-app-id> --path .`; never invent or copy an app ID, and never use repair to overwrite `app.json`.
- Never run `eas build` directly or request cloud/build credentials inside the sandbox. Promto uses its self-hosted builder for Android and a trusted Expo EAS worker for iOS.
- After a terminal failure, inspect `promto-mobile build logs` and do not retry an unchanged project.
