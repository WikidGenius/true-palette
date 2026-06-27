# True Palette

A small static web app that asks about skin, hair, and eye color cues, then returns iOS-style photo edit values, fashion terms, and a wardrobe color palette.

## Files published

- `index.html` — the app
- `manifest.webmanifest` — Home Screen / PWA metadata
- `sw.js` — offline cache service worker
- `icons/icon.svg` — app icon
- `.github/workflows/pages.yml` — GitHub Pages deployment workflow
- `.nojekyll` — serves static files directly

## Deploy on GitHub Pages

This repo is ready for GitHub Pages using GitHub Actions.

Fastest path:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions**.
3. Open **Actions → Deploy static site to Pages** and run it, or push any small commit to `main`.
4. Open the Pages URL in Safari on iPhone.
5. Use **Share → Add to Home Screen**.

If GitHub Pages is unavailable because the repo is private, switch the repo to public or use a GitHub plan that supports private Pages.

## Privacy

The app runs fully in the browser. It does not send answers to a server.
