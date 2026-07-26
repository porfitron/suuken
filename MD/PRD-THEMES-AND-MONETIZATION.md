# PRD: Themes, Theme Picker, Purchases & Ad Removal

**Status:** Draft (open questions resolved)  
**Product:** Kinkeda  
**Surfaces in scope:** iOS and Android only for themes/IAP. Web/PWA has no theme system.  
**Depends on:** [PRODUCT-REQUIREMENTS.md](./PRODUCT-REQUIREMENTS.md), [DESIGN.md](./DESIGN.md)

## 1. Summary

Introduce a first-class **theme system**, a **theme picker**, and **native in-app purchases** so players can unlock visual packs. Include:

- A path to **define and ship new themes** without rewriting gameplay.
- **Theme picker UX** in the existing app menu flow (native only).
- **Add-on purchases** on iOS and Android: fixed theme packs (Pack A, B, C…) sold separately.
- An **ad-removal entitlement flag** and `shouldShowAds()` helper in code; **no Remove Ads UI or store product until ads ship**.
- One **progression unlock**: a free extra theme after **20 wins** (completed matches, including CPU).

Themes are cosmetic only. Core rules, modes, and match flow stay free. **Web/PWA does not get themes.**

## 2. Goals

| Goal | Success looks like |
|------|--------------------|
| Theme engine | New themes ship as data + CSS variable overrides, not one-off forks of `app/index.html` |
| Discoverability | Players can browse, preview, and apply themes from the menu in under 3 taps |
| Monetization path | At least one fixed theme pack purchasable and restorable on iOS and Android |
| Progression delight | After 20 wins, unlock one free theme (name/art TBD) with celebration + apply CTA |
| Future ads | `adsRemoved` + `shouldShowAds()` ready; product/UI only when ads ship |
| Non-interference | Themes never reduce p1/p2 contrast or break multi-touch / GO readability |

## 3. Non-goals (this PRD)

- Implementing AdMob or showing ads (only the **ad-removal flag / product**).
- Subscriptions or accounts.
- Server-side inventory or cloud sync of unlocks.
- Sound packs, custom fonts as pack content, or illustrated thumb sprites (v2+).
- Separate free vs premium app binaries.
- Gating CPU mode, rankings, share, or rematch behind pay.

## 4. Personas & surfaces

| Surface | Themes | Purchases | Match unlock | Ad-removal product |
|---------|--------|-----------|--------------|--------------------|
| **iOS / Android** | Full | StoreKit / Play Billing | Yes (20 wins) | Hidden until ads ship |
| **Web / PWA** | **None** — no theme engine, picker, or unlocks | No | No | No |

Web keeps the current single Classic look with no theme UI. All theme work is native-only.

## 5. Theme definition system

### 5.1 Theme as a first-class object

Each theme is a stable record:

```text
Theme {
  id: string              // e.g. "classic", "arcade", "pastel"
  name: string            // display name
  description?: string    // one short line
  version: number         // bump when pack assets change
  unlock: UnlockRule      // see §5.3
  tokens: ThemeTokens     // CSS-facing values
  chrome?: {
    thumbGlyph?: string   // default "👍"; pack may override
    scanlines?: "off" | "low" | "high"
    glow?: "off" | "low" | "high"
  }
  confettiColors: string[]
  shareColors: { ... }    // must stay in sync with tokens for share canvas
  preview: {
    swatchP1: string
    swatchP2: string
    swatchAccent: string
  }
}
```

### 5.2 Token surface (minimum v1)

Themes override **CSS custom properties** (and matching JS constants for confetti + share canvas), not one-off class forks.

Minimum token set:

- Surfaces: `--bg`, `--surface`, `--surface-high`, `--on-surface`, `--on-surface-variant`
- Players: `--p1`, `--p2`, `--p1-glow`, `--p2-glow`
- Brand / CTA: `--gold`, `--gold-glow`, `--outline`
- Atmosphere (optional): `--scanline-opacity`, `--glow-strength`

**Implementation intent:** Refactor current neon CRT look into theme `classic` using these variables. Tailwind token *names* remain; values resolve through CSS vars where practical. Hardcoded hex in `kinkeda.css` / celebration / share paths migrate onto the same tokens.

### 5.3 Unlock rules

```text
UnlockRule =
  | { type: "default" }                         // always owned (Classic)
  | { type: "free" }                            // always owned, not default
  | { type: "matches", count: 20 }              // owned after 20 wins (completed matches)
  | { type: "iap", productId: string }          // owned via a fixed pack product
  | { type: "pack", productId: string }         // alias: theme belongs to Pack A/B/C…
```

