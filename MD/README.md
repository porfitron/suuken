# Kinkeda documentation

Product and engineering docs for **Kinkeda** — a shared-screen thumb game shipped as a PWA and wrapped for native Android/iOS via Capacitor.

The GitHub repository is named **suuken**; the product, domain, and native app identity are **Kinkeda** (`kinkeda.com`, `com.kinkeda.app`).

## Documents

| Document | Purpose |
|----------|---------|
| [PRODUCT-REQUIREMENTS.md](./PRODUCT-REQUIREMENTS.md) | Product overview, game flow, platform targets, and non-functional requirements |
| [PRD-THEMES-AND-MONETIZATION.md](./PRD-THEMES-AND-MONETIZATION.md) | Themes system, picker UX, IAP, match unlock, and ad-removal entitlement |
| [RULES-AND-INTERACTION.md](./RULES-AND-INTERACTION.md) | Implemented round rules, phase interactions, and input mapping |
| [ARCHITECTURE-AND-IMPLEMENTATION.md](./ARCHITECTURE-AND-IMPLEMENTATION.md) | Runtime stack, state model, repo layout, PWA/native architecture |
| [DEV-AND-DEPLOYMENT.md](./DEV-AND-DEPLOYMENT.md) | Local dev, Capacitor sync, web deploy, and native store builds |
| [DESIGN.md](./DESIGN.md) | Visual design system (colors, typography, layout, components) |

## Quick start

```bash
npm install          # once
npm run dev:web      # local web preview at repo root
npm run cap:sync     # copy web assets → www/ and sync native projects
```

See [DEV-AND-DEPLOYMENT.md](./DEV-AND-DEPLOYMENT.md) for full setup, Android Studio, and Xcode workflows.
