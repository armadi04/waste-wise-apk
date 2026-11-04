# WasteWise mobile UI conventions

## Foundation

Expo SDK 58 app on React Native 0.88 with Expo Router, TypeScript and React Native
StyleSheet. Reuse the mobile primitives in `src/components/ui`: `Screen`, `Card`,
`Button`, `TextField`, `Segmented`, `AppText` and the shared state components. TanStack Query
owns server state. React Hook Form and Zod own form state. Bun is the package manager.
Backend permissions remain authoritative.

## Colors and typography

### Theme contract

Semantic tokens live in `src/theme/tokens.ts`. `ThemeProvider` in
`src/theme/theme-provider.tsx` resolves the system color scheme plus the stored preference in
AsyncStorage (`wastewise.theme-preference`) and exposes `useTheme()`. It gates rendering on
`hydrated` so the first visible render uses the resolved theme. The preference is either
`light`, `dark` or `system`; an explicit preference overrides the system value.

Use `useTheme()` tokens in screens and components. Never hardcode UI hex or rgba values
outside `tokens.ts`. The only exception is a third-party brand mark, such as the Google logo
colors isolated in `src/components/ui/google-icon.tsx`.

Use the white, zinc and teal palette in both modes. Primary actions use `#0F766E` so white
labels meet the 4.5:1 contrast requirement. `brand` (`#0B4F5C`) is the auth and brand-hero
surface color, not a general action color. `accent` (`#F3AA28`) is the wordmark highlight
only. Every token must exist in both themes; never inherit a missing dark value from light.

### Surfaces, actions and inputs

| Application token | Light | Dark |
|---|---|---|
| `background` | #FFFFFF | #000000 |
| `surface` | #FFFFFF | #18181B |
| `surface-hover` | #E4E4E7 | #3F3F46 |
| `surface-pressed` | #D4D4D8 | #52525B |
| `foreground` | #11181C | #ECEDEE |
| `muted` | #F4F4F5 | #27272A |
| `muted-foreground` | #52525B | #D4D4D8 |
| `border-subtle` | #E4E4E7 | #3F3F46 |
| `border-control` | #71717A | #A1A1AA |
| `primary` | #0F766E | #0F766E |
| `primary-hover` | #115E59 | #115E59 |
| `primary-pressed` | #134E4A | #134E4A |
| `primary-foreground` | #FFFFFF | #FFFFFF |
| `link` | #0F766E | #5EEAD4 |
| `link-hover` | #115E59 | #99F6E4 |
| `selected-background` | #F0FDFA | #134E4A |
| `selected-hover` | #CCFBF1 | #115E59 |
| `selected-foreground` | #0F766E | #99F6E4 |
| `selected-border` | #0D9488 | #2DD4BF |
| `brand` | #0B4F5C | #0B4F5C |
| `brand-pressed` | #083F49 | #083F49 |
| `brand-foreground` | #FFFFFF | #FFFFFF |
| `brand-muted-foreground` | #D3DFE2 | #D3DFE2 |
| `shadow` | #000000 | #000000 |
| `focus` | #0D9488 | #5EEAD4 |
| `focus-offset` | #FFFFFF | #18181B |
| `disabled-background` | #F4F4F5 | #27272A |
| `disabled-foreground` | #71717A | #A1A1AA |
| `disabled-border` | #D4D4D8 | #52525B |
| `input-background` | #FFFFFF | #18181B |
| `input-foreground` | #11181C | #ECEDEE |
| `input-placeholder` | #71717A | #A1A1AA |
| `input-border` | #71717A | #A1A1AA |
| `input-border-hover` | #3F3F46 | #D4D4D8 |
| `input-border-focus` | #0D9488 | #5EEAD4 |
| `input-border-error` | #B91C1C | #F87171 |
| `accent` | #F3AA28 | #F3AA28 |

`surface` is the background for cards, sheets, forms and navigation. `border-subtle` is
only a decorative separator; interactive controls use `border-control` or `input-border`.
Neutral interactive rows use `surface-hover` / `surface-pressed` with `foreground`.

Primary buttons use `primary` / `primary-hover` / `primary-pressed` with
`primary-foreground` in every state. Brand hero surfaces use `brand` with `brand-foreground`
and `brand-muted-foreground`; do not use `brand` as a universal action color. Links use
`link` / `link-hover`; never use the solid-button background as a universal text color.

Selected rows, options and navigation use `selected-background` / `selected-hover` with
`selected-foreground`; add a non-color cue such as weight, an icon or a label, and expose the
corresponding accessible state. Reserve `selected-border` for choice controls and tone
borders, not for navigation, table rows or list options.

The `accent` token is a brand-only highlight for the wordmark. Never use it for actions,
status meaning or body text. `shadow` is the only allowed shadow color; shadows must not
become light glows in dark mode.

Inputs keep `input-background` and `input-foreground` across normal and focus states. Use the
placeholder token only for placeholders, never as a replacement for labels. Switch the border
to hover, focus or error tokens as appropriate. Disabled fields use the three disabled tokens.

Show a 2 px `focus` ring with a 2 px `focus-offset` gap around focused text fields on
keyboard focus. Keep the error border when an invalid input is focused and show the
independent focus ring around it. Buttons and other pressables expose `accessibilityState`
and keep a visible pressed state. Disabled controls use the three disabled tokens, suppress
pressed styles and expose the disabled state. Do not apply a second opacity reduction to the
entire control.

### Status colors and explicit pairs

