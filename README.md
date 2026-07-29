# RestoMenu

Digital TV menu display + admin dashboard.

## Project Structure

```
restomenu-web/
├── admin-dashboard/   # React admin app (shadcn/ui, Firebase Auth)
│   ├── scripts/       # Build-time scripts (layout shots generator)
│   ├── src/
│   │   ├── layouts/        # Layout components (identical copies to tv-display)
│   │   ├── components/
│   │   │   ├── LayoutPicker.jsx    # Visual layout selector with thumbnails
│   │   │   ├── MenuEditor.jsx      # Menu editor with layout picker + preview
│   │   │   ├── LayoutShotsPage.jsx # Screenshot-generator page (?layout= param)
│   │   │   └── TVPreview.jsx       # Live TV preview in admin
│   │   └── api.js                  # Firestore API (availableLayouts, selectedLayout)
│   └── public/layout-shots/  # Generated layout previews (committed to git)
├── tv-display/        # React TV display app (public-facing)
│   └── src/
│       ├── layouts/        # Layout components (identical copies to admin-dashboard)
│       └── App.jsx         # Resolves layout via getLayout(selectedLayout)
└── README.md
```

---

> **Note:** The subscription-guard feature (TV-side expiration enforcement with RTDB clock offset) is implemented in `tv-display/src/subscriptionGuard.js`. The admin-dashboard UI to set `expiresAt` on the Firestore `config/display` document is **not yet built** — without it the TV will always show a black screen (`no_expiration`). See [subscription guard design doc](docs/superpowers/specs/2026-07-29-subscription-guard-design.md) for the full spec.

---

## Layout Shots API

Static endpoint that serves 1280x720 preview images of each empty layout template. Your mobile app fetches this to show users what each layout looks like before selecting it.

### Endpoint

```
GET https://restaurantappdz-alt.github.io/RestoMenu/dashboard/layout-shots/layouts.json
```

Returns all 9 layouts with name + image URL:

```json
{
  "layouts": [
    { "id": "classic",  "name": "Classic Gold",     "image": "/RestoMenu/dashboard/layout-shots/classic.jpg" },
    { "id": "bistro",   "name": "Bistro Chalkboard", "image": "/RestoMenu/dashboard/layout-shots/bistro.jpg" },
    { "id": "brasserie","name": "Brasserie",          "image": "/RestoMenu/dashboard/layout-shots/brasserie.jpg" },
    { "id": "coffeeShop","name": "Coffee Shop",       "image": "/RestoMenu/dashboard/layout-shots/coffeeShop.jpg" },
    { "id": "minimal",  "name": "Minimal",            "image": "/RestoMenu/dashboard/layout-shots/minimal.jpg" },
    { "id": "modern",   "name": "Modern",             "image": "/RestoMenu/dashboard/layout-shots/modern.jpg" },
    { "id": "moroccan", "name": "Moroccan",           "image": "/RestoMenu/dashboard/layout-shots/moroccan.jpg" },
    { "id": "natureBistro","name": "Nature Bistro",   "image": "/RestoMenu/dashboard/layout-shots/natureBistro.jpg" },
    { "id": "pro",      "name": "Pro Premium",        "image": "/RestoMenu/dashboard/layout-shots/pro.jpg" }
  ]
}
```

**Mobile app usage:** fetch JSON, display `name` + load image from `https://restaurantappdz-alt.github.io/RestoMenu` + `image` field. When user selects a layout, send the `id` as `selectedLayout` to your menu creation/update API.

### How screenshots are generated

1. `LayoutShotsPage` (`admin-dashboard/src/components/LayoutShotsPage.jsx`) renders a single layout at 16:9 with empty categories, activated via `?layout=classic` URL param -- no auth, no Firebase, no admin chrome.
2. A Playwright script (`admin-dashboard/scripts/generate-layout-shots.mjs`) starts the Vite dev server, visits each layout URL, and screenshots at 1280x720 JPEG quality 80.
3. Screenshots + `layouts.json` are saved to `admin-dashboard/public/layout-shots/` which Vite bundles into `dist/` on build.

**Base URL:** `https://restaurantappdz-alt.github.io/RestoMenu`

### Generate screenshots

```bash
cd admin-dashboard
npm run generate-shots
```

**Prerequisites** (install once):
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

### Deploy

Both apps deploy together via GitHub Actions on push to `main`:

```bash
git push origin main
```

