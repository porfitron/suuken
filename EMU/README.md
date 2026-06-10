# Suuken Mobile Preview (EMU)

Local mobile device simulator for previewing Suuken (`../index.html`) inside realistic phone frames with notches, status bars, and navigation bars.

Based on [EdgeSquare](https://github.com/bytemind-de/edge-sq-display-simulator) (MIT).

## Quick start

From the project root:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080/EMU/](http://localhost:8080/EMU/) in your browser.

Suuken loads automatically in the iframe. Use the **tune** icon to switch devices, adjust bar colors, or change the app URL.

## Notes

- Serve over HTTP — opening `EMU/index.html` directly as a `file://` URL may block the iframe.
- Default device is **iPhone 13 Pro**; bar colors default to Suuken's theme (`#0f0f1a`).
- Settings are stored in `localStorage` under the `suuken-emu-*` prefix.

## Licenses

See `LICENSE` (EdgeSquare / bytemind.de). Third-party assets: Pickr, SVG-Inject, Google Material Icons.
