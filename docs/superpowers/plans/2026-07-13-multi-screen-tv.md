# Multi-Screen TV Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow a restaurant to push menus to two independent TV screens (TV 1, TV 2) each with its own URL, live-status badge, and clear action.

**Architecture:** Add `tv1MenuId`/`tv2MenuId` fields to existing `config/display` doc. Admin shows Set/Clear buttons per menu row with LIVE badges from a real-time snapshot. TV display parses `?s=1|2` URL param to read the correct field.

**Tech Stack:** React 18, Firebase Firestore, Tailwind, lucide-react

## Global Constraints

- No new Firestore collections — use existing `config/display` doc
- Backward compatible: `?r=xxx` without `?s=` falls back to `activeMenuId`
- All changes must build without errors (`npm run build` in each project)

---

### Task 1: API layer — `assignMenuToScreen` + `clearScreen`

**Files:**
- Modify: `admin-dashboard/src/api.js` (after line 88)

**Interfaces:**
- Consumes: existing `updateDoc`, `doc`, `serverTimestamp` imports (already present)
- Produces: `assignMenuToScreen(restaurantId, menuId, screen)` and `clearScreen(restaurantId, screen)`

- [ ] **Add two functions to api.js**

After the existing `setActiveMenu` function (line 88), add:

```js
export async function assignMenuToScreen(restaurantId, menuId, screen) {
  const field = screen === 2 ? 'tv2MenuId' : 'tv1MenuId'
  await updateDoc(doc(db, 'restaurants', restaurantId, 'config', 'display'), {
    [field]: menuId,
    updatedAt: serverTimestamp(),
  })
}

export async function clearScreen(restaurantId, screen) {
  const field = screen === 2 ? 'tv2MenuId' : 'tv1MenuId'
  await updateDoc(doc(db, 'restaurants', restaurantId, 'config', 'display'), {
    [field]: null,
    updatedAt: serverTimestamp(),
  })
}
```

- [ ] **Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.

- [ ] **Commit**

Do NOT commit (user said not to).

---

### Task 2: TV Display — parse `?s=` parameter from URL

**Files:**
- Modify: `tv-display/src/hooks/useMenuData.js`

**Interfaces:**
- Consumes: `?s=1|2` URL param (optional)
- Produces: `activeMenuId` derived from `tv1MenuId`/`tv2MenuId`/`activeMenuId` based on `?s=`

- [ ] **Get screenId from URL**

Add after `getRestaurantId()`:

```js
function getScreenId() {
  const params = new URLSearchParams(window.location.search)
  return params.get('s') || null
}
```

- [ ] **Map screenId to config field**

Add a mapping function:

```js
function screenConfigField(screenId) {
  if (screenId === '1') return 'tv1MenuId'
  if (screenId === '2') return 'tv2MenuId'
  return 'activeMenuId'
}
```

- [ ] **Update useMenuData to use screen-aware field**

In the first `useEffect` (config listener), change:

```js
const unsubConfig = onSnapshot(doc(db, 'restaurants', id, 'config', 'display'), (snap) => {
  const data = snap.data()
  const newId = data?.activeMenuId || null
```

To:

```js
const screenId = getScreenId()

const unsubConfig = onSnapshot(doc(db, 'restaurants', id, 'config', 'display'), (snap) => {
  const data = snap.data() || {}
  const field = screenConfigField(screenId)
  const newId = data?.[field] || null
```

Also update the error callback to use `snap.data()` with `|| {}` fallback to avoid crash when snap doesn't exist.

- [ ] **Verify build**

Run: `cd tv-display && npm run build` — expect success.

---

### Task 3: Admin Dashboard — MenuList with LIVE badges and Set/Clear

