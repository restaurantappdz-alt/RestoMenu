# Capabilities System — Full Documentation

## What It Is

A registry that defines what every layout can display and how many items fit on screen without overflowing. Lives in two identical copies:

- `admin-dashboard/src/layouts/capabilities.js`
- `tv-display/src/layouts/capabilities.js`

Both are committed and pushed to `main`.

---

## Architecture Overview

```
                    capabilities.js
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
              ┌────────────────┼──────────────────┐
              ▼                ▼                  ▼
    admin-dashboard/      tv-display/         Any other
    MenuEditor.jsx        App.jsx             consumer
    CategorySection.jsx   truncateCategories()
    api.js (updateMenu)
```

---

## File by File Breakdown

### 1. admin-dashboard/src/layouts/capabilities.js

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

Used in `MenuEditor.jsx` at lines 37, 73, 95 to block adding categories beyond what fits.

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

### 2. admin-dashboard/src/api.js

#### updateMenu() (lines 70-86) — API-LAYER BUDGET VALIDATION

This is the Firestore write function. It NOW has server-side (client SDK) validation:

```js
export async function updateMenu(restaurantId, id, data) {
  // Budget validation — only checked when both categories and selectedLayout are present
  if (data.categories != null && data.selectedLayout != null) {
    const catArr = data.categories
    const budget = getMaxItems(data.selectedLayout, catArr.length)
    if (budget != null) {
      const totalItems = catArr.reduce((sum, c) => sum + (c.items || []).length, 0)
      if (totalItems > budget) {
        throw new Error(`Item budget exceeded for layout "${data.selectedLayout}": ${totalItems} items, max ${budget}`)
      }
    }
  }
  await updateDoc(doc(db, 'restaurants', restaurantId, 'menus', id), data)
}
```

WHAT THIS DOES:
1. Checks if `data.categories` AND `data.selectedLayout` are both present in the update
2. Calls `getMaxItems(selectedLayout, categories.length)` to get the budget
3. Counts total items across all categories
4. If total exceeds budget, THROWS an error — the write NEVER happens
5. If budget is null (unlimited), or only one field is present, skip validation

This is a BACKUP guard. The primary enforcement is in the UI (MenuEditor.jsx) which blocks the user before they can even attempt the save. But if someone bypasses the UI (e.g. Firestore console, API call), this catches it.

**Imported at line 18:**
```js
import { getMaxItems } from './layouts/capabilities'
```

**Other functions in api.js are unrelated to budgets:**
- `createMenu()` — creates empty menu with classic layout
- `deleteMenu()` — deletes menu document
- `onMenusSnapshot()` — real-time listener for menu list
- `getMenu()` — one-time read of a menu
- `onMenuSnapshot()` — real-time listener for single menu
- `setActiveMenu()` — sets which menu is displayed on TV
- `assignMenuToScreen()` / `clearScreen()` — screen management
- `addScreen()` / `removeScreen()` — screen CRUD
- `seedDefaultMenu()` — creates a demo menu with 5 sandwich items

---

### 3. admin-dashboard/src/components/MenuEditor.jsx

The admin panel where users edit their menu. Uses pixel budgets in THREE places:

#### Computed values at render (lines 34-37):

```js
const dynamicMax = getMaxItems(selectedLayout, categories.length)
const categoryItemsCounts = categories.map((c) => (c.items || []).length)
const totalItemCount = categoryItemsCounts.reduce((sum, count) => sum + count, 0)
const maxCategories = getMaxCategories(selectedLayout)
```

These recalculate on every render — when categories change, the budget updates automatically.

#### Save guard (lines 67-92):

```js
const save = async (newCategories) => {
  const cats = newCategories || categories
  const oldTotal = categories.reduce((sum, c) => sum + (c.items || []).length, 0)
  const newTotal = cats.reduce((sum, c) => sum + (c.items || []).length, 0)

  // Block category additions beyond budget — allow restructures even when over budget
  if (maxCategories != null && cats.length > maxCategories && cats.length > categories.length) {
    toast.error(`Maximum categories reached for this layout (${maxCategories})`)
    return
  }

  // Block item additions beyond budget — allow edits/deletes even when over budget
  if (dynamicMax != null && newTotal > dynamicMax && newTotal > oldTotal) {
    toast.error(`Maximum items reached for this layout (${dynamicMax})`)
    return
  }

  // Proceed with save
  setSaving(true)
  try {
    await updateMenu(restaurantId, menu.id, { name: menuName, categories: cats, selectedLayout })
  } catch (e) {
    toast.error('Failed to save: ' + e.message)
  } finally {
    setSaving(false)
  }
}
```

