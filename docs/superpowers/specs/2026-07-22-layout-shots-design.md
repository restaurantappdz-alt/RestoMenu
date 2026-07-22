# Layout Shots — Empty Template Screenshot Generator

**Date:** 2026-07-22
**Status:** Draft
**Author:** Sisyphus

---

## 1. Summary

Generate high-quality 16:9 screenshots of each of the 9 TV layout templates in their **empty/default state** (no menu items, no categories, no add-ons — just the visual design frame). Serve these as static files alongside the admin dashboard, exposing a clean JSON API for the user's mobile app to consume.

---

## 2. Motivation

The user has a mobile app that needs to display TV layout previews (thumbnail + name) so restaurant owners can choose a layout when creating a menu. The existing admin dashboard has a `TVPreview` tab but it requires a full menu with data. There is no standalone way to see what an empty template looks like, nor an API to fetch these images remotely.

---

## 3. Components

### 3.1 `LayoutShotsPage` (admin dashboard React component)

**File:** `admin-dashboard/src/components/LayoutShotsPage.jsx`

A new page that renders **a single layout** at 16:9 aspect ratio with empty/default data. Accepts a `?layout=` query parameter to select which layout to render.

**Props passed to each layout:**
```js
{
  categories: [],
  allAddons: [],
  offline: false,
  menu: { name: 'Menu Name' },
  title: 'Menu Name',
}
```

**Route:** `/layout-shots?layout=classic`

The page contains:
- The layout component at full 16:9 with no surrounding UI
- Hidden (no header, no nav, no padding — pure layout)
- Only renders the requested layout, or defaults to `classic`

**Purpose:** This page is the **render target** for Playwright. It is not meant to be navigated to by humans (though it works if they do). It strips all chrome so the screenshot captures only the layout.

### 3.2 `scripts/generate-layout-shots.js`

**File:** `scripts/generate-layout-shots.js` (repo root)

A Node.js script that:

1. **Starts** the admin-dashboard Vite dev server (spawns `npm run dev` in `admin-dashboard/`)
2. **Waits** for it to be ready (polls `http://localhost:5173`)
3. **Sets** Playwright viewport to 1280×720 (16:9)
4. **For each layout** in the known list (`classic`, `bistro`, `brasserie`, `coffeeShop`, `minimal`, `modern`, `moroccan`, `natureBistro`, `pro`):
   - Opens `http://localhost:5173/?layout={id}` in Playwright (headless Chromium)
   - Waits for animations to settle (e.g. 3s timeout)
   - Takes a 1280×720 JPEG screenshot at quality 0.8
   - Saves to `admin-dashboard/public/layout-shots/{id}.webp` (or `.jpg`)
5. **Generates** `admin-dashboard/public/layout-shots/layouts.json` with the layout index
6. **Shuts down** the Vite dev server
7. **Reports** what was generated

**Dependencies** (dev): `playwright` only. JPEG output at quality 0.8 is sufficient — no extra tools needed.

### 3.3 Static output directory

**Path:** `admin-dashboard/public/layout-shots/`

```
layout-shots/
├── layouts.json          ← API index
├── classic.webp
├── bistro.webp
├── brasserie.webp
├── coffeeShop.webp
├── minimal.webp
├── modern.webp
├── moroccan.webp
├── natureBistro.webp
└── pro.webp
```

This folder is served as static assets by Firebase Hosting (already configured to serve `admin-dashboard/dist/`, and `public/` contents get bundled into `dist/` by Vite).

### 3.4 Package script

**Added to root `package.json`** (or a workspace script):

```json
{
  "scripts": {
    "generate-shots": "node scripts/generate-layout-shots.js"
  }
}
```

---

## 4. API Contract

### Endpoint

```
GET https://restomenu2.web.app/layout-shots/layouts.json
```

### Response

```json
{
  "layouts": [
    {
      "id": "classic",
      "name": "Classic Gold",
      "image": "/layout-shots/classic.webp"
    },
    {
      "id": "bistro",
      "name": "Bistro Chalkboard",
      "image": "/layout-shots/bistro.webp"
    },
    {
      "id": "brasserie",
      "name": "Brasserie",
      "image": "/layout-shots/brasserie.webp"
    },
    {
      "id": "coffeeShop",
      "name": "Coffee Shop",
      "image": "/layout-shots/coffeeShop.webp"
    },
    {
      "id": "minimal",
      "name": "Minimal",
      "image": "/layout-shots/minimal.webp"
    },
    {
      "id": "modern",
      "name": "Modern",
      "image": "/layout-shots/modern.webp"
    },
    {
      "id": "moroccan",
      "name": "Moroccan",
      "image": "/layout-shots/moroccan.webp"
    },
    {
      "id": "natureBistro",
      "name": "Nature Bistro",
      "image": "/layout-shots/natureBistro.webp"
    },
    {
      "id": "pro",
      "name": "Pro Premium",
      "image": "/layout-shots/pro.webp"
    }
  ]
}
```

