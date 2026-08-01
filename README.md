# RestoMenu

Digital TV menu display.

## Project Structure

```
restomenu-web/
├── tv-display/        # React TV display app (public-facing, deploys to GitHub Pages)
│   ├── src/
│   │   ├── layouts/        # Layout components
│   │   └── App.jsx         # Resolves layout via getLayout(selectedLayout)
│   └── public/
│       ├── layout-shots/   # Generated layout previews + layouts.json (Layout Shots API)
│       └── layouts.json    # Layout list
├── shared/layouts/    # Canonical layout source (Vite alias @layouts for tv-display)
└── README.md
```

---

> **Note:** The subscription-guard feature (TV-side expiration enforcement with RTDB clock offset) is implemented in `tv-display/src/subscriptionGuard.js`. The UI to set `expiresAt` on the Firestore `config/display` document is **not yet built** — without it the TV will always show a black screen (`no_expiration`). See [subscription guard design doc](docs/superpowers/specs/2026-07-29-subscription-guard-design.md) for the full spec.

---

## Layout Shots API

Static endpoint that serves 1280x720 preview images of each empty layout template. Your mobile app fetches this to show users what each layout looks like before selecting it.

### Endpoint

```
GET https://restaurantappdz-alt.github.io/RestoMenu/layout-shots/layouts.json
```

Returns all 10 layouts with name + image URL + capabilities:

```json
{
  "layouts": [
    { "id": "classic",  "name": "Classic Gold",     "image": "/RestoMenu/layout-shots/classic.jpg" },
    { "id": "bistro",   "name": "Bistro Chalkboard", "image": "/RestoMenu/layout-shots/bistro.jpg" },
    { "id": "brasserie","name": "Brasserie",          "image": "/RestoMenu/layout-shots/brasserie.jpg" },
    { "id": "coffeeShop","name": "Coffee Shop",       "image": "/RestoMenu/layout-shots/coffeeShop.jpg" },
    { "id": "minimal",  "name": "Minimal",            "image": "/RestoMenu/layout-shots/minimal.jpg" },
    { "id": "modern",   "name": "Modern",             "image": "/RestoMenu/layout-shots/modern.jpg" },
    { "id": "moroccan", "name": "Moroccan",           "image": "/RestoMenu/layout-shots/moroccan.jpg" },
    { "id": "natureBistro","name": "Nature Bistro",   "image": "/RestoMenu/layout-shots/natureBistro.jpg" },
    { "id": "pro",      "name": "Pro Premium",        "image": "/RestoMenu/layout-shots/pro.jpg" },
    { "id": "photoMenu","name": "Photo Menu",         "image": "/RestoMenu/layout-shots/photoMenu.jpg" }
  ]
}
```

**Mobile app usage:** fetch JSON, display `name` + load image from `https://restaurantappdz-alt.github.io/RestoMenu` + `image` field. When user selects a layout, send the `id` as `selectedLayout` to your menu creation/update API.

The shots are served from `tv-display/public/layout-shots/` — they ship with the TV display app on every deploy, so the endpoint is always available at the base URL.

### Preview a layout in browser

```
http://localhost:5173/?layout=classic
http://localhost:5173/?layout=bistro
http://localhost:5173/?layout=moroccan
```

### Deploy

The TV display app deploys via GitHub Actions on push to `main`:

```bash
git push origin main
```

Or trigger manually: **GitHub > Actions > Deploy to GitHub Pages > Run workflow**.

The workflow builds `tv-display/` and deploys the output to GitHub Pages.

---

## How Layouts Work (Full Architecture)

Each layout is a React component that renders the menu at 1920x1080 (TV resolution). The canonical layout source lives in `shared/layouts/` and is consumed by the TV display app via the `@layouts` Vite alias.

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

`shared/layouts/index.js` is the single registry. It exports:

- `layouts` -- object mapping `id -> { name, component }`
- `layoutOptions` -- auto-generated array `[{ value, label }]` for the admin picker
- `getLayout(key)` -- returns component, falls back to `LayoutClassic`

### Layout availability

Restaurants have an `availableLayouts` field (array of layout IDs in Firestore). Only 5 layouts are enabled by default for new restaurants:

```
['classic', 'bistro', 'moroccan', 'pro', 'natureBistro']
```

To add more, edit the `availableLayouts` field directly in Firestore for existing restaurants.

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

### Step 1: Create the layout component

File: `shared/layouts/LayoutYourName.jsx`

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

### Step 2: Register in the registry

Edit `shared/layouts/index.js`:

```js
import LayoutYourName from './LayoutYourName'

export const layouts = {
  // ... existing entries ...
  yourName: { name: 'Your Layout Name', component: LayoutYourName },
}
```

The registry auto-generates `layoutOptions` from the `layouts` object -- no separate array to update.

### Step 3: Add phone portrait adaptation

Add a root class (e.g. `layout-yourname-root`) to the component's wrapper and a scoped `@media (orientation: portrait)` block that unlocks vertical scrolling and stacks columns. Follow the pattern in any existing layout.

### Step 4: Make available to restaurants

By default only 5 layouts are enabled. For existing restaurants, update `availableLayouts` directly in Firestore.

### Step 5: Generate screenshots

Screenshots are generated with the layout shots tooling (see the Layout Shots API section). Save the JPGs and add the entry to `tv-display/public/layout-shots/layouts.json` so the mobile app picks it up.

### Step 6: Preview locally

- **Screenshot preview:** `http://localhost:5174/?layout=yourName` (shows empty template)
- **TV display:** Change `selectedLayout` in Firestore to `"yourName"` and load the TV URL

### Step 7: Build and deploy

```bash
cd tv-display
npm run build    # verify it compiles

git add -A
git commit -m "feat: add YourName layout"
git push origin main
```

The GitHub Actions workflow builds the TV display app and deploys.

### Step 8: Update mobile app

The new layout appears automatically in `layouts.json` -- the mobile app just fetches the updated JSON. No code changes needed on the mobile side.

---

## File checklist for adding a layout

| # | File | Action |
|---|------|--------|
| 1 | `shared/layouts/LayoutYourName.jsx` | Create |
| 2 | `shared/layouts/index.js` | Add import + registry entry |
| 3 | `tv-display/public/layout-shots/layouts.json` | Add entry + JPG |
