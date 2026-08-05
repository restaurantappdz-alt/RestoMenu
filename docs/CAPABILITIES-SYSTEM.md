# Capabilities System — Full Documentation

## What It Is

A registry that defines what every layout can display and how many items fit on screen without overflowing. The **single canonical source** is:

- `shared/layouts/capabilities.js` (consumed by the TV app via the `@layouts` Vite alias)

The Flutter admin app receives the same data (as `capabilities` in the Layout Shots API — `tv-display/public/layout-shots/layouts.json`) so its menu editor shows the right fields and limits per layout.

---

## Architecture Overview

```
        shared/layouts/capabilities.js        (canonical)
        ┌─────────────────────────────────────┐
        │  DEFAULT_CAPABILITIES               │
        │  LAYOUT_CAPABILITIES {              │
        │    classic: {...}                   │
        │    bistro: {...}                    │
        │    brasserie: {...}                 │
        │    coffeeShop: {...}                │
        │    minimal: {...}                   │
        │    modern: {...}                    │
        │    moroccan: {...}                  │
        │    natureBistro: {...}              │
        │    pro: {...}                       │
        │    photoMenu: {...}                 │
        │  }                                  │
        │  getLayoutCapabilities()            │
        │  getLayoutOptionalFields()          │
        │  getMaxCategories()                 │
        │  getMaxItems(layoutKey, catCount)   │
        └──────────┬──────────────────────────┘
                   │
      ┌────────────┼──────────────────┐
      ▼            ▼                  ▼
tv-display/    layouts.json       Flutter app
App.jsx        (Layout Shots      MenuEditor (reads
truncate       API) → mobile      capabilities from the
Categories()   layout picker      API to gate fields)
```

Consumers:

1. **tv-display/src/App.jsx** — the actual TV rendering app. Truncates items before rendering (`truncateCategories()` + `getMaxItems()`) so menus never overflow the fixed 1920x1080 canvas.
2. **The Flutter admin app** — fetches `layouts.json` (Layout Shots API), shows layout previews, and reads each layout's `capabilities` to decide which editor fields to show (hero photo, descriptions, tags, max items).

---

## File by File Breakdown

### 1. shared/layouts/capabilities.js

#### DEFAULT_CAPABILITIES (lines 14-30)

Base object that every layout spreads into. Defines defaults for ALL possible fields:

```js
{
  maxItems: null,           // Hard limit override (only photoMenu uses this)
  itemAreaPx: null,         // Pixels available for categories + items
  categoryHeaderPx: null,   // Pixels consumed by one category header
  categoryGapPx: 0,         // Pixels between consecutive category blocks
  rowGapPx: 0,              // CSS grid gap between item rows (for grid layouts)
  itemHeightPx: null,       // Pixels consumed by one item row
  bottomBufferPx: 20,       // Save-guard buffer subtracted from remaining space
  columns: 1,               // Number of item columns (1 or 2)
  supportsDescriptions: false,
  supportsTags: false,
  supportsHeroPhoto: false,
  supportsItemImages: false,
  supportsAddons: false,    // 'sidebar' | 'footer' | false
  supportsCategoryHeaders: true,
  displayMode: 'full-menu', // 'full-menu' | 'single-category'
  hasHeader: true,
  hasFooter: false,
}
```

Each layout overrides only what differs from these defaults using `...DEFAULT_CAPABILITIES`.

#### LAYOUT_CAPABILITIES (lines 32-130)

Object keyed by layout name. Each entry is the complete capability set for that layout. The critical pixel budget fields are:

**Classic**
```
itemAreaPx: 647, categoryHeaderPx: 86, categoryGapPx: 36, itemHeightPx: 63, columns: 1
→ 1 cat = 8 items, 2 cats = 6 items, 3 cats = 4 items
```

**Bistro**
```
itemAreaPx: 756, categoryHeaderPx: 67, categoryGapPx: 48, itemHeightPx: 46, columns: 1
→ 1 cat = 14 items, 2 cats = 12 items, 3 cats = 9 items
```

**Brasserie**
```
itemAreaPx: 735, categoryHeaderPx: 66, categoryGapPx: 35, rowGapPx: 12, itemHeightPx: 42, columns: 2
→ 1 cat = 24 items, 2 cats = 20 items, 3 cats = 16 items
```

**CoffeeShop**
```
itemAreaPx: 632, categoryHeaderPx: 78, categoryGapPx: 38, itemHeightPx: 47, columns: 1
→ 1 cat = 11 items, 2 cats = 8 items, 3 cats = 6 items
```

**Minimal**
```
itemAreaPx: 754, categoryHeaderPx: 58, categoryGapPx: 38, itemHeightPx: 49, columns: 1
→ 1 cat = 13 items, 2 cats = 11 items, 3 cats = 9 items
```