### Image format

- **Resolution:** 1280×720 (16:9) — sufficient for mobile thumbnails, halves pixel count vs 1080p
- **Format:** WebP — browser-native, excellent compression, ~70-80% smaller than PNG with negligible quality loss
- **Quality target:** Total directory < 1.5MB for all 9 layouts combined
- **Toolchain:** Playwright's `page.screenshot({ type: 'jpeg', quality: 0.8 })` produces JPEG; use a post-processing step with **Sharp** (`npm install -D sharp`) to convert to WebP for optimal file size
- **Alternative (simpler):** Playwright screenshot at 1280×720 as JPEG at quality 0.8 — each file ~100-150KB, total ~1MB — no Sharp dependency needed
- **Note:** Images are URL-absolute from the admin dashboard domain. The mobile app should prefix with the base URL if needed, or read the full URL from `image` (relative to the JSON's origin).

---

## 5. Data Flow

```
User runs: npm run generate-shots
│
├─ scripts/generate-layout-shots.js
│  ├─ Spawns: admin-dashboard dev server (port 5173)
│  ├─ Waits for server ready
│  ├─ Sets viewport to 1280×720
│  ├─ For each of 9 layouts:
│  │   ├─ Playwright → GET /?layout={id}
│  │   ├─ Wait 3s for animations to settle
│  │   └─ Screenshot (JPEG q0.8) → public/layout-shots/{id}.webp (or .jpg)
│  ├─ Write layouts.json
│  └─ Kill dev server
│
└─ Outputs saved to admin-dashboard/public/layout-shots/
   (~100-150KB per image, ~1MB total — committed to git, deployed with firebase deploy)

Mobile app → GET https://restomenu2.web.app/layout-shots/layouts.json
            → displays layout name + image thumbnail
```

---

## 6. Edge Cases & Error Handling

| Scenario | Handling |
|---|---|
| `?layout=` param missing | Default to `classic` |
| `?layout=invalid` | Default to `classic` (via `getLayout()` — already handles this) |
| Playwright not installed | Script checks for playwright, throws clear install instructions |
| Dev server fails to start | Script exits with non-zero code, prints stderr |
| Layout screenshot fails | Script logs error for that layout, continues with remaining |
| No screenshots directory | Script creates it |
| One layout takes too long | Playwright `timeout: 15s` per navigation |
| `public/layout-shots/` already has files | Script overwrites them silently |
| Image file too large | Already mitigated: 1280×720 JPEG q0.8 keeps files ~100-150KB each |

---

## 7. What Changes

| File | Change type | Description |
|---|---|---|
| `admin-dashboard/src/components/LayoutShotsPage.jsx` | **New** | Page that renders a single empty layout at 16:9 |
| `admin-dashboard/src/App.jsx` | **Edit** | At the top, before auth logic: if URL has `?layout=` param, render `LayoutShotsPage` directly (no auth, no chrome). Otherwise proceed with existing auth flow. |
| `scripts/generate-layout-shots.js` | **New** | Playwright screenshot generator |
| `admin-dashboard/public/layout-shots/` | **New dir** | Output directory for generated screenshots + JSON (committed to git, deployed as static assets) |
| `admin-dashboard/package.json` | **Edit** | Add `playwright` devDependency |
| `package.json` (root) | **Edit** | Add `generate-shots` script |

### Route mechanism (important detail)

No React Router needed. In `App.jsx`, the very first check:

```jsx
// Before any auth logic
const params = new URLSearchParams(window.location.search)
if (params.has('layout')) {
  return <LayoutShotsPage layoutKey={params.get('layout')} />
}
```

This renders the layout page bare — no login, no header, no chrome — which is exactly what Playwright needs to capture a clean 16:9 screenshot. The URL `http://localhost:5173/layout-shots?layout=classic` (path is irrelevant, query param triggers it) or equivalently `http://localhost:5173/?layout=classic`.

---

## 8. Out of Scope

- **Not** generating screenshots at deploy time (CI). Too complex for initial version — manual/npm-script approach is fine.
- **Not** modifying the TV layout components themselves (they already work with empty data).
- **Not** adding authentication to the layout-shots endpoint (it's public static content).

---

## 9. Future Considerations

- If layouts are added frequently, the script could be integrated into CI (GitHub Actions) to auto-regenerate on PRs.
- Images could be optimized (WebP, lower resolution thumbnails) if size becomes a concern.
- Could add a UI page in the admin dashboard showing all layout shots in a gallery for manual browsing.