A theme is **owned** if any applicable rule is satisfied. Ownership is the union of:

1. Default / free catalog rules  
2. Local progression (`winsCompleted >= 20`)  
3. Store entitlements for fixed packs (and local cache of unlocked theme ids)  
4. Dev / TestFlight unlock-all override  

### 5.4 Creating a new theme (authoring path)

**Checklist for shipping theme `id`:**

1. Add theme record to the theme registry (single module/map; source of truth).  
2. Provide token values + preview swatches + confetti/share color arrays.  
3. Set `unlock` (free, matches, or iap + `productId`).  
4. If IAP: create matching products in App Store Connect and Google Play Console; map `productId` in the billing config.  
5. Verify contrast: p1 vs p2, thumbs vs background, GO text readability (device + bright room).  
6. Verify win overlay, loading/scanlines, history rail, and share image.  
7. Add analytics `theme_id` dimension where relevant.  
8. QA on iOS + Android WebViews.

**Content guideline:** v1 packs are palette + atmosphere + win/confetti + optional thumb emoji. No new gameplay assets required.

### 5.5 Catalog (initial proposal)

| Theme id | Name | Unlock | Notes |
|----------|------|--------|-------|
| `classic` | Neon Classic | `default` | Current look; always owned |
| *(TBD)* | *(TBD — design later)* | `matches`, count **20** | Free progression reward after 20 wins |
| Pack A / B / C themes | TBD | `pack` / `iap` | Fixed packs sold separately; each pack unlocks its listed theme set only |

**Wins threshold:** **20** completed matches (each finished match with a winner counts as one win toward unlock). Includes CPU matches. Same moment as existing `match_completed` analytics.

## 6. Persistence & entitlements

### 6.1 Local storage keys (proposed)

| Key | Purpose |
|-----|---------|
| `kinkeda-theme-id` | Currently applied theme id |
| `kinkeda-matches-completed` | Lifetime wins / completed matches (monotonic integer; unlock at 20) |
| `kinkeda-unlocked-themes` | JSON string array of theme ids unlocked locally (progression + mirrored IAP) |
| `kinkeda-ads-removed` | `'1'` when ad-removal owned (local mirror of store entitlement) |
| Existing sound / names / ranking keys | Unchanged |

**Reset session** must **not** clear theme, unlocks, match count, or ads-removed.

### 6.2 Match / win counter

- Increment **once per completed match** (winner determined), **including CPU matches**.  
- Do not increment on abandoned / reset mid-match.  
- Counter is device-local; no cross-device sync (acceptable for v1).  
- When the counter reaches **20** and the progression theme was not yet owned, mark it owned and fire unlock UX (§8).

### 6.3 Entitlement source of truth

| Entitlement | Source of truth | Local mirror |
|-------------|-----------------|--------------|
| Applied theme | localStorage | — |
| Progression themes | win counter + unlock rule | `kinkeda-unlocked-themes` |
| IAP fixed packs | App Store / Play (via billing SDK) | unlocked-themes cache |
| Ad removal | App Store / Play (when product ships) | `kinkeda-ads-removed` |

On every cold start (native): **restore purchases** → merge into local unlocks → re-resolve ownership → if applied theme no longer owned (should not happen for non-consumables), fall back to `classic`.

## 7. Theme picker UX

### 7.1 Entry points

1. **App menu** → new item **Themes** (alongside Sound), opens theme picker.  
2. **Unlock celebration** (§8) → primary CTA “Apply theme” + secondary “Later”.  
3. **Optional soft prompt** after win when a locked paid theme exists (frequency-capped); not required for v1 MVP.

### 7.2 Picker presentation

Full-screen or large sheet over the current screen (setup or post-match is fine; **do not** open over GO / active capture).

**Layout:**

- Title: Themes  
- Scrollable list/grid of theme cards  
- Each card: name, 3-color swatch (p1 / p2 / gold), lock or owned state, price or “Free” / “Unlocked”  
- Selected (applied) theme: clear check / selected chrome  
- Footer actions: **Restore purchases**; **Remove ads** only after ads + that product ship (§10)

**Card states:**

| State | Affordance |
|-------|------------|
| Owned + not applied | Tap → apply immediately |
| Owned + applied | Selected; tap is no-op or subtle confirm |
| Locked (matches) | Show “Win 20 matches” progress (`k / 20`) |
| Locked (IAP) | Show price; tap → purchase sheet |
| Preview (optional) | Long-press or “Preview” applies temporarily until picker closes or “Cancel preview” |