**Modern**
```
itemAreaPx: 746, categoryHeaderPx: 52, categoryGapPx: 29, itemHeightPx: 49, columns: 1
→ 1 cat = 13 items, 2 cats = 12 items, 3 cats = 10 items
```

**Moroccan**
```
itemAreaPx: 692, categoryHeaderPx: 71, categoryGapPx: 29, rowGapPx: 10, itemHeightPx: 75, columns: 2
→ 1 cat = 14 items, 2 cats = 12 items, 3 cats = 8 items
```

**NatureBistro**
```
itemAreaPx: 631, categoryHeaderPx: 54, categoryGapPx: 7, rowGapPx: 4, itemHeightPx: 55, columns: 2
→ 1 cat = 18 items, 2 cats = 16 items, 3 cats = 14 items
```

**Pro**
```
itemAreaPx: 700, categoryHeaderPx: 46, categoryGapPx: 23, rowGapPx: 6, itemHeightPx: 54, columns: 2
→ 1 cat = 20 items, 2 cats = 18 items, 3 cats = 16 items
```

**PhotoMenu**
```
No pixel budgets — hard-coded maxItems: 8 (single-category special case)
No formula applies.
```

#### getLayoutCapabilities() (lines 132-136)

Simple getter. Returns a copy of the capabilities for a layout key. Falls back to defaults + the layout key as name if not found.

#### getLayoutOptionalFields() (lines 138-151)

Returns an array of field definitions for optional data this layout supports (descriptions, tags, heroPhoto, itemImages). Used for dynamic UI rendering.

#### getMaxCategories() (lines 178-195)

Computes how many categories fit in the layout while still leaving room for at least 1 item row.

Formula:
```
Solve: N × headerPx + (N-1) × gapPx + itemHeightPx <= itemAreaPx
  N × (headerPx + gapPx) <= itemAreaPx + gapPx - itemHeightPx
  maxN = floor((itemAreaPx + gapPx - itemHeightPx) / (headerPx + gapPx))
```

Returns `null` if the layout has no pixel budgets, `1` for photoMenu (hard-coded single category).

#### getMaxItems() (current)

THE CORE FUNCTION. Computes how many items fit for a given layout + category count.

Parameters:
- `layoutKey` — string like "classic", "bistro", etc.
- `categoryCount` — number of categories the menu has

Returns:
- `null` if the layout has no pixel budgets (unlimited)
- The hard-coded `maxItems` for photoMenu (8)
- A computed integer for all other layouts

Formula:
```
// Step 1: Calculate category overhead
catGap = categoryGapPx × (categoryCount - 1)
totalCatCost = categoryCount × categoryHeaderPx + catGap

// Step 2: Subtract overhead AND bottom buffer from available space
remaining = itemAreaPx - totalCatCost - bottomBufferPx
if (remaining <= 0) return 0

// Step 3: Account for grid row gap (N rows = N gaps, last row has no gap below)
//   N × itemHeightPx + (N-1) × rowGapPx <= remaining
//   N × (itemHeightPx + rowGapPx) <= remaining + rowGapPx
effectiveRowHeight = itemHeightPx + rowGapPx
rows = floor((remaining + rowGapPx) / effectiveRowHeight)

// Step 4: Multiply by columns
maxItems = rows × columns
```

`rowGapPx` is 0 for single-column layouts (items not in a CSS grid). For grid layouts it accounts for the `gap` between item rows inside the CSS grid.

`bottomBufferPx` (default 20) ensures the last item doesn't press right against the footer/chrome boundary — a visual save-guard.

All values are conservative (rounded DOWN) so items never overflow.

---

### 2. tv-display/src/App.jsx — TV rendering

The TV app uses pixel budgets to truncate items before rendering:

#### Lines 59-62:

```js
const menuCategories = truncateCategories(
  categories,
  getMaxItems(selectedLayout, categories?.length || 0),
)
```

#### truncateCategories() function (lines 5-27):

```js
function truncateCategories(categories, maxItems) {
  if (maxItems == null || !categories.length) return categories

  const totalItems = categories.reduce((sum, c) => sum + (c.items || []).length, 0)
  if (totalItems <= maxItems) return categories

  const result = categories.map((c) => ({ ...c, items: [...(c.items || [])] }))
  let remaining = maxItems

  for (let i = 0; i < result.length; i++) {
    if (remaining <= 0) {
      result[i].items = []
      continue
    }
    const catItems = result[i].items.length
    const share = Math.max(1, Math.round(remaining / (result.length - i)))
    const take = Math.min(catItems, share)
    result[i].items = result[i].items.slice(0, take)
    remaining -= take
  }

  return result
}
```

