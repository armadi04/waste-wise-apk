# WasteWise Mobile

Android app for reporting waste, AI classification, GPS capture, and report tracking. Built with Expo + React Native + TypeScript, integrated with the existing WasteWise NestJS API and ML service.

## Stack

- Bun 1.3.14 package manager and runtime
- Expo SDK 58 / React Native 0.88 / TypeScript strict
- Expo Router
- TanStack Query v5
- React Hook Form + Zod
- Expo ImagePicker, Location, ImageManipulator, SecureStore
- `@react-native-google-signin/google-signin`
- Plus Jakarta Sans
- Lottie animations
- EAS Build (Android APK)

## Bun

This project uses Bun `1.3.14` for the package manager and runtime.

- Only `bun.lock` is committed; do not add `package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`.
- Project scripts run through Bun with `bun --bun` where supported.
- Node LTS is still required for `bun run prebuild` and `bun run android` because Expo/Gradle native tooling invokes Node.
- EAS builds use Bun automatically when `bun.lock` is present.

## Brand assets

Brand artwork comes from `waste-wise-web/frontend`:

- App icon, adaptive icon, monochrome icon, and splash are generated from
  `public/favicon_io/android-chrome-512x512.png`.
- In-app logo is generated from the same source.
- The auth hero uses a theme-aware SVG gradient and the recycled logo mark in
  `src/components/auth/auth-hero.tsx`.
- Empty and not-found animations are `src/assets/lottie/empty.json` and
  `src/assets/lottie/404.json`.

## Backend prerequisites

The mobile app uses the existing NestJS API under `/api/v1` plus two small backend patches that are already included in `waste-wise-web`:

- Google auto-registration for unknown Google accounts with the default `user` role.
- Native mobile session endpoints:
  - `POST /api/v1/auth/mobile/google`
  - `POST /api/v1/auth/mobile/2fa/verify`
  - `POST /api/v1/auth/mobile/refresh`
  - `POST /api/v1/auth/mobile/logout`

Backend environment required for Google login:

```env
GOOGLE_CLIENT_ID=<web client id from Google Cloud>
ML_SERVICE_URL=http://localhost:8000
APP_URL=http://localhost:3001
```

`APP_URL` is used by the web client for media links. The mobile app builds media URLs from `EXPO_PUBLIC_API_URL` and does not depend on `APP_URL`.

## Google Cloud setup

1. Create an OAuth **Web application** client. Its client ID is the ID token audience and must equal backend `GOOGLE_CLIENT_ID`.
2. Create an OAuth **Android** client:
   - Package name: `com.bilcode.wastewise`
   - Add SHA-1 for the debug keystore.
   - Add SHA-1 for the EAS keystore used by the preview/production build.
3. Put the Web client ID into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
4. Run a development build or EAS build. Google Sign-In does not work in Expo Go.

Get the EAS SHA-1 with:

```bash
bunx --bun -p eas-cli eas credentials
```

## Environment

Copy `.env.example` to `.env`.

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api/v1
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Recommended URLs:

| Target | API URL |
|---|---|
| Android emulator | `http://10.0.2.2:3000/api/v1` |
| Emulator/USB with `adb reverse tcp:3000 tcp:3000` | `http://localhost:3000/api/v1` |
| Physical device on Wi-Fi | `http://<LAN-IP>:3000/api/v1` |
| Production | `https://your-api-domain.com/api/v1` |