KEY DESIGN DECISIONS:
- Only blocks INCREASES (newTotal > oldTotal) — allows edits/deletes even when over budget
- This handles pre-existing menus that exceed the budget (created before budgets existed)
- Blocks both category COUNT increases AND item count increases
- Shows toast message explaining the limit

#### Add Category button guard (lines 94-104):

```js
const addCategory = () => {
  if (maxCategories != null && categories.length >= maxCategories) {
    toast.error(`Maximum categories reached for this layout (${maxCategories})`)
    return
  }
  // ... create and save new category
}
```

#### UI indicator (lines 166-170, 188-191):

Shows `{totalItemCount}/{dynamicMax} items` counter in the display settings section AND in the categories header. Lets the user see how close they are to the limit.

#### Other props passed to CategorySection (lines 214-215):

```js
categoryItemsCounts={categoryItemsCounts}
layoutMaxItems={dynamicMax}
```

---

### 4. admin-dashboard/src/components/CategorySection.jsx

Per-category editor card. Uses the budget to block item additions:

#### Budget check (lines 30-31):

```js
const totalItems = (categoryItemsCounts || []).reduce((s, c) => s + c, 0)
const atMax = layoutMaxItems != null && totalItems >= layoutMaxItems
```

#### Add item button (lines 33-48):

```js
const addItem = () => {
  if (!newItemName.trim()) return
  if (atMax) {
    toast.error(`Maximum items reached for this layout (${layoutMaxItems})`)
    return
  }
  // ... add the item
}
```

#### UI indicator (lines 138-141):

Shows `({layoutMaxItems} max)` badge next to "Items" header.

#### Add button disabled state (line 171):

```jsx
<Button size="sm" variant="ghost" onClick={addItem} disabled={atMax}>
```

---

### 5. tv-display/src/App.jsx

The actual TV rendering app. Uses pixel budgets to truncate items before rendering:

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

This ensures the TV NEVER overflows — even if the admin somehow saves more items than the budget allows, the TV only renders what fits.

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

### 6. tv-display/src/layouts/capabilities.js

Identical to the admin-dashboard version. Synced on commit `1ac972e`. Contains:
- Same `DEFAULT_CAPABILITIES` with pixel budget fields
- Same `LAYOUT_CAPABILITIES` with exact pixel values
- Same `getLayoutCapabilities()`, `getLayoutOptionalFields()`
- Same `getMaxCategories()`, `getMaxItems()`

---

### 7. tv-display/src/layouts/index.js

Re-exports everything from capabilities.js:

```js
export {
  LAYOUT_CAPABILITIES,
  getLayoutCapabilities,
  getLayoutOptionalFields,
  getMaxItems,
} from './capabilities'
```

Also exports layout component registry and `getLayout()` resolver.

---

## Data Flow Summary

```
Admin user adds items in MenuEditor.jsx
  │
  ▼
MenuEditor calls getMaxItems(layoutKey, catCount)
  → gets the budget number from capabilities.js
  → if adding would exceed budget, blocks with toast
  → if within budget, calls save()
    │
    ▼
  save() does ANOTHER budget check (defense-in-depth)
    → if exceeded, blocks with toast
    → if within budget, calls api.updateMenu()
      │
      ▼
    updateMenu() does THIRD budget check (API-layer guard)
      → calls getMaxItems() again
      → if exceeded, throws error → toast shows
      → if within budget, writes to Firestore
        │
        ▼
      Firestore stores categories[].items[]
        │
        ▼
      TV display reads from Firestore
        │
        ▼
      App.jsx calls getMaxItems(layoutKey, catCount)
        → gets the budget number
        → calls truncateCategories() with that number
        → if items exceed budget, slices them proportionally
        → passes truncated data to layout component
          │
          ▼
        Layout renders only what fits on screen
```

There are FOUR layers of enforcement:
1. **UI button disabled** — CategorySection disables "Add Item" when at max
2. **Editor save guard** — MenuEditor blocks save if budget would be exceeded
3. **API validation** — updateMenu() throws before writing to Firestore
4. **TV truncation** — App.jsx truncates items before rendering

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

1. Create the layout component (JSX with all CSS clamp values)
2. Add its entry to `LAYOUT_CAPABILITIES` in both admin-dashboard AND tv-display capabilities.js
3. Trace the pixel budgets at 1920×1080 using the method above
4. Add the component to both `index.js` layout registries
5. Add to `LAYOUT_OPTIONS` in MenuEditor.jsx
6. Add to `availableLayouts` default in api.js `createRestaurant()`
