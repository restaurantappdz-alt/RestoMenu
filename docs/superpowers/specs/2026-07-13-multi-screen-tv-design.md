# Multi-Screen TV Support

Allow a restaurant to push menus to two independent TV screens, each with its own URL.

## Data Model

Add two fields to the existing `restaurants/{restaurantId}/config/display` document:

```
restaurants/{restaurantId}/config/display:
  activeMenuId: string | null   ← existing, unchanged
  tv1MenuId: string | null      ← menu ID assigned to TV 1
  tv2MenuId: string | null      ← menu ID assigned to TV 2
```

No new collections. No schema migration needed — new fields are optional.

## TV Display URL Format

- TV 1: `https://restaurantappdz-alt.github.io/RestoMenu/?r={restaurantId}&s=1`
- TV 2: `https://restaurantappdz-alt.github.io/RestoMenu/?r={restaurantId}&s=2`
- No `?s` parameter → uses `activeMenuId` (backward compatible)

## Admin Dashboard — API Layer

Add to `api.js`:

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

## Admin Dashboard — MenuList.jsx

The menu table shows live assignment status so the owner can see at a glance what's showing on each screen.

**State:** Subscribe to `config/display` via `onDisplayConfigSnapshot(restaurantId, ...)` to get `tv1MenuId` and `tv2MenuId`.

**Each menu row** gets two action zones:

| Column | Content |
|--------|---------|
| **TV 1** | If this menu's ID matches `tv1MenuId` → gold badge "LIVE" + "Clear" button. Otherwise → "Set" button to assign. |
| **TV 2** | Same logic using `tv2MenuId`. |

Visual:
- **Set** button: small outline button (zinc border, text-zinc-400)
- **LIVE** badge: small gold filled pill (`bg-gold text-[#0D0D0D] text-[10px] font-bold px-2 py-0.5 rounded-full`)
- **Clear** button: small ghost button next to the badge (X icon or "Clear" text)

**Behavior:**
- Click **Set** → calls `assignMenuToScreen(restaurantId, menu.id, 1 or 2)`
- Click **Clear** → calls `clearScreen(restaurantId, 1 or 2)`
- Real-time: the badges update instantly via `onSnapshot`

The old `onSetDisplay` / `setActiveMenu` call is removed from the menu row actions.

## Admin Dashboard — Header

In both `App.jsx` (OwnerDashboard) and `AdminDashboard.jsx`:

Replace the single TV link with two labeled, copyable links:
- **TV 1:** `https://restaurantappdz-alt.github.io/RestoMenu/?r={restaurantId}&s=1`
- **TV 2:** `https://restaurantappdz-alt.github.io/RestoMenu/?r={restaurantId}&s=2`

Each gets a copy button. The old single TV link is removed.

## TV Display — useMenuData.js

1. Parse `?s=` from URL parameters alongside `?r=`
2. Map screen value to config field: `s=1` → `tv1MenuId`, `s=2` → `tv2MenuId`, no `s` → `activeMenuId`
3. The rest of the hook (onSnapshot, caching, offline fallback) stays identical

## Files Changed

| File | Change |
|------|--------|
| `admin-dashboard/src/api.js` | Add `assignMenuToScreen()` + `clearScreen()` |
| `admin-dashboard/src/components/MenuList.jsx` | TV1/TV2 Set/Clear per menu row + LIVE badge from config snapshot |
| `admin-dashboard/src/App.jsx` | Show TV 1 + TV 2 links in header |
| `admin-dashboard/src/components/AdminDashboard.jsx` | Show TV 1 + TV 2 links in header |
| `tv-display/src/hooks/useMenuData.js` | Parse `?s=`, read `tv1MenuId`/`tv2MenuId` from config |

## Backward Compatibility

- Existing TV links (`?r=xxx` without `?s=`) continue to work using `activeMenuId`
- Existing `activeMenuId` field in config stays — it acts as the default screen
- Old admin dashboards don't break from new fields (Firestore ignores unknown fields)
