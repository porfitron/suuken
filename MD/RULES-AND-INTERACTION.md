# Rules and Interaction Reference (Implemented)

This document reflects the behavior currently implemented in the shipped web app and Capacitor native shells (same runtime).

## Round rules

- Turn owner alternates each round (`P1` then `P2`).
- At round start, game randomly picks a target total from `0..numberOfActiveCorners`.
- During ACTION, raised thumbs are counted only from currently active corners.
- A successful round requires `raised_total === target_total`.
- On success, the active player puts away one of their own thumbs:
  - If they have one thumb left, it is auto-removed.
  - If they have two left, they choose the corner during RESOLUTION.
  - If top side is CPU and it must choose, selection is random.
- Match winner is the first player with both own corners inactive.

## Phase interactions

- **SETUP**
  - Enter player names (bottom/top).
  - Optional CPU toggle for top side.
  - Start match, open About modal, optionally reset session record.
- **COUNTDOWN**
  - 3-step countdown with central board messaging.
- **ACTION**
  - 1-second hold window for simultaneous corner presses.
  - Corners visually highlight while pressed.
  - CPU (if enabled) auto-generates top-side thumb choices.
- **RESOLUTION**
  - Displays target vs measured total and match/no-match result.
  - If elimination choice is needed, successful player taps their corner to remove it.
  - Otherwise proceed with Next Turn.
- **GAMEOVER**
  - Celebration overlay, confetti, rematch/new players options.
  - Optional share/download of generated result image.

## Input mapping

- **Touch (primary):** `touchstart`, `touchend`, `touchcancel` with touch identifier tracking.
- **Keyboard (fallback/testing):**
  - `:` or `;` → bottom-left (`p1Left`)
  - `'` → bottom-right (`p1Right`)
  - `A` → top-left (`p2Left`)
  - `S` → top-right (`p2Right`)
- Keyboard supports both ACTION press/release and RESOLUTION elimination picks.

## Session / meta interactions

- Session score persists across rematches.
- New player(s) resets names, CPU setting, session score, and returns to setup.
- Target history (max 10) appears on side rails during gameplay.
- **Install banner:** shown on `beforeinstallprompt` in supporting browsers, with dismiss persistence in `localStorage`. Not shown in Capacitor native apps (store install replaces PWA install).
- About modal supports close button, backdrop close, and `Escape`.

## Analytics events

- `round_completed`
- `match_completed`
- `button_click`

These events include context like current phase, winner/round data, and CPU mode.

## Related docs

- [PRODUCT-REQUIREMENTS.md](./PRODUCT-REQUIREMENTS.md) — product overview and platform scope
- [ARCHITECTURE-AND-IMPLEMENTATION.md](./ARCHITECTURE-AND-IMPLEMENTATION.md) — where this logic lives in code
