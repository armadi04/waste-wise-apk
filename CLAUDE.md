# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Additional notes

- Auth flow: Google Sign-In -> backend may answer with a two-factor challenge.
  `AuthProvider` (`src/auth/auth-provider.tsx`) holds the challenge in state and
  `signInWithGoogle` returns `{ status: 'two-factor-required' }`; `verifyTwoFactor(code)` completes it from
  `app/(auth)/two-factor.tsx`. Sign-in results are discriminated unions
  (`success | cancelled | two-factor-required | error`); keep new auth results in
  that shape rather than throwing.
- Route groups: `app/(auth)/` (login, two-factor), `app/(tabs)/` (dashboard,
  reports, profile), `app/reports/` (`create`, `[id]`).
- Non-HTTP logic lives in `src/lib/` (config, image compression, media URLs,
  formatting) and `src/auth/` (token storage, session restore, error mapping).
- Useful extra scripts: `bun run doctor` (expo-doctor), `bun run build:apk`
  (EAS preview APK), `bun run format` (write Prettier fixes).