Status text and icons on neutral surfaces use the base status token. Soft badges and inline
alerts use the corresponding `-background`, `-foreground` and `-border` tokens together.
Filled status buttons use `-solid`, `-solid-hover`, `-solid-pressed` with
`-solid-foreground`. Solid status colors stay dark in both modes so white labels retain
contrast. A bright dark-mode status text color must never become a solid button background
with white text. Keep status meaning consistent and include a label or icon; never
communicate status through color alone.

| Application token | Light | Dark |
|---|---|---|
| `success` | #15803D | #4ADE80 |
| `success-background` | #F0FDF4 | #14532D |
| `success-foreground` | #166534 | #DCFCE7 |
| `success-border` | #15803D | #4ADE80 |
| `success-solid` | #15803D | #15803D |
| `success-solid-hover` | #166534 | #166534 |
| `success-solid-pressed` | #14532D | #14532D |
| `success-solid-foreground` | #FFFFFF | #FFFFFF |
| `warning` | #B45309 | #FBBF24 |
| `warning-background` | #FFFBEB | #451A03 |
| `warning-foreground` | #92400E | #FDE68A |
| `warning-border` | #B45309 | #FBBF24 |
| `warning-solid` | #B45309 | #B45309 |
| `warning-solid-hover` | #92400E | #92400E |
| `warning-solid-pressed` | #78350F | #78350F |
| `warning-solid-foreground` | #FFFFFF | #FFFFFF |
| `danger` | #B91C1C | #FCA5A5 |
| `danger-background` | #FEF2F2 | #450A0A |
| `danger-foreground` | #991B1B | #FECACA |
| `danger-border` | #B91C1C | #F87171 |
| `danger-solid` | #B91C1C | #B91C1C |
| `danger-solid-hover` | #991B1B | #991B1B |
| `danger-solid-pressed` | #7F1D1D | #7F1D1D |
| `danger-solid-foreground` | #FFFFFF | #FFFFFF |
| `info` | #0F766E | #5EEAD4 |
| `info-background` | #F0FDFA | #134E4A |
| `info-foreground` | #0F766E | #99F6E4 |
| `info-border` | #0D9488 | #2DD4BF |
| `info-solid` | #0F766E | #0F766E |
| `info-solid-hover` | #115E59 | #115E59 |
| `info-solid-pressed` | #134E4A | #134E4A |
| `info-solid-foreground` | #FFFFFF | #FFFFFF |

### Component mapping

| Mobile primitive | Color and state rule |
|---|---|
| `AppText` | `typography` role + `fontFamily`; defaults to `foreground` |
| `Screen` | `background`, safe areas, optional scroll and refresh control |
| `Card` | `surface`, `border-subtle` and `radius.lg` |
| `Button` | Primary uses `primary` + `primary-foreground`; danger uses `danger-solid` + `danger-solid-foreground`; disabled uses disabled tokens |
| `TextField` | Input tokens, focus ring, disabled tokens and inline error text |
| `Segmented` | `selected-*` tokens plus weight and accessible selected state |

Do not rely on opacity or inherited colors to approximate a token state. Use the explicit
hover, pressed, selected, invalid and disabled tokens in the shared components.

### Contrast and implementation acceptance

- Normal text, list data, placeholders and badge labels: at least 4.5:1 against their actual
  background. Large text: at least 3:1 under WCAG's large-text definition.
- Required control boundaries, state indicators and focus indicators: at least 3:1 against
  adjacent colors. Decorative separators and inactive controls are exempt; disabled text must
  still remain reasonably legible.
- Validate rendered combinations including pressed, selected, invalid and focus states; any
  overlay, shadow or custom background requires a fresh contrast check.
- Review buttons, inputs, cards, navigation, status badges, sheets and modals in both modes,
  including switching the theme while a modal is open. Raw token checks do not replace
  rendered component verification.

### Typography

Use **Plus Jakarta Sans** throughout the UI with a system sans-serif fallback. Use weights
400, 500 and 600; avoid thin weights for operational data.

| Element | Size | Weight |
|---|---|---|
| Display / auth hero | 30–32 px | 600 |
| Page title | 24–28 px | 600 |
| Section title | 18–20 px | 600 |
| Card title | 16 px | 600 |
| Body and form inputs | 14–16 px | 400 |
| Navigation, labels and buttons | 14–15 px | 500–600 |
| Metadata and captions | 12–13 px | 400 |

Use a body line-height of 1.5 and a heading line-height of 1.25–1.3. Keep labels readable and
hierarchy clear. Use tabular figures for amounts, quantities and dates where the platform
supports them. Long list rows use truncation plus accessible full content where necessary.

## Layout and interaction

- Expo Router owns navigation; the root stack keeps protected route groups and redirects
  unauthenticated users to the correct screen.
- Page headers own the title, description and primary actions.
- Use `Screen` for safe areas, padding, scrolling and refresh behavior.
- Forms own values through React Hook Form and Zod; modal stores own open and selection state
  only.
- Use native modals and sheets with labeled controls and accessible dismissal.
- Confirm destructive actions, retain drafts on API failure and surface actionable errors.
- Permission gates apply to navigation and actions; never imply a UI gate authorizes API
  access.
- Use owner-specific skeletons during loading; distinguish loading, empty, forbidden and
  error states.
- Honor reduced motion; animations provide feedback without blocking interaction.
- Keep light and dark modes, font scaling, mobile overflow and keyboard navigation working
  after changes.

## Customizing a clone

Update app labels, Expo config in `app.json`, public icons and theme tokens together. Keep the
`brand`, `accent`, and status token contracts intact when changing the palette. Do not embed
business-specific fixture metrics in generic screens. Re-check light/dark contrast, safe-area
layout, long labels and keyboard navigation after changes.
