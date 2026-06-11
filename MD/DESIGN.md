---
name: Iron Thumb Strike
colors:
  surface: '#121317'
  surface-dim: '#121317'
  surface-bright: '#38393d'
  surface-container-lowest: '#0d0e12'
  surface-container-low: '#1a1b20'
  surface-container: '#1f1f24'
  surface-container-high: '#292a2e'
  surface-container-highest: '#343439'
  on-surface: '#e3e2e7'
  on-surface-variant: '#d2c5ab'
  inverse-surface: '#e3e2e7'
  inverse-on-surface: '#2f3035'
  outline: '#9a9078'
  outline-variant: '#4e4632'
  surface-tint: '#f1c100'
  primary: '#ffedc3'
  on-primary: '#3d2f00'
  primary-container: '#ffcc00'
  on-primary-container: '#6f5700'
  inverse-primary: '#745b00'
  secondary: '#ddfcff'
  on-secondary: '#00363a'
  secondary-container: '#00f1fe'
  on-secondary-container: '#006a70'
  tertiary: '#ffe9ea'
  on-tertiary: '#67001d'
  tertiary-container: '#ffc3c7'
  on-tertiary-container: '#b6003a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe08b'
  primary-fixed-dim: '#f1c100'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#74f5ff'
  secondary-fixed-dim: '#00dbe7'
  on-secondary-fixed: '#002022'
  on-secondary-fixed-variant: '#004f54'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b8'
  on-tertiary-fixed: '#40000f'
  on-tertiary-fixed-variant: '#91002d'
  background: '#121317'
  on-background: '#e3e2e7'
  surface-variant: '#343439'
typography:
  display-xl:
    fontFamily: Anybody
    fontSize: 64px
    fontWeight: '900'
    lineHeight: 60px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Anybody
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Anybody
    fontSize: 28px
    fontWeight: '800'
    lineHeight: 32px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  button-text:
    fontFamily: Anybody
    fontSize: 18px
    fontWeight: '800'
    lineHeight: 20px
spacing:
  touch-target: 3rem
  gutter-sm: 1rem
  gutter-md: 1.5rem
  corner-safe: 1.25rem
  thumb-zone: 120px
---

## Brand & Style

This design system draws direct inspiration from modern fighting game franchises like *Street Fighter 6* and *Tekken*. It is built to evoke high-stakes tournament energy, treating every round of Suuken as a cinematic confrontation. 

The aesthetic is **Cinematic Brutalism**: raw, high-contrast, and aggressive. It utilizes heavy borders, slanted geometry, and gritty textures to move away from the "casual app" look into a "competitive arena" experience. The interface should feel like a "heads-up display" (HUD) overlaying an intense battle.

**Key Visual Pillars:**
- **Kinetic Energy:** Use of italics and 15-degree "shear" transforms on buttons and containers to imply forward motion.
- **Gritty Contrast:** Deep charcoal foundations allow neon player colors to "pop" with intensity.
- **Aggression:** Large, condensed typography that demands attention during fast-paced play.
- **Physicality:** Thick 2px–3px borders and glow effects that make the UI feel like electrified hardware.

## Colors

The palette is strictly divided by function and player identity. The "Challenger Yellow" is reserved for global actions, match states, and the "Start" sequence.

- **Background (Neutral):** A deep, slightly desaturated charcoal (#0D0E12) provides the "dark stage" for the match.
- **Player 1 (Primary Accent):** Electric Cyan (#00F2FF) represents the Home Player. Use this for P1’s name, thumb indicators, and glow effects on the bottom-left/right zones.
- **Player 2 (Secondary Accent):** Neon Magenta (#FF0055) represents the Challenger. Use this for P2’s indicators and top-zone UI elements.
- **Challenger Yellow:** Vibrant Yellow (#FFCC00) is the "Call to Action" color. It signifies "Round Start," "Victory," and "Next Turn."
- **Functional States:** Use Pure White (#FFFFFF) for high-readability body text and transparent greys for inactive or secondary elements.

## Typography

The typography system is built for speed and impact. 

- **Display & Headlines:** Use **Anybody** in its Extra-Bold or Black weights. Always apply a slight italic lean to simulate the "Versus" screen aesthetic. Headlines should always be Uppercase to maintain a competitive tone.
- **Body Text:** **Hanken Grotesk** provides a clean, modern contrast to the aggressive display face, ensuring game rules and settings remain legible.
- **Technical UI:** **JetBrains Mono** is used for small metadata, player labels (P1/P2), and technical inputs to give the UI a "system-coded" or arcade-machine feel.

## Layout & Spacing

The layout is a **Fixed Edge-Anchor Grid**. Since Suuken is a head-to-head physical game played on one device, the layout prioritizes the four corners of the screen.

- **The Combat Zone:** The four corners are reserved for thumb inputs. These "zones" have a minimum hit area of 120px.
- **The HUD (Center):** Game status, round numbers, and the "Match!" callouts are vertically centered to be visible to both players.
- **Bottom-Heavy CTA:** Primary buttons like "Next Turn" or "Start" are oversized and positioned in the bottom-middle for easy thumb access by the "Home" player.
- **Margins:** 24px (1.5rem) side margins are maintained for all text blocks.
- **Slant Logic:** Decorative containers should use a `-15deg` clip-path or skew to break the standard grid and add visual tension.

## Elevation & Depth

Depth in this system is created through **Luminance and Outlines** rather than soft shadows.

- **Glow Layers:** Use "Neon Outlines." Elements do not cast shadows downwards; they emit a light bleed (outer glow) in their respective player color (Cyan or Magenta).
- **Z-Axis Hierarchy:**
    - **Tier 1 (Surface):** The charcoal background.
    - **Tier 2 (Containers):** Semi-transparent dark surfaces with thick 2px solid borders.
    - **Tier 3 (Active HUD):** Elements with 4px Gaussian blurs behind them to simulate a CRT or HUD projection.
- **Modal Treatment:** Modals should take over the screen with a high-contrast white border and a background blur that desaturates the game state behind it.

## Shapes

The shape language is **Aggressive and Angular**.

- **Primary Radius:** Set to 0. Sharp corners are preferred to maintain the brutalist, fighting-game aesthetic.
- **Angled Cuts:** Instead of rounded corners, use 45-degree chamfered (clipped) corners for buttons and player badges.
- **Input Fields:** These should be simple rectangles with a 2px bottom-border that glows when focused.
- **Circular Elements:** Reserved only for player avatars or "Thumb Count" indicators to provide a functional contrast to the rectangular HUD elements.

## Components

- **Strike Buttons (Primary):** Large, rectangular, "Challenger Yellow" background with black italicized text. Includes a 3px offset "drop-border" to simulate a physical arcade button.
- **Versus Inputs:** Text fields for player names should have a dark fill and a high-contrast Cyan (P1) or Magenta (P2) stroke.
- **Status Badges:** Small "P1" or "P2" labels using **JetBrains Mono**, housed in a slanted pill or chamfered box.
- **Thumb Controls:** The circular tap areas in the corners should use a "Pulse" animation when it is that player's turn to act.
- **Match Callouts:** When a "Match!" occurs, the text should be displayed in `display-xl` with a chromatic aberration effect (slight red/blue color fringe) to signify the high-energy state.
- **Progress Bars (Round History):** Use segmented blocks rather than a smooth bar, reminiscent of a health bar in a fighting game.