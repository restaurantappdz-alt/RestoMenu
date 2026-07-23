# Photo Menu Layout — Design Spec

**Date**: 2026-07-23
**Status**: Draft
**Scope**: TV Display + API only (no admin dashboard changes)

---

## 1. Overview

Add a new TV layout called "Photo Menu" that displays menu items with descriptions, tags, and an optional hero photo. Introduces a **layout capability system** so future layouts can declare what data they support without requiring admin dashboard changes.

### Source Design

Based on Figma export: `C:\Users\LAPWIZ\Downloads\TV Digital Menu Board\`

---

## 2. Design Reference

The target layout has three sections:

### Header
- Left: Restaurant name (Playfair Display bold) + tagline (Barlow, uppercase, tracking)
- Center: "Now Serving" label + current category name

### Main Grid (58% / 42% split)
**Left — Menu List:**
- Each item shows: name (Playfair Display), optional tag badge, price (gold), description (Barlow, muted)
- Items separated by thin border lines
- Tags like "Best Seller", "Chef's Pick", "Spicy" shown as small gold-bordered badges

**Right — Hero Photo Card:**
- Full-bleed photo with cinematic gradient overlay (bottom-heavy)
- Overlaid text: chef icon + label, dish name, gold rule, description, price, star rating
- Fallback when no photo: decorative corner brackets + "Tonight's Special" card

### Footer
- Business hours + allergy note + pricing note, centered, separated by dots

### Theme
- Background: `#0c0b09` (near-black)
- Foreground: `#f0ead8` (warm cream)
- Accent: `#c8902a` (warm gold)
- Border: `rgba(240, 234, 216, 0.08)`
- Fonts: Playfair Display (headings) + Barlow (body)

---

## 3. Layout Capability System

### Purpose

Allow each layout to declare what data it supports. The data model stays flexible — items have optional fields, layouts read what's available.

### Capability Declaration

Each layout component exports a `capabilities` object:

```js
export const capabilities = {
  maxItems: 8,
  supportsDescriptions: true,
  supportsTags: true,
  supportsHeroPhoto: true,
  supportsAddons: 'footer',  // 'sidebar' | 'footer' | false
  minItemsRequired: 0,
}
```

### How It Works

1. **Capabilities are metadata** — exported from each layout for documentation and future admin UI. The layout component itself reads data directly, not through capabilities at runtime.
2. **Data model stays minimal** — `{ name, price }` always works
3. **Optional fields** are used when present:
   - `description` → shown if field exists on item
   - `tag` → shown if field exists on item
   - `heroImageUrl` → shown if field exists on menu
4. **Graceful degradation** — layout works with minimal or rich data

### Future Layouts

When adding a new layout:
1. Create the component
2. Export `capabilities` declaring what it supports
3. The data model doesn't change — optional fields are optional
4. Admin dashboard stays untouched

---

## 4. Data Model Changes

### Menu Document (extends existing)

```js
{
  name: "Sandwich N'delda",
  categories: [...],           // existing
  selectedLayout: "photoMenu", // existing
  createdAt: timestamp,        // existing

  // NEW — optional hero fields (used by PhotoMenu layout)
  heroImageUrl: "https://...", // URL to hero dish photo
  heroName: "Wagyu Burger",   // hero dish name (falls back to menu.name)
  heroDescription: "...",     // hero dish description
  heroLabel: "Chef's Recommendation", // small label above hero name

  // NEW — optional menu metadata (used by PhotoMenu footer)
  allergyNote: "Please inform your server...",
  pricingNote: "All prices include taxes.",
}
```

### Item Object (extends existing)

```js
{
  name: "Poulet Haché",     // required — always present
  price: 400,               // required — always present

  // NEW — optional fields (layout reads if present)
  description: "Grilled chicken...",  // shown by PhotoMenu, ignored by others
  tag: "Best Seller",                 // shown by PhotoMenu, ignored by others
}
```

### Backward Compatibility

- **Existing menus** continue to work — all new fields are optional
- **Existing layouts** ignore the new fields — they only read `name` and `price`
- **PhotoMenu layout** reads new fields if present, falls back gracefully if not

---

## 5. Layout Component: `LayoutPhotoMenu.jsx`

### Props (same as all layouts)

```js
{ categories, allAddons, offline, menu, title }
```

### Rendering Logic

