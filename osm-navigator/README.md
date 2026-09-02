# Promto Mobile App

Controlled Expo 57 / React Native / Expo Router / TypeScript starter for Promto Code.

```bash
npm ci
promto-mobile preview start --path .
promto-mobile preview status --path .
npm run check
```

The trusted Promto CLI starts Expo Web through Metro, selects a safe preview
port, waits for HTTP readiness, and owns the exact process lifecycle. Inspect
failures with `promto-mobile preview logs --path .` and stop it with
`promto-mobile preview stop --path .`. Do not launch Expo/npm/nohup manually,
use `pkill`, switch to `--host 0.0.0.0`, or start a second Metro process.

The agent uses the trusted Promto CLI for remote builds. The Android tab in Promto Code is read-only: it shows build history, a QR code for preview APKs, and manual publication details for production AABs:

```bash
promto-mobile apps get --path .
promto-mobile apps repair-marker <mobile-app-id> --path .
promto-mobile build android --profile preview --path .
promto-mobile build android --profile production --path .
promto-mobile build ios --profile preview --path .
promto-mobile build ios --profile device --path .
promto-mobile build ios --profile production --path .
promto-mobile builds list --platform android --path .
promto-mobile builds list --platform ios --path .
promto-mobile build logs --path .
```

Build creation is asynchronous. Agents do not pass `--wait` or poll for
completion after a job is accepted. The user follows the job in the Android
tab and presses **Обновить** there when the current build is not yet visible.
`OpenAndroid: builds` is emitted only by a regular Promto chat; terminal CLIs
describe that navigation in ordinary text because terminal output has no UI
marker support.

This folder is one registered mobile app. Its stable identity is stored in
`.promto/mobile.json`; do not edit, delete, or copy that marker. Reuse this
folder for later versions and builds of the same app. Create a second independent
app with `promto-mobile apps create <new-path> --name <name>` so it receives a
different app ID and native package identifiers.

The same managed commands are available as `npm run build:android`,
`npm run build:production`, `npm run build:ios`, `npm run build:ios:device`,
`npm run build:ios:production`, and `npm run build:status`.

- `preview` produces an installable APK;
- `production` produces a signed AAB for manual upload to Google Play Console.

For iOS, `preview` produces an archive for iOS Simulator, `device` produces an
internal-distribution IPA for an iPhone registered before the build, and
`production` produces an IPA through Expo EAS Build for App Store Connect.
Device and production builds require Apple credentials configured in Promto's
trusted Expo account. No Expo or Apple credential is stored in this project or
exposed to the workspace.

Promto does not connect to Google Play, upload the AAB automatically, or show Play review/publication status. After a finished production build, download the AAB from the Android tab or the URL printed by `promto-mobile`. The project owner downloads the signing-key backup only from the Android tab; generic CLI/API output does not expose its URL. Save the key backup securely and reuse the same signing key for every update of this registered app. Android `versionCode` is fully server-owned: Promto automatically assigns the next monotonically increasing number to every production build, so do not edit `expo.android.versionCode` manually. Upload the new AAB manually in Google Play Console. If Play Console reports an error, copy its exact text and send it to the agent. Production AABs do not have a QR code; QR installation is only for preview APKs.

Markerless legacy path-only builds are supported for `preview` only. A `production` build requires a registered `mobile_app_id` and matching `.promto/mobile.json` marker; otherwise the API returns `mobile_app_registration_required`.

Promto's self-hosted remote builder owns Android builds. A separate trusted worker submits iOS builds to Expo EAS and mirrors finished artifacts to private Promto storage. Do not run `expo run:android`, `expo prebuild`, `gradle`, `eas build`, install `eas-cli`, create `android/` or `ios/`, or add secrets to this directory.
If a build fails, inspect `promto-mobile build logs` and fix the reported source or dependency error before retrying.
