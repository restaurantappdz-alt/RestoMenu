# RestoMenu

Digital TV menu display + admin dashboard.

## Project Structure

```
restomenu-web/
├── admin-dashboard/   # React admin app (shadcn/ui, Firebase Auth)
│   ├── scripts/       # Build-time scripts (layout shots generator)
│   └── public/layout-shots/  # Generated layout previews (committed to git)
├── tv-display/        # React TV display app (public-facing)
└── README.md
```

## Layout Shots API

Generate 1280×720 screenshots of each TV layout template in empty state (no menu data — just the visual frame). Served as static files alongside the admin dashboard for your mobile app to fetch layout previews.

### Endpoint

```
GET https://restomenu2.web.app/RestoMenu/dashboard/layout-shots/layouts.json
```

Returns all 9 layouts with name + image URL:

```json
{
  "layouts": [
    { "id": "classic", "name": "Classic Gold", "image": "/RestoMenu/dashboard/layout-shots/classic.jpg" },
    { "id": "bistro",  "name": "Bistro Chalkboard", "image": "/RestoMenu/dashboard/layout-shots/bistro.jpg" },
    ...
  ]
}
```

### How it works

1. A new `LayoutShotsPage` component renders a single layout at 16:9 with empty data when URL has `?layout=` param — no auth, no Firebase, no admin chrome
2. A Playwright script (`admin-dashboard/scripts/generate-layout-shots.mjs`) starts the Vite dev server, visits each layout URL, and screenshots at 1280×720 JPEG quality 80
3. Screenshots + `layouts.json` are saved to `admin-dashboard/public/layout-shots/` which Vite bundles into `dist/` on build
4. Your mobile app fetches the JSON endpoint and displays the images

### Generate screenshots

```bash
cd admin-dashboard
npm run generate-shots
```

This produces 9 JPG files (~15-50 KB each, ~230 KB total) in `admin-dashboard/public/layout-shots/`.

**Prerequisites:** Playwright + Chromium (installed once):
```bash
cd admin-dashboard
npm install -D playwright
npx playwright install chromium
```

### Preview a layout in browser

```
http://localhost:5173/?layout=classic
http://localhost:5173/?layout=bistro
http://localhost:5173/?layout=moroccan
```

No auth needed — the page renders the layout directly at 16:9 without any admin UI.

### Deploy

```bash
cd admin-dashboard
npm run build
cd ..
firebase deploy --only hosting:admin
```

The `layout-shots/` directory is included in the build output automatically.

## Adding a New Layout

1. Create the layout component in both:
   - `admin-dashboard/src/layouts/LayoutMyNew.jsx`
   - `tv-display/src/layouts/LayoutMyNew.jsx`
   - Props: `{ categories, allAddons, offline, menu, title }`
2. Register in both `layouts/index.js` files (import + add to `layouts` object + `layoutOptions` array)
3. Add option in `admin-dashboard/src/components/MenuEditor.jsx` `LAYOUT_OPTIONS` array
4. Add entry in `admin-dashboard/scripts/generate-layout-shots.mjs` `layouts` array
5. Re-run `npm run generate-shots` to capture the new layout preview
6. Build both apps and verify
