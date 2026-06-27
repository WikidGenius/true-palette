# True Palette Atelier

A static, browser-only styling app that turns skin, hair, and eye color observations into fashion terms, iOS-style photo edit values, and a wardrobe color palette.

## Product direction

True Palette Atelier is designed to feel like a private fashion color fitting, not a generic quiz. The UI uses editorial serif display type, restrained cream/cocoa/terracotta/teal colors, fabric-like swatches, and a client-facing style report.

## Files

- `index.html` — the full app: markup, styling, and logic in one file for simple GitHub Pages deployment.
- `manifest.webmanifest` — Home Screen metadata.
- `icons/icon.svg` — app icon.
- `sw.js` — legacy cache cleanup only. The app does not register a new service worker.
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow.
- `.nojekyll` — serves static files directly.

## Deployment

The GitHub Pages workflow deploys on every push to `main` and can also be run manually from **Actions → Deploy static site to Pages**.

Published app URL:

```text
https://wikidgenius.github.io/true-palette/
```

## Privacy

The app runs fully in the browser. It does not send answers to a server. Results are only saved when the user copies, exports, or prints them.

## Maintenance notes

- No external fonts, frameworks, build tools, package managers, or runtime dependencies.
- Keep the app static unless a real backend need appears.
- Avoid adding caching unless there is a clear offline requirement; stale service worker caches made iteration harder in the prototype.