**Files:**
- Modify: `admin-dashboard/src/components/MenuList.jsx`
- Imports needed: `import { Monitor, X, Copy, Plus, Trash2, ChefHat, RefreshCw, Eye, Check, MonitorX } from 'lucide-react'` (add `X`, `Check`)
- Actually, keep existing imports and just add `X`: `import { Plus, Trash2, Monitor, ChefHat, RefreshCw, Eye, Copy, X, Check } from 'lucide-react'`

**Interfaces:**
- Consumes: `assignMenuToScreen`, `clearScreen`, `onDisplayConfigSnapshot` from api.js

- [ ] **Add screen config state and snapshot**

At the top of the `MenuList` component, add:

```js
const [screenConfig, setScreenConfig] = useState({ tv1MenuId: null, tv2MenuId: null })

useEffect(() => {
  const unsub = onDisplayConfigSnapshot(restaurantId, (data) => {
    setScreenConfig({ tv1MenuId: data.tv1MenuId || null, tv2MenuId: data.tv2MenuId || null })
  })
  return unsub
}, [restaurantId])
```

- [ ] **Add assign/clear handlers**

```js
const onAssign = async (menuId, screen) => {
  try {
    await assignMenuToScreen(restaurantId, menuId, screen)
    toast.success(`Assigned to TV ${screen}`)
  } catch (e) {
    toast.error(e.message)
  }
}

const onClear = async (screen) => {
  try {
    await clearScreen(restaurantId, screen)
    toast.success(`TV ${screen} cleared`)
  } catch (e) {
    toast.error(e.message)
  }
}
```

- [ ] **Build the TV status component**

Add this helper component before `MenuList` (or inline it):

```jsx
function TvStatus({ menuId, screenConfig, screen, onAssign, onClear }) {
  const field = screen === 1 ? 'tv1MenuId' : 'tv2MenuId'
  const isLive = screenConfig[field] === menuId

  if (isLive) {
    return (
      <div className="flex items-center gap-1">
        <span className="bg-gold text-[#0D0D0D] text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
        <button
          onClick={(e) => { e.stopPropagation(); onClear(screen) }}
          className="text-zinc-600 hover:text-red-400 transition-colors"
          title={`Clear TV ${screen}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onAssign(menuId, screen) }}
      className="text-[11px] text-zinc-500 hover:text-gold border border-zinc-700 hover:border-gold/50 px-2 py-0.5 rounded transition-colors"
    >
      Set TV{screen}
    </button>
  )
}
```

- [ ] **Update the table to add TV columns**

Replace the current `<TableHead>` row:

```jsx
<TableHead className="w-[40%]">Name</TableHead>
<TableHead>Categories</TableHead>
<TableHead>Items</TableHead>
<TableHead className="text-right">Actions</TableHead>
```

With:

```jsx
<TableHead className="w-[30%]">Name</TableHead>
<TableHead>Categories</TableHead>
<TableHead>Items</TableHead>
<TableHead className="text-center">TV 1</TableHead>
<TableHead className="text-center">TV 2</TableHead>
<TableHead className="text-right">Actions</TableHead>
```

Replace the `<TableCell>` data rows (inside the `menus.map`) — after the Items cell and before the actions div:

```jsx
<TableCell className="font-medium text-zinc-200 group-hover:text-gold transition-colors">
  {menu.name}
</TableCell>
<TableCell className="text-zinc-400">{catCount}</TableCell>
<TableCell className="text-zinc-400">{itemCount}</TableCell>
<TableCell className="text-center">
  <TvStatus menuId={menu.id} screenConfig={screenConfig} screen={1} onAssign={onAssign} onClear={onClear} />
</TableCell>
<TableCell className="text-center">
  <TvStatus menuId={menu.id} screenConfig={screenConfig} screen={2} onAssign={onAssign} onClear={onClear} />