1. **Header**: Uses `menu.name` (or `title`), `menu.tagline`, `menu.businessHours`
2. **Category display**: Flattens all categories into a single list. Each category appears as a section header (gold text, uppercase) followed by its items. "Now Serving" in header shows the first category name.
3. **Menu list**: Iterates all items across all categories, shows name/price/description/tag. Category headers separate groups.
4. **Hero card**: Uses `menu.heroImageUrl` if present, otherwise shows fallback
5. **Footer**: Uses `menu.businessHours`, `menu.allergyNote`, `menu.pricingNote`

### Fallbacks

| Field | Missing Value | Fallback |
|-------|---------------|----------|
| `heroImageUrl` | Not provided | "Tonight's Special" decorative card |
| `heroName` | Not provided | `menu.name` or `title` |
| `heroDescription` | Not provided | Empty (card shows name + price only) |
| `item.description` | Not provided | Description line hidden |
| `item.tag` | Not provided | Badge hidden |
| `menu.businessHours` | Not provided | "Open Daily" |
| `menu.allergyNote` | Not provided | Hidden |
| `menu.pricingNote` | Not provided | Hidden |
| `categories` is empty | No items | "No items yet" message |

### Fonts

Loaded via `@import url(...)` in `<style>` tag (existing pattern):
- Playfair Display: `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap')`
- Barlow: `@import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap')`

### Animations

Follow existing layout patterns:
- `pixelShift 300s linear infinite` on wrapper (OLED burn-in prevention)
- Staggered `animation-delay` on items: `${j * 0.1}s`
- Entry animations: `fadeInUp`, `popIn` (match existing keyframes)

---

## 6. Files to Create/Modify

### Create

| File | Description |
|------|-------------|
| `tv-display/src/layouts/LayoutPhotoMenu.jsx` | TV layout component (all styles inline via Tailwind + `<style>` tag, matching existing layout pattern) |

### Modify

| File | Change |
|------|--------|
| `tv-display/src/layouts/index.js` | Add import + registry entry |
| `tv-display/src/hooks/useMenuData.js` | Pass new optional fields through |
| `tv-display/src/App.jsx` | No changes needed (already passes `menu` prop) |

### NOT Modified

| File | Reason |
|------|--------|
| `admin-dashboard/**` | User requirement — no admin changes |
| `admin-dashboard/src/layouts/index.js` | Not needed (admin doesn't use this layout yet) |
| `admin-dashboard/src/api.js` | Data model is backward compatible |

---

## 7. Registry Entry

In `tv-display/src/layouts/index.js`:

```js
import LayoutPhotoMenu from './LayoutPhotoMenu'

export const layouts = {
  // ... existing entries ...
  photoMenu: { name: 'Photo Menu', component: LayoutPhotoMenu },
}
```

---

## 8. LayoutPicker Visual (for future admin integration)

```js
photoMenu: {
  gradient: 'from-amber-950/50 to-stone-900/30',
  border: 'border-amber-800/40',
  selectedBorder: 'ring-2 ring-amber-500',
  bg: 'bg-amber-950/30',
  icon: '📸',
  label: 'Photo Menu',
},
```

Note: This is NOT added to the admin dashboard now. Saved for future use.

---

## 9. Testing

### Manual Test Cases

1. **Minimal data** — Menu with only `{ name, price }` items → layout shows names + prices, no descriptions/tags
2. **Rich data** — Items with descriptions + tags → layout shows full detail
3. **Hero photo** — `heroImageUrl` provided → shows hero card with gradient overlay
4. **No hero photo** — `heroImageUrl` missing → shows "Tonight's Special" fallback
5. **Empty categories** — No items → shows "No items yet"
6. **Multiple categories** — Shows first category in header, list items below
7. **Offline mode** — Shows cached menu with "Offline" badge
8. **Long text** — Descriptions truncate gracefully, no overflow

### Build Verification

```bash
cd tv-display && npm run build  # Must compile without errors
```

---

## 10. Future Enhancements (Out of Scope)

- Admin dashboard UI for editing descriptions, tags, hero photos
- Per-item photos (not just hero)
- Layout capability picker in admin (shows which layouts support which features)
- Mobile app integration with `layouts.json` capabilities endpoint

---

## 11. Success Criteria

- [ ] `LayoutPhotoMenu.jsx` renders correctly at 1920×1080
- [ ] Works with minimal data (`{ name, price }` only)
- [ ] Works with rich data (descriptions, tags, hero photo)
- [ ] Fallback card shows when no hero photo
- [ ] Fonts load correctly (Playfair Display + Barlow)
- [ ] OLED burn-in animation present
- [ ] Build passes (`npm run build`)
- [ ] No admin dashboard files modified
