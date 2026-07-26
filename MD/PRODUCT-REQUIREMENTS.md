# Product Requirements Document (PRD): Kinkeda

## Product overview

**Kinkeda** is a shared-screen thumb game for two sides of one device. Each side controls two corner thumbs. On each turn, the game secretly picks a target total, both sides raise thumbs during GO, and the active player tries to match the target to put away one of their own thumbs.

The product ships on three surfaces:

| Surface | Status | Notes |
|---------|--------|-------|
| **Web PWA** | Live | [kinkeda.com](https://kinkeda.com) — installable, offline-capable |
| **Android app** | In development | Capacitor wrapper (`com.kinkeda.app`) |
| **iOS app** | In development | Capacitor wrapper (`com.kinkeda.app`) |

The app is built for strict full-screen, multi-touch interaction on phones and tablets. Native shells reuse the same web gameplay; platform-specific features (haptics, push) are planned additions, not yet shipped.

## Naming

- **Product / app name:** Kinkeda
- **Public URL:** https://kinkeda.com
- **GitHub repository:** suuken (historical repo name; unchanged)
- **Native bundle ID:** `com.kinkeda.app`

## Current game flow

1. **Setup**
   - Bottom side is `P1`, top side is `P2`.
   - Players can set names before starting.
   - Top side can be switched to **CPU** mode.
   - Session score persists between matches until reset.

2. **Turn start**
   - Active turn begins with `P1`, then alternates by round.
   - Game selects a random `targetTotal` from `0..activeCorners`.

3. **Countdown**
   - Center board shows `3, 2, 1`.
   - Board rotates 180° for top-side readability when relevant.

4. **Action (GO)**
   - 1-second capture window.
   - Human players press/release active corner zones to raise thumbs.
   - In CPU mode, P2 thumb raises are auto-generated.

5. **Resolution**
   - Game tallies active + pressed corners.
   - If tally matches `targetTotal`, active player wins the round and puts away one own thumb.
   - If only one thumb remains for that player, it is auto-removed.
   - If two remain, player chooses which own corner to eliminate (CPU auto-picks).

6. **Win condition**
   - A player wins the match when both of their own corners are inactive.
   - Winner celebration overlay appears, with rematch and sharing actions.

## Rules implemented

- **Target selection** is random per turn (not player-entered).
- **Round success** only occurs when `raised_total === target_total`.
- **Only active corners** are counted in tallies.
- **Turn alternates every round** via Next Turn.
- **Elimination ownership:** successful player always removes one of their own corners.
- **First to put both thumbs down wins** the match.

## Interaction model

- **Touch controls (primary)**
  - Multi-touch tracking maps touch IDs to specific corners.
  - `touchstart`, `touchend`, and `touchcancel` drive pressed-state updates.
  - Browser gestures are blocked for reliable gameplay (`touch-action: none`, gesture prevention, no page scroll).
- **Keyboard controls (desktop/testing)**
  - P1 Left: `:` or `;`
  - P1 Right: `'`
  - P2 Left: `A`
  - P2 Right: `S`
  - Keys hold/release thumbs during ACTION and can pick elimination during successful RESOLUTION.

## Platform requirements

### Web PWA

- Installable web app (`manifest.webmanifest`).
- Standalone display mode.
- Service worker asset caching for offline use.
- HTTPS enforcement on non-localhost environments.
- Safe-area-aware corner placement for notched devices.
- Install banner shown in supporting browsers (`beforeinstallprompt`); hidden in native Capacitor shells.

### Native (Capacitor)

- Same gameplay and UI as the web app, bundled in `www/` and loaded in a WebView.
- App ID `com.kinkeda.app`, display name **Kinkeda**.
- Android: Gradle project in `android/`.
- iOS: Xcode project in `ios/App/` (Swift Package Manager for dependencies).
- Self-hosted Tailwind, fonts, and icon font for offline play (web PWA + native).
- **Planned, not yet implemented:** native haptics, push notifications.

## Match and session features

- Player name entry and CPU toggle on setup screen.
- Session scoreboard across matches (P1 wins vs P2 wins).
- Reset session record in setup.
- Winner celebration with confetti, rematch, new players, and share/download result image.
- Recent target history rail (up to 10 rounds), shown during active gameplay.

## Non-functional requirements

- Full viewport lock (`100vw`, `100vh` / `100dvh`).
- No text selection or tap-highlight interference during play.
- High visual contrast for corners, state, and phase messaging.
- Single-file game runtime in `index.html` (no frontend framework).
- Google Analytics event instrumentation (`round_completed`, `match_completed`, `button_click`).

## Related docs

- [RULES-AND-INTERACTION.md](./RULES-AND-INTERACTION.md) — detailed phase and input reference
- [ARCHITECTURE-AND-IMPLEMENTATION.md](./ARCHITECTURE-AND-IMPLEMENTATION.md) — technical stack and repo layout
- [DEV-AND-DEPLOYMENT.md](./DEV-AND-DEPLOYMENT.md) — local dev, sync, and deploy instructions
- [PRD-THEMES-AND-MONETIZATION.md](./PRD-THEMES-AND-MONETIZATION.md) — themes, picker, IAP, match unlock, ad removal
