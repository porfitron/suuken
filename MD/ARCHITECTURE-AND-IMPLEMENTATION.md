# Architecture & Implementation Notes (Current Build)

## Runtime stack

- **App shell:** Vanilla HTML/CSS/JavaScript in `index.html` (single-page runtime).
- **Styles:** `css/kinkeda.css` plus Tailwind CSS loaded from CDN in `index.html`.
- **Fonts:** Google Fonts (Anybody, Hanken Grotesk, JetBrains Mono) via CDN.
- **PWA metadata:** `manifest.webmanifest`.
- **Offline caching:** `sw.js` with cache-first strategy for core assets.
- **Analytics:** Google Analytics via `gtag` and custom events.
- **Native shells:** Capacitor 7 wraps the same web assets for Android and iOS.

## Repository layout

```text
suuken/                         # GitHub repo (product name: Kinkeda)
├── index.html                  # Game UI, state machine, interaction handlers (source of truth)
├── css/kinkeda.css
├── manifest.webmanifest
├── sw.js
├── icons/                      # SVG sources + generated PNGs (incl. app-icon-1024.png)
├── scripts/
│   ├── copy-web.mjs            # Copies web assets → www/ for Capacitor
│   └── generate-icons.mjs      # Renders PNG icons from SVG via @resvg/resvg-js
├── package.json                # npm scripts, Capacitor deps
├── capacitor.config.ts         # appId com.kinkeda.app, appName Kinkeda, webDir www
├── tsconfig.json               # TypeScript config for capacitor.config.ts
├── CNAME                       # kinkeda.com (GitHub Pages custom domain)
├── www/                        # Generated Capacitor web bundle (gitignored)
├── android/                    # Android Studio / Gradle project
├── ios/                        # Xcode project (SPM, not CocoaPods)
│   └── App/
│       ├── App.xcodeproj
│       └── App/                # Native target + bundled public/ web assets after sync
└── MD/                         # Product and engineering documentation
```

### Source vs native bundle

| Location | Role |
|----------|------|
| Repo root (`index.html`, `css/`, etc.) | **Edit here.** Deployed to GitHub Pages as-is. |
| `www/` | **Generated** by `npm run build:web`. Consumed by Capacitor. Gitignored. |
| `android/app/src/main/assets/public/` | **Synced** from `www/` via `cap sync`. Do not edit by hand. |
| `ios/App/App/public/` | **Synced** from `www/` via `cap sync`. Do not edit by hand. |

## Dual delivery architecture

```text
                    ┌─────────────────────┐
                    │  index.html + assets │
                    │  (repo root)         │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       GitHub Pages      copy-web.mjs      (same files)
       kinkeda.com            │                │
              │                ▼                │
              │             www/                │
              │                │                │
              │         cap sync ──────────────┤
              │                │                │
              │         ┌──────┴──────┐         │
              │         ▼             ▼         │
              │    android/       ios/        │
              │    (Play Store)  (App Store)   │
              ▼                                │
         Browser PWA ◄────────────────────────┘
         (install / offline SW)
```

## Core state model

The runtime state in `index.html` tracks:

- `turn`: `P1 | P2`
- `phase`: `SETUP | COUNTDOWN | ACTION | RESOLUTION | GAMEOVER`
- `playerNames`, `cpuEnabled`, `lastHumanP2Name`
- `activeCorners` and `pressedCorners`
- `targetTotal`, `lastTotal`, `roundSuccess`, `thumbDropped`, `winner`
- `currentMatchRounds`
- timers (`countdownTimer`, `actionTimer`)
- `touchIds` map for robust multi-touch mapping

Separate structures:

- `sessionRecord`: cumulative wins across matches
- `targetHistory`: rolling latest target totals (max 10)

## Phase engine

- **SETUP:** names, CPU toggle, start/about controls, session actions.
- **COUNTDOWN:** starts at 3 with timed updates, then transitions to ACTION.
- **ACTION:** 1-second input window; thumbs can be raised/lowered live.
- **RESOLUTION:** compares raised total vs target; handles elimination and next-turn flow.
- **GAMEOVER:** celebration overlay and post-match actions.

## Interaction system

- Multi-touch is handled by listening at app root:
  - `touchstart` → map touch identifier to corner and set pressed
  - `touchend` / `touchcancel` → release mapped corner
- Corner elimination can be triggered by touch during successful RESOLUTION.
- Keyboard fallback for development/testing:
  - `:` / `;` → `p1Left`
  - `'` → `p1Right`
  - `a` → `p2Left`
  - `s` → `p2Right`

## UI/UX behavior

- Fullscreen, non-scrolling, gesture-suppressed play surface.
- Safe-area corner positioning and top-player orientation handling.
- Center board rotates where needed for top-side readability.
- Winner celebration includes confetti and optional result sharing.
- Install banner appears from `beforeinstallprompt` in browsers only; suppressed when `window.Capacitor.isNativePlatform()` is true.

## PWA / offline behavior

- `manifest.webmanifest` configured with `start_url: "./"`, `scope: "./"`, `display: "standalone"`.
- `sw.js` caches core assets and serves cache-first for GET requests.
- Cache versioning via `CACHE = 'kinkeda-v2'` in `sw.js`.

## Capacitor configuration

```typescript
// capacitor.config.ts (summary)
appId: 'com.kinkeda.app'
appName: 'Kinkeda'
webDir: 'www'
server.androidScheme: 'https'
```

- **Android:** `MainActivity` extends `BridgeActivity` in `com.kinkeda.app`.
- **iOS:** Swift Package Manager (`CapApp-SPM`); open `ios/App/App.xcodeproj` in Xcode.
- **Plugins installed:** core only (`@capacitor/core`, `@capacitor/android`, `@capacitor/ios`). No haptics or push plugins yet.

## Instrumentation events

Tracked events include:

- `round_completed` (turn, target, raised, match flag, round number)
- `match_completed` (winner, rounds, CPU mode, session totals)
- `button_click` (button id/label + current phase)

## Known gaps / follow-ups

- Tailwind and Google Fonts are CDN-hosted; native offline builds should self-host these assets.
- Android launcher icons are Capacitor defaults; iOS uses generated Kinkeda icon (`icons/app-icon-1024.png`).
- Native haptics and push notifications are not yet integrated.

## Related docs

- [DEV-AND-DEPLOYMENT.md](./DEV-AND-DEPLOYMENT.md) — setup, sync, and deploy workflows
- [PRODUCT-REQUIREMENTS.md](./PRODUCT-REQUIREMENTS.md) — product scope and platform targets
- [RULES-AND-INTERACTION.md](./RULES-AND-INTERACTION.md) — gameplay rules reference
