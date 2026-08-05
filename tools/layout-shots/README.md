# Layout Shots Harness

Regenerates the layout thumbnails that the RestoMenu mobile app shows in its
layout picker. The thumbnails live in `tv-display/public/layout-shots/` and
are served with the site (the Flutter app reads `layout-shots/layouts.json`).

## How it works

1. The TV app has a `?demo=1` preview mode that renders any layout with
   fixture data (`tv-display/src/demo/demoData.js`) — no Firebase, no device
   lock.
2. This script drives a headless browser through every layout id from
   `shared/layouts/capabilities.js` (the single source of truth) and
   screenshots each one at 1280x720 into `tv-display/public/layout-shots/<id>.jpg`.

## Usage

```bash
# 1. Build + serve the TV app (keep this running)
cd ../../tv-display
npm install
npm run build
npm run preview          # serves http://localhost:4173/RestoMenu/

# 2. In another terminal, regenerate the shots
cd ../tools/layout-shots
npm install
npm run shoot
```

The script uses your installed Chrome if available, otherwise the
Playwright-bundled Chromium (first run downloads it).

## When to run it

After adding a new layout (add the component, register it in
`shared/layouts/capabilities.js`, then regenerate). Commit the new `.jpg`
files so the mobile picker shows them — they are static assets, no deploy
step needed beyond the normal site build.