**Preview (recommended):** Applying a locked theme as preview does not persist `kinkeda-theme-id` until purchase/unlock. Leaving the picker without unlocking reverts to the previously applied owned theme.

### 7.3 Accessibility & safety

- Minimum contrast maintained per theme QA checklist.  
- Touch targets ≥ existing menu items.  
- Picker dismissible via close control and system back (Android).  
- Do not block the next match: picker is interruptible.

### 7.4 Empty / error states

- Billing unavailable: show themes that are free/progression; paid cards show “Purchases unavailable” + Restore disabled reason.  
- Purchase pending / cancelled: no unlock; non-blocking toast/message.  
- Restore finds nothing: gentle “No purchases to restore”.

## 8. Free theme after 20 wins

### 8.1 Behavior

1. Track lifetime wins (`matchesCompleted` / completed matches with a winner).  
2. When counter transitions from **19 → 20**, unlock the progression theme.  
3. Show a **one-time unlock celebration** (modal or winner-adjacent sheet):  
   - Theme name + swatches  
   - Copy: e.g. “You’ve unlocked *{name}*”  
   - CTA: **Apply** / **Not now**  
4. Mark celebration as shown so it does not repeat (flag in unlocked metadata or separate `kinkeda-theme-unlock-seen:{id}`).  
5. Theme appears as owned in the picker thereafter.

### 8.2 Edge cases

- App upgraded mid-progress: if stored wins already ≥ 20, unlock silently (or show celebration once if never seen).  
- User already applied a paid pack theme: unlock still granted; do not force-apply.  
- Native-only: web has no theme unlock UX.

### 8.3 Tunables

| Tunable | Decision | Notes |
|---------|----------|-------|
| Win threshold | **20** | Includes CPU matches |
| Progression theme id / name / art | **TBD** | Design later; must not be an IAP-only id |
| Celebration | Required once | Skippable |

## 9. Purchases (iOS & Android)

### 9.1 Products (v1)

| Product type | Example product id | Unlocks |
|--------------|--------------------|---------|
| Non-consumable | `theme_pack_a` | Fixed set of themes in Pack A |
| Non-consumable | `theme_pack_b` | Fixed set of themes in Pack B |
| Non-consumable | `theme_pack_c` | Fixed set of themes in Pack C |
| Non-consumable | `remove_ads` | `adsRemoved === true` — **not sold until ads ship** |

All are **non-consumable**. No subscriptions in v1. No living “all future themes” bundle — only fixed packs sold separately.

### 9.2 Billing stack

- **Decide later:** RevenueCat vs direct Capacitor IAP (StoreKit 2 / Play Billing).  
- Either way, JS gameplay layer only calls a thin abstraction: `getOfferings()`, `purchase(productId)`, `restore()`, `hasEntitlement(id)`.  
- No custom receipt server required for v1.

### 9.3 Purchase flows

1. User taps locked pack theme → system purchase sheet for that pack’s product.  
2. Success → grant entitlement → add that pack’s theme ids to local unlocks → optionally auto-apply → analytics `theme_purchased`.  
3. Failure / cancel → no change.  
4. Restore → merge entitlements; analytics `purchases_restored`.

**Pack policy (decided):** Each Pack A / B / C is a **fixed set** defined at ship time. Buying Pack A does not unlock later packs or future themes outside that set.

### 9.4 Platform requirements

- App Store Connect / Play Console product setup before release.  
- Restore Purchases control visible in Themes UI (Apple expectation).  
- Privacy policy / store listings updated for IAP (no ads language until ads ship).  
- Sandbox / license-tester QA on both platforms.

## 10. Ad removal flag

### 10.1 Definition

```text
adsRemoved: boolean
```

- Derived from entitlement `remove_ads` (and local mirror).  
- Default `false`.  
- When `true`, **all** ad placement calls no-op (future AdMob/interstitial/banner/rewarded).  
- Theme ownership is independent: removing ads does not grant themes; theme packs do not remove ads unless a future “Premium” product explicitly combines both.

### 10.2 UX before ads exist

**Decision: hide entirely** until ads ship.

- No Remove Ads row in Themes / settings.  
- No `remove_ads` App Store / Play product until ads launch.  
- Still implement in code (ahead of ads PRD is optional but allowed):