HOW IT DISTRIBUTES ITEMS ACROSS CATEGORIES:
1. If total items ≤ budget, do nothing (all items fit)
2. Make a copy of categories with their items
3. For each category (in order), calculate a fair share: `round(remaining / (categories.length - i))`
4. Take at most that many items from the category
5. Deduct taken items from remaining budget
6. Distributes fairly — first categories get slightly more (due to `Math.round` + `Math.max(1, ...)`)

This ensures the TV NEVER overflows — even if a menu somehow has more items than the budget allows, the TV only renders what fits.

#### Layout rendering (lines 105-113):

```jsx
<LayoutComponent
  categories={menuCategories}    // ← TRUNCATED
  allAddons={allAddons}
  offline={offline}
  menu={menu}
  title={title}
/>
```

The truncated `menuCategories` is passed to the layout component. The layout component never sees the extra items.

---

### 3. tv-display/public/layout-shots/layouts.json — the mobile contract

Each entry carries the capabilities the Flutter app needs to adapt its editor:

```json
{
  "id": "classic",
  "name": "Classic Gold",
  "image": "/RestoMenu/layout-shots/classic.jpg",
  "capabilities": {
    "heroPhoto": false,
    "descriptions": false,
    "tags": false,
    "itemImages": false,
    "allergyNote": false,
    "pricingNote": false,
    "maxItems": 8
  }
}
```

Note: the `maxItems` values in `layouts.json` are picker-oriented marketing values and can differ from the runtime pixel-budget math in `capabilities.js` (e.g. photoMenu is hard-coded to 8 in both).

---

## Data Flow Summary

```
Owner edits menu in the Flutter app (MenuEditor)
  │
  ▼
Flutter editor reads capabilities from layouts.json
  → shows/hides fields (hero photo, descriptions, tags) per layout
  → enforces item/category limits in the UI
  │
  ▼
Menu saved to Firestore (categories[].items[], selectedLayout)
  │
  ▼
TV display reads from Firestore
  │
  ▼
App.jsx calls getMaxItems(layoutKey, catCount)
  → calls truncateCategories() with that number
  → if items exceed budget, slices them proportionally
  → passes truncated data to layout component
    │
    ▼
  Layout renders only what fits on screen
```

There are THREE layers of enforcement:
1. **Flutter editor UI** — blocks additions beyond the layout's item/category limits
2. **TV truncation** — App.jsx truncates items before rendering (never overflows)
3. **Pixel-budget math** — all values conservative (rounded down)

---

## How the Pixel Budgets Were Traced

All values computed at 1920×1080:
- `1vw = 19.2px`
- `1rem = 16px`
- Default `line-height = 1.2` unless overridden

For each layout, the trace was:

1. **Outer padding**: Read the wrapper `padding` clamp, resolve at 1920, double (top+bottom)
2. **Header**: Sum every fixed-chrome element in the `flex: none` header block — GoldDiamondLine height, spacers, h1 font-size × line-height, tagline margin-top + font-size × line-height, GoldDivider height, decorations
3. **Footer**: marginTop + borderTop + paddingTop + businessHours font-size × line-height
4. **Item area**: `1080 - outerPadding - header - contentMarginTop - footer`
5. **Category header**: h2 font-size × line-height + paddingBottom + borderBottom + marginBottom
6. **Category gap**: gap property between category wrappers in the flex column
7. **Row gap**: For grid layouts, the `gap` property of the items grid container (becomes `rowGapPx`)
8. **Item row**: tallest element (name/price/image/emoji) + paddingTop + paddingBottom + borderBottom
9. **Columns**: gridTemplateColumns when items > threshold
10. **Bottom buffer**: `bottomBufferPx: 20` — subtracted in `getMaxItems()` to prevent visual crowding at the bottom edge

All values rounded DOWN to keep them conservative.

---

## Adding a New Layout

To add a new layout to the system:

1. Create the layout component in `shared/layouts/` (JSX with all CSS clamp values, 1920x1080 root, `pixelShift` burn-in animation, portrait adaptation block)
2. Register it in `shared/layouts/index.js` (the registry auto-generates `layoutOptions` for the picker)
3. Add its entry to `LAYOUT_CAPABILITIES` in `shared/layouts/capabilities.js`
4. Trace the pixel budgets at 1920×1080 using the method above
5. Generate a screenshot and add the entry to `tv-display/public/layout-shots/layouts.json` (the Flutter app picks it up automatically — no mobile code changes needed)
6. Make it available to restaurants (add to `availableLayouts` in Firestore, or to the defaults in the Flutter app)