Or trigger manually: **GitHub > Actions > Deploy to GitHub Pages > Run workflow**.

The workflow:
1. Builds `tv-display/` -> outputs to artifact root
2. Builds `admin-dashboard/` -> outputs to `dashboard/` subfolder
3. Combines into one artifact and deploys to GitHub Pages

---

## How Layouts Work (Full Architecture)

Each layout is a React component that renders the menu at 1920x1080 (TV resolution). Layouts exist in **two identical copies** -- one in `tv-display/` and one in `admin-dashboard/`.

### Component contract

Every layout component receives the same props:

| Prop | Type | Description |
|------|------|-------------|
| `categories` | `Array<{ name, items, addons? }>` | Menu categories with items |
| `allAddons` | `Array<{ name, price }>` | Global add-ons (e.g. fries barquette) |
| `offline` | `boolean` | Currently unused in most layouts |
| `menu` | `object` | Menu metadata (`name`, `tagline`, `businessHours`, `currency`) |
| `title` | `string` | Menu display name (falls back to `menu.name`) |

### Data flow

```
Admin picks layout in MenuEditor
  -> selectedLayout stored in Firestore (menu document)
  -> TV display reads menu document via useMenuData()
  -> App.jsx resolves layout via getLayout(selectedLayout)
  -> Renders LayoutComponent with categories + addons + menu data
```

### The registry (layouts/index.js)

Both `tv-display/src/layouts/index.js` and `admin-dashboard/src/layouts/index.js` are identical. Each exports:

- `layouts` -- object mapping `id -> { name, component }`
- `layoutOptions` -- auto-generated array `[{ value, label }]` for the admin picker
- `getLayout(key)` -- returns component, falls back to `LayoutClassic`

### LayoutPicker visual config

Each layout needs a visual entry in `LAYOUT_VISUALS` (`admin-dashboard/src/components/LayoutPicker.jsx`):

```js
yourName: {
  gradient: 'from-indigo-950/50 to-purple-900/30',  // Tailwind gradient for thumbnail
  border: 'border-indigo-800/40',                     // border color
  selectedBorder: 'ring-2 ring-indigo-500',           // ring when selected
  bg: 'bg-indigo-950/30',                             // background
  icon: 'Diamond',                                    // small icon character
  label: 'Your Layout Name',                          // display name
}
```

### Layout availability

Restaurants have an `availableLayouts` field (array of layout IDs in Firestore). Only 5 layouts are enabled by default for new restaurants:

```
['classic', 'bistro', 'moroccan', 'pro', 'natureBistro']
```

To add more, update:
- `admin-dashboard/src/api.js` -- `createRestaurant()` default `availableLayouts` array
- Existing restaurants -- edit the `availableLayouts` field directly in Firestore

### Existing layouts reference

| ID | Name | Visual style |
|----|------|-------------|
| `classic` | Classic Gold | Dark BG, gold/orange accents, wavy frame, cutlery pattern, brush-stroke underlines, sketchy dotted connectors |
| `bistro` | Bistro Chalkboard | Dark green, monospace font, dashed chalk borders, gold accents, dotted connectors |
| `brasserie` | Brasserie | Warm beige/cream, serif font, gold lines, dotted connectors, noise texture overlay |
| `coffeeShop` | Coffee Shop | Dark radial gradient, Playfair Display serif, gold lines, menu/price columns |
| `minimal` | Minimal | White/off-white, Inter sans-serif, green accents, clean grid, round mascot frame |
| `modern` | Modern | Pure white, gold top bar + circle accents, Inter sans-serif, uppercase, clean lines |
| `moroccan` | Moroccan | Teal/emerald gradient, diamond/gold ornaments, Cormorant Garamond serif, item cards |
| `natureBistro` | Nature Bistro | Cream/beige, plant overlays, glassmorphism card, leaf separators, green accents |
| `pro` | Pro Premium | Dark leather, gold dot grid, corner ornaments, Playfair Display serif, gold shimmer |

---

## Adding a New Layout -- Step-by-Step Guide

### Step 1: Create the layout component (tv-display)

File: `tv-display/src/layouts/LayoutYourName.jsx`

```jsx
export default function LayoutYourName({ categories, allAddons, offline, menu, title }) {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Your 1920x1080 design here */}
      {/* See LayoutMinimal.jsx for a clean starting template */}
    </div>
  )
}
```

**Rules for layout components:**