</TableCell>
<TableCell className="text-right">
```

And keep the existing actions div (Delete button) as-is.

- [ ] **Remove unused imports**

Remove `Monitor` from the Icon import if it's no longer used (it was used for the old "Display on TV" button which is gone). Actually, keep it — other layouts may use it. But we can remove it to be safe. Let's just clean up: remove `Monitor`, `Eye`, `RefreshCw` from the import line.

Change:
```js
import { Plus, Trash2, Monitor, ChefHat, RefreshCw, Eye, Copy, X, Check } from 'lucide-react'
```
To:
```js
import { Plus, Trash2, ChefHat, Copy, X } from 'lucide-react'
```

- [ ] **Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.

---

### Task 4: Owner header — TV 1 + TV 2 links

**Files:**
- Modify: `admin-dashboard/src/App.jsx`

- [ ] **Replace single TV link with two TV links**

In the `OwnerDashboard` header, replace:

```jsx
<div className="hidden sm:flex items-center gap-2 text-xs">
    <span className="text-zinc-400">TV Link:</span>
    <span className="text-zinc-300 font-mono max-w-[200px] truncate">{tvLink}</span>
  <button
    onClick={() => { navigator.clipboard.writeText(tvLink); toast.success('TV link copied!') }}
    className="text-gold hover:text-gold/80 transition-colors"
    title="Copy TV link"
  >
    <svg ...>...</svg>
  </button>
</div>
```

With:

```jsx
<div className="hidden sm:flex items-center gap-3 text-xs">
  {[1, 2].map((s) => {
    const url = `https://restaurantappdz-alt.github.io/RestoMenu/?r=${restaurantId}&s=${s}`
    return (
      <div key={s} className="flex items-center gap-1.5">
        <span className="text-zinc-500">TV{s}:</span>
        <span className="text-zinc-300 font-mono max-w-[140px] truncate">{url}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(url); toast.success(`TV ${s} link copied!`) }}
          className="text-gold hover:text-gold/80 shrink-0"
          title={`Copy TV ${s} link`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
      </div>
    )
  })}
</div>
```

- [ ] **Remove the old `tvLink` variable**

Remove `const tvLink = ...` line near the top of `OwnerDashboard` since it's no longer used.

- [ ] **Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.

---

### Task 5: Super Admin header — TV 1 + TV 2 links

**Files:**
- Modify: `admin-dashboard/src/components/AdminDashboard.jsx`

- [ ] **Replace single TV link with two TV links**

Same change as Task 4 but in `AdminDashboard.jsx`. Find the header TV link section (inside the `selectedRestaurant` branch, around line 189) and replace:

```jsx
<div className="hidden sm:flex items-center gap-2 text-xs">
  <span className="text-zinc-400">TV Link:</span>
  <span className="text-zinc-300 font-mono max-w-[200px] truncate">{tvLink}</span>
  <button ...>
    <Copy className="w-3.5 h-3.5" />
  </button>
</div>
```

With:

```jsx
<div className="hidden sm:flex items-center gap-3 text-xs">
  {[1, 2].map((s) => {
    const url = `https://restaurantappdz-alt.github.io/RestoMenu/?r=${restaurantId}&s=${s}`
    return (
      <div key={s} className="flex items-center gap-1.5">
        <span className="text-zinc-500">TV{s}:</span>
        <span className="text-zinc-300 font-mono max-w-[140px] truncate">{url}</span>
        <button
          onClick={() => { navigator.clipboard.writeText(url); toast.success(`TV ${s} link copied!`) }}
          className="text-gold hover:text-gold/80 shrink-0"
          title={`Copy TV ${s} link`}
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
      </div>
    )
  })}
</div>
```

- [ ] **Remove the old `tvLink` variable**

Remove `const tvLink = ...` line (around line 168) since it's no longer used.

- [ ] **Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.

---

## Build Verification

After all tasks:

```bash
cd admin-dashboard && npm run build
cd ../tv-display && npm run build
```

Both must succeed without errors.

## Backward Compatibility

- `?r=xxx` without `?s=` still uses `activeMenuId` — all existing TV links continue to work
- Old `activeMenuId` field in `config/display` remains untouched
- No data migration needed