```text
function shouldShowAds(): boolean {
  return IS_NATIVE && ADS_FEATURE_ENABLED && !entitlements.adsRemoved;
}
```

`ADS_FEATURE_ENABLED` stays `false` until an ads PRD ships. Local key `kinkeda-ads-removed` may exist unused until then.

### 10.3 Future Premium (out of scope, reserved)

Optional later SKU: `premium` = `remove_ads` + one or more fixed packs. Not required for v1.

## 11. Analytics

Extend existing GA (or equivalent) with:

| Event | Key params |
|-------|------------|
| `theme_picker_open` | source (`menu` \| `unlock` \| `prompt`) |
| `theme_preview` | `theme_id` |
| `theme_apply` | `theme_id`, `owned` |
| `theme_unlock_matches` | `theme_id`, `matches_completed` |
| `theme_purchase_start` | `product_id`, `theme_id` |
| `theme_purchased` | `product_id`, `theme_id` |
| `theme_purchase_fail` | `product_id`, `reason` |
| `purchases_restored` | `entitlement_count` |
| `remove_ads_purchased` | — |
| Existing `match_completed` | add `matches_completed_lifetime`, `theme_id` (applied) |

## 12. Phased delivery

### Phase A — Theme engine + picker (native, no IAP)

- CSS variable refactor; registry with `classic` + progression placeholder (art TBD).  
- Menu → Themes; apply + persist (**iOS/Android only**; web unchanged).  
- Win counter + unlock at 20 (incl. CPU) + celebration.

### Phase B — Native IAP

- Choose billing stack; ship fixed Pack A / B / C products + restore.  
- Lock pack themes in picker; purchase → unlock.  
- Store listing / privacy updates for IAP.

### Phase C — Ad-removal product (with ads)

- Ship only when ads ship: `remove_ads` product + UI + `adsRemoved` restore.  
- Wire `shouldShowAds()` to real placements.

### Phase D — Catalog growth

- Additional fixed packs; soft win prompts; progression theme final art.

## 13. Acceptance criteria

**Theme system**

- [ ] `classic` matches current visual identity after refactor.  
- [ ] Adding a theme requires registry entry + tokens, not gameplay edits.  
- [ ] Confetti and share image colors follow the applied theme.

**Picker**

- [ ] Reachable from app menu; does not open during GO.  
- [ ] Owned themes apply and persist across relaunch.  
- [ ] Locked match theme shows `k / 20` progress.  
- [ ] Locked pack themes show price on native.  
- [ ] Web has no Themes menu / theme switching.

**Progression**

- [ ] After **20** completed matches (incl. CPU), progression theme becomes owned exactly once.  
- [ ] Unlock celebration shows once; Apply works; Not now leaves picker ownership intact.  
- [ ] Session reset does not clear match count or unlocks.

**Purchases (native)**

- [ ] Sandbox purchase unlocks theme and survives kill/reinstall via Restore.  
- [ ] Cancelled purchase leaves theme locked.  
- [ ] Restore is available in the Themes UI.

**Ad removal**

- [ ] No Remove Ads UI or store product until ads ship.  
- [ ] When ads ship: `adsRemoved` persists/restores; `shouldShowAds()` is false when owned.

**Quality**

- [ ] Contrast QA passed for every shipped theme on a real phone.  
- [ ] No regression to multi-touch corner hit targets.

## 14. Decisions (resolved)

| # | Topic | Decision |
|---|--------|----------|
| 1 | Unlock threshold | **20 wins** (completed matches) |
| 2 | Progression theme | **TBD** — name and art direction design later |
| 3 | Web | **No themes on web**; themes/IAP are iOS & Android only |
| 4 | Remove Ads before ads | **Hide entirely** until ads ship |
| 5 | Packs | **Fixed packs** (Pack A, B, C…) sold separately; no living all-themes bundle |
| 6 | Billing stack | **Decide later** (RevenueCat vs direct IAP) |
| 7 | CPU matches | **Yes** — count toward the 20-win unlock |

## 15. Related docs

- [PRODUCT-REQUIREMENTS.md](./PRODUCT-REQUIREMENTS.md) — product overview  
- [DESIGN.md](./DESIGN.md) — current visual system (becomes `classic` tokens)  
- [ARCHITECTURE-AND-IMPLEMENTATION.md](./ARCHITECTURE-AND-IMPLEMENTATION.md) — Capacitor / web layout  
- Future: Ads implementation PRD (placements, ATT, privacy) when `ADS_FEATURE_ENABLED` flips on