- Must render at 1920x1080 (use `h-full w-full overflow-hidden` on the root div)
- Use `clamp()` for all font sizes and spacing (TVs vary from 720p to 4K)
- Import fonts via `@import url(...)` inside a `<style>` tag (no npm packages)
- Handle empty state: `categories.length === 0` -> show "No items yet"
- Handle `allAddons` rendering (either in sidebar or footer)
- Use `menu?.currency || 'MAD'` for currency symbol
- Use `menu?.tagline`, `menu?.businessHours` with fallback strings
- Add pixel-shift animation (`pixelShift 300s linear infinite`) on the wrapper to prevent OLED burn-in
- Add staggered animation delays for items (`animation-delay: ${j * 0.1}s`)

### Step 2: Create the matching admin-dashboard version

Copy your component to `admin-dashboard/src/layouts/LayoutYourName.jsx`.

**Must be identical** -- it is used for the admin preview tab AND the screenshot generator.

### Step 3: Register in both registry files

Edit **both**:
- `tv-display/src/layouts/index.js`
- `admin-dashboard/src/layouts/index.js`

```js
import LayoutYourName from './LayoutYourName'

export const layouts = {
  // ... existing entries ...
  yourName: { name: 'Your Layout Name', component: LayoutYourName },
}
```

The registry auto-generates `layoutOptions` from the `layouts` object -- no separate array to update.

### Step 4: Add LayoutPicker visuals

File: `admin-dashboard/src/components/LayoutPicker.jsx`

Add a new entry in the `LAYOUT_VISUALS` object:

```js
yourName: {
  gradient: 'from-indigo-950/50 to-purple-900/30',
  border: 'border-indigo-800/40',
  selectedBorder: 'ring-2 ring-indigo-500',
  bg: 'bg-indigo-950/30',
  icon: '<>',
  label: 'Your Layout Name',
},
```

### Step 5: Add to MenuEditor options

File: `admin-dashboard/src/components/MenuEditor.jsx`

Add to the `LAYOUT_OPTIONS` array:

```js
{ value: 'yourName', label: 'Your Layout Name' },
```

### Step 6: Add to screenshot generator

File: `admin-dashboard/scripts/generate-layout-shots.mjs`

Add to the `layouts` array:

```js
{ id: 'yourName', name: 'Your Layout Name' },
```

### Step 7: Make available to restaurants

By default only 5 layouts are enabled. To enable your new layout for all new restaurants:

File: `admin-dashboard/src/api.js`

```js
availableLayouts: ['classic', 'bistro', 'moroccan', 'pro', 'natureBistro', 'yourName'],
```

For existing restaurants, update `availableLayouts` directly in Firestore.

### Step 8: Generate screenshots

```bash
cd admin-dashboard
npm run generate-shots
```

Verify the new JPG appears in `admin-dashboard/public/layout-shots/` and `layouts.json` includes the new entry.

### Step 9: Preview locally

- **Screenshot preview:** `http://localhost:5173/?layout=yourName` (shows empty template)
- **Admin preview:** Open admin dashboard > edit a menu > go to "Preview" tab
- **TV display:** Change `selectedLayout` in Firestore to `"yourName"` and load the TV URL

### Step 10: Build and deploy

```bash
cd admin-dashboard
npm run build    # verify it compiles

cd tv-display
npm run build    # verify it compiles

git add -A
git commit -m "feat: add YourName layout"
git push origin main
```

The GitHub Actions workflow automatically builds both apps and deploys.

### Step 11: Update mobile app

The new layout appears automatically in `layouts.json` -- the mobile app just fetches the updated JSON. No code changes needed on the mobile side.

---

## File checklist for adding a layout

| # | File | Action |
|---|------|--------|
| 1 | `tv-display/src/layouts/LayoutYourName.jsx` | Create |
| 2 | `admin-dashboard/src/layouts/LayoutYourName.jsx` | Create (identical copy) |
| 3 | `tv-display/src/layouts/index.js` | Add import + registry entry |
| 4 | `admin-dashboard/src/layouts/index.js` | Add import + registry entry |
| 5 | `admin-dashboard/src/components/LayoutPicker.jsx` | Add LAYOUT_VISUALS entry |
| 6 | `admin-dashboard/src/components/MenuEditor.jsx` | Add LAYOUT_OPTIONS entry |
| 7 | `admin-dashboard/scripts/generate-layout-shots.mjs` | Add to layouts array |
| 8 | `admin-dashboard/src/api.js` (optional) | Add to availableLayouts default |
