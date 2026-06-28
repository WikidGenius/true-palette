# Deployment Rules

Use small GitHub writes for this app.

## Safe pattern

- Keep `index.html` mostly structure only.
- Put visual changes in `app/styles.css` or `app/dock.css`.
- Put question copy in `app/questions.js`.
- Put analysis rules in `app/scoring.js` or small override files.
- Put palette generation and palette descriptions in `app/palette.js`.
- Put result rendering and bottom slider UI in `app/render.js`.
- Put button events, loading state, copy, and export logic in `app/main.js`.

## Payload rule

Keep each GitHub write small, ideally under 5 to 8 KB. Treat 10 KB or more as risky. Avoid large single-file rewrites with dense inline HTML, CSS, and JavaScript.

## Deploy order

1. Add or update support files first.
2. Update `index.html` last only when it needs to reference new files.
3. Fetch changed files after deploy to confirm the latest SHA and content.
4. Share a cache-busting GitHub Pages URL after deploy.

## App logic rule

Keep the color logic tied to the guide: white/cream and metal tests for warm or cool direction, hair/skin/eye depth for light or dark value, face contrast for color strength, and hair/eye cues for accent colors. Keep the method race-neutral.
