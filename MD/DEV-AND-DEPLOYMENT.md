# Development & Deployment Guide

This guide covers local development, Capacitor native sync, web deployment to GitHub Pages, and native store builds for **Kinkeda**.

The GitHub repository is **suuken**; the product name, domain, and native app identity are **Kinkeda**.

## Prerequisites

### All platforms

- **Node.js** 18+ and **npm**
- Git

### Web-only development

No additional tools required beyond Node.js.

### Android native builds

- [Android Studio](https://developer.android.com/studio) (includes Android SDK)
- JDK compatible with the Gradle version in `android/`

### iOS native builds (macOS only)

- **Xcode** (from the Mac App Store)
- Apple Developer account (for device testing, TestFlight, and App Store)
- This project uses **Swift Package Manager (SPM)** for iOS dependencies — CocoaPods is not required.

## Initial setup

Clone the repo and install dependencies once:

```bash
git clone <repo-url>
cd suuken
npm install
```

## Project structure (dev mental model)

| Path | What you edit | What deploys / runs |
|------|---------------|---------------------|
| `index.html`, `css/`, `icons/`, `sw.js`, `manifest.webmanifest` | Yes — primary source | GitHub Pages (repo root) |
| `www/` | No — generated | Capacitor web bundle |
| `android/`, `ios/` | Native config only (icons, signing, permissions) | Play Store / App Store |

**Rule:** always edit web files at the **repo root**. Run `npm run cap:sync` before testing native or cutting store builds.

## npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev:web` | `npx serve .` | Local static server for the PWA at repo root |
| `npm run build:web` | `node scripts/copy-web.mjs` | Copy web assets into `www/` |
| `npm run cap:sync` | `build:web` + `cap sync` | Refresh native projects with latest web code |
| `npm run cap:open:android` | `cap open android` | Open project in Android Studio |
| `npm run cap:open:ios` | `cap open ios` | Open project in Xcode |
| `npm run cap:run:android` | `cap run android` | Build and run on Android emulator/device |
| `npm run cap:run:ios` | `cap run ios` | Build and run on iOS simulator/device |
| `npm run icons` | `node scripts/generate-icons.mjs` | Regenerate PNG icons from SVG sources |

## Local web development

### Option 1: Static file server (recommended)

```bash
npm run dev:web
```

Opens the app from the repo root (default port depends on `serve`, usually 3000 or 5000). Use this for day-to-day gameplay and UI work.

### Option 2: Open `index.html` directly

Works for quick checks, but service worker registration and some PWA features require HTTP(S). Prefer `dev:web` for accurate PWA behavior.

### Desktop keyboard testing

With the app loaded, use:

- P1: `[` `;` `]` `'` (left/right thumbs)
- P2: `a` / `s` (left/right thumbs)
- Spacebar for next turn (when available)

Details are also shown in the About modal.

### HTTPS redirect

`index.html` redirects HTTP → HTTPS on non-localhost hosts. Localhost is exempt.

## Native development workflow

### 1. Make web changes

Edit files at the repo root as usual (`index.html`, `css/kinkeda.css`, etc.).

### 2. Sync to native projects

```bash
npm run cap:sync
```

This:

1. Runs `scripts/copy-web.mjs` → rebuilds `www/`
2. Copies `www/` into Android and iOS asset folders
3. Updates Capacitor plugin configuration

Run this after every web change you want to test on device or ship in a native build.

### 3. Open and run

**Android:**

```bash
npm run cap:open:android
```

In Android Studio: select an emulator or connected device → Run.

Or from the terminal:

```bash
npm run cap:run:android
```

**iOS:**

```bash
npm run cap:open:ios
```

In Xcode: open `ios/App/App.xcodeproj`, select a simulator or device → Run (⌘R).

Or from the terminal:

```bash
npm run cap:run:ios
```

### Live reload on device (optional)

For faster native iteration, serve the repo root and point Capacitor at your machine:

```bash
npm run dev:web -- -p 3000
npx cap run ios -l --external
# or
npx cap run android -l --external
```

The device/emulator loads assets from your dev server over the local network.

## Icon generation

SVG sources live in `icons/`. PNG exports (PWA, OG image, native app icon) are generated:

```bash
npm run icons
```

Outputs include `icons/app-icon-1024.png`, used for the iOS App Store icon. After regenerating icons, run `npm run cap:sync` and update Android mipmaps manually if needed (Android launcher icons are still Capacitor defaults).

## Deploying the web app (GitHub Pages)

The live site is **https://kinkeda.com**, configured via `CNAME`.

### What gets deployed

GitHub Pages serves files from the **repository root** — not from `www/`. Deployed paths include:

- `index.html`
- `css/`
- `icons/`
- `sw.js`
- `manifest.webmanifest`
- `robots.txt`, `sitemap.xml`
- `downloads/` — Android APK for tester sideloading (see below)

The `www/` folder is gitignored and is **not** part of the web deploy.

### Tester APK downloads

After building a signed release APK in Android Studio (`android/app/release/app-release.apk`):

```bash
npm run build:android-download
```

This copies the APK to `downloads/` with a versioned filename and refreshes `downloads/manifest.json` (preserving any existing `testFlightUrl`). Commit and push `downloads/` so testers can install from:

**https://kinkeda.com/downloads/**

Set the public TestFlight join link once in `downloads/manifest.json`:

```json
"testFlightUrl": "https://testflight.apple.com/join/XXXXXXXX"
```

Bump `versionName` / `versionCode` in `android/app/build.gradle` before each new tester build so filenames stay distinct.

### Deploy steps

1. Edit and test locally (`npm run dev:web`).
2. Commit and push to the branch configured for GitHub Pages (typically `main`):

   ```bash
   git add index.html css/ icons/ sw.js manifest.webmanifest ...
   git commit -m "Describe your change"
   git push origin main
   ```

3. GitHub Pages rebuilds automatically. Allow a minute or two for changes to appear at [kinkeda.com](https://kinkeda.com).

### Service worker cache busting

After deploying web changes, returning visitors may see cached assets until the service worker updates. Bump the cache name in `sw.js` when you need to force a refresh:

```javascript
const CACHE = 'kinkeda-v3'; // increment version
```

Also update the `ASSETS` list in `sw.js` if you add new static files.

## Deploying native apps

Native releases are separate from the web deploy. Web can update instantly via GitHub Pages; store apps require a new binary and review.

### Pre-release checklist

- [ ] Run `npm run cap:sync` with the commit you intend to ship
- [ ] Bump `versionName` / `versionCode` (Android) and `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` (iOS) as needed
- [ ] Verify signing configuration (keystore / provisioning profiles)
- [ ] Confirm CDN assets load correctly on device (Tailwind, fonts require network today)

### Android (Play Store)

1. `npm run cap:sync`
2. `npm run cap:open:android`
3. In Android Studio: **Build → Generate Signed Bundle / APK**
4. Upload the **AAB** to [Google Play Console](https://play.google.com/console)

Key identifiers:

- Application ID: `com.kinkeda.app`
- Project path: `android/`

### iOS (TestFlight / App Store)

1. `npm run cap:sync`
2. `npm run cap:open:ios`
3. In Xcode: set signing team, then **Product → Archive**
4. Upload via Organizer to App Store Connect

Key identifiers:

- Bundle ID: `com.kinkeda.app`
- Display name: **Kinkeda**
- Project path: `ios/App/App.xcodeproj`

### Web vs native update cadence

| Change type | Web (PWA) | Native app |
|-------------|-----------|------------|
| Gameplay / UI in `index.html` | Push to GitHub | `cap:sync` + new store release |
| `sw.js` cache | Push to GitHub | Bundled in next native release |
| Native permissions, icons, signing | N/A | Edit `android/` or `ios/` |

## Troubleshooting

### `cap sync` fails or native app shows stale UI

```bash
npm run build:web    # verify www/ is fresh
npm run cap:sync
```

Then clean/rebuild in Android Studio or Xcode.

### iOS: CocoaPods errors

This project uses **SPM**, not CocoaPods. Open `App.xcodeproj` directly (not a `.xcworkspace`).

### Android doctor / SDK issues

```bash
npx cap doctor android
```

Install missing SDK components via Android Studio → SDK Manager.

### iOS doctor

```bash
npx cap doctor ios
```

### PWA install banner on native

The install banner is gated by `window.Capacitor.isNativePlatform()`. If it appears in a native build, confirm `cap sync` ran and the latest `index.html` is in `www/`.

## Related docs

- [ARCHITECTURE-AND-IMPLEMENTATION.md](./ARCHITECTURE-AND-IMPLEMENTATION.md) — repo layout and dual-delivery architecture
- [PRODUCT-REQUIREMENTS.md](./PRODUCT-REQUIREMENTS.md) — platform scope and product naming
- [README.md](./README.md) — documentation index