Cleartext HTTP is enabled for development/preview builds only. Production builds must use HTTPS.
`preview` and `production` builds fail early when `EXPO_PUBLIC_API_URL` or
`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is missing.

## Run

```bash
bun install
bun run start
```

For native Google Sign-In and device permissions:

```bash
bun run android
```

or build a development client with EAS.

Native prebuild requires Node LTS and is the only Node exception:

```bash
bun run prebuild --platform android --clean
```

## Build APK

The `preview` profile produces an installable APK; `production` produces an AAB. Each
profile reads the EAS environment variables of the same name (`environment` in `eas.json`).

1. Log in and create the project once (the slug in `app.config.ts` is `waste-wise-mobile`;
   it must match the slug of the project on expo.dev):

   ```bash
   bunx --bun -p eas-cli eas login
   bunx --bun -p eas-cli eas whoami
   bunx --bun -p eas-cli eas init
   ```

   `eas init` cannot write to `app.config.ts`. Copy the project ID it prints (also under
   **Details** on expo.dev) and export it as `EAS_PROJECT_ID` locally, and add it as an EAS
   environment variable too. If the project lives under a team account, add
   `owner: '<team-slug>'` to `app.config.ts`.

2. `.env` is gitignored and is not uploaded to EAS. In expo.dev, **Environment variables**,
   create these for the `preview` (and `production`) environment:

   | Variable | Value |
   |---|---|
   | `EXPO_PUBLIC_API_URL` | Public backend URL ending in `/api/v1` (not `localhost`; must be `https://`, enforced at build time) |
   | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Same value as backend `GOOGLE_CLIENT_ID` |
   | `EAS_PROJECT_ID` | Project ID from step 1 |

   `EXPO_PUBLIC_*` values are embedded in the app, so plain text visibility is fine. The
   build fails early if the first two are missing.

3. Build, then read the SHA-1 of the keystore EAS generated:

   ```bash
   bun run build:apk
   bunx --bun -p eas-cli eas credentials
   ```

4. Add that SHA-1 to the Android OAuth client in Google Cloud (package
   `com.bilcode.wastewise`) and wait a few minutes. Without it, Google Sign-In fails on the
   release APK with `DEVELOPER_ERROR` (code 10), even though debug builds work.

The phone needs Google Play Services, and the backend must be reachable from the phone with
`GOOGLE_CLIENT_ID`, the database and storage configured.

## Verification

```bash
bun run typecheck
bun run lint
bun run format:check
bun run test
bunx --bun expo-doctor
bun run export:android
```

Backend:

```bash
cd ../waste-wise-web/backend
bun run lint
bun run test
bun run build
bun run spec:generate
```

## API contract used

| Feature | Endpoint |
|---|---|
| Google mobile login | `POST /auth/mobile/google` |
| Mobile 2FA verify | `POST /auth/mobile/2fa/verify` |
| Refresh | `POST /auth/mobile/refresh` |
| Logout | `POST /auth/mobile/logout` |
| Session identity | `GET /auth/me` |
| Profile | `GET /auth/profile` |
| Dashboard stats | `GET /stats/reports` |
| Report list | `GET /reports?page&limit&status` |
| Report detail | `GET /reports/:id` |
| Upload photo | `POST /media/upload` (multipart `file`) |
| Create report | `POST /reports` with `description`, `mediaId`, `latitude`, `longitude` |

AI classification runs inside NestJS when the report is created. Mobile never calls the ML service directly and never stores ML credentials.

## Behaviour

- Login is Google-only on one auth screen. New Google accounts are registered automatically by NestJS.
- Accounts with 2FA enabled receive a short-lived challenge, then verify it on the mobile 2FA screen with an authenticator or recovery code. The challenge stays in memory and expires after 5 minutes.
- Access tokens last 15 minutes; refresh rotates the token pair. An invalid or expired refresh token clears the session. Transient network failures keep the session and show a retry screen.
- A report requires a photo, GPS coordinates, and a 3–2000 character description.
- Photos are compressed client-side to JPEG below 5 MB before upload.
- Create report is two steps: upload media, then create the report. Retrying after a failed create reuses the uploaded media ID.
- AI failure still creates a report with `classificationStatus=FAILED`; the app never invents a category.
- Users only see their own reports. Status changes are admin-only and unavailable in mobile.
- Light and dark themes are available, including a system-following option.

## Out of scope

Admin actions, status updates, editing/deleting submitted reports, offline submission, push notifications, iOS builds, and 2FA enrollment or disablement in mobile. Existing 2FA accounts can complete verification in mobile; enrollment remains web-only.

Regenerate brand assets after changing the web source:

```bash
python3 -m pip install pillow
python3 scripts/generate-brand-assets.py
bun run prebuild --platform android --clean
```
