# Screen Management Design

## Problem

Screens are currently hardcoded as numbered map keys (`screens.1`, `screens.2`) in the config doc. Adding or removing screens requires code changes. TV links displayed as raw URLs in the header are noisy and unwanted.

## Solution

Replace the numbered-screen approach with a **screens map where each entry is a managed object** with an auto-generated ID, user-chosen label, and assigned menu ID. Add a ScreenManager UI for add/remove/copy-link operations. Remove TV links from headers entirely.

## Data Model

```
restaurants/{restaurantId}/config/display
├── activeMenuId: string | null          ← unchanged, backward-compat fallback
└── screens: {
      "<autoId>": {
        label: string,      ← user-chosen, e.g. "Bar TV"
        menuId: string | null  ← assigned menu or null
      },
      ...
    }
```

- `<autoId>`: short random string (nanoid-style, 6-8 chars) — opaque, collision-resistant
- No fixed screen count — users add/remove freely
- **New restaurants**: `config/display` document does not exist until first write. `addScreen` MUST use `setDoc(ref, { screens: { [id]: ... } }, { merge: true })` — not `updateDoc` — to create the doc on first use
- **Legacy data**: Previous format (`tv1MenuId`/`tv2MenuId` flat fields on `config/display`) may exist in old docs. Previous numbered-keys format (`screens: { "1": ..., "2": ... }`) may exist in recently-updated docs. Neither is migrated — TV display handles both via `activeMenuId` fallback (see below)

## TV Display URL Format

```
https://restaurantappdz-alt.github.io/RestoMenu/?r=<restaurantId>&s=<autoId>
```

The TV display reads `data.screens?.[screenId]?.menuId`. If `screenId` is not found (or missing), falls back to `data.activeMenuId` for backward compatibility.

### activeMenuId freeze warning

Once screen management goes live, the admin UI no longer writes to `activeMenuId`. Old bare `?r=xxx` links (without `?s=`) are frozen — they'll keep showing whatever menu was last assigned via `activeMenuId`. New TVs should use `?s=` links. This is accepted — no migration logic needed.

## UI: ScreenManager Component

A new component rendered in the MenuList view, above the menu table.

### Screen list (card or inline section)

ScreenManager receives `menus` and `restaurantId` as props to resolve menuId → name and build URLs.

Each screen row shows:
- **Label** (user-chosen name)
- **Assigned menu** name (looked up from `menus` prop by `menuId`), or "No menu assigned" in muted text
- **Stale reference handling**: if `menuId` is non-null but no matching menu exists in `menus` (deleted menu), show "Menu deleted" in muted red — distinct from "No menu assigned"
- **Copy button** (clipboard icon) — copies `https://restaurantappdz-alt.github.io/RestoMenu/?r=<restaurantId>&s=<screenId>`, shows toast "TV link copied!". No URL text displayed.
- **Remove button** (X icon) — confirmation dialog, then deletes screen from map using `deleteField()`

### Add Screen

- Button: "+ Add Screen"
- Opens a small dialog with:
  - Label input (required)
  - Cancel / Add buttons
- On Add: generates random ID, writes `screens.{id}: { label, menuId: null }` using `setDoc(ref, { screens }, { merge: true })`, closes dialog, screen appears immediately

## UI: MenuList Table Columns

- Table renders one `<TableHead>` per screen entry in `screens`, sorted by label alphabetically
- Header text is the screen's label (e.g., "Bar TV" instead of "TV 1")
- Each body cell renders `<TvStatus>` as before — shows LIVE badge or Set button
- TvStatus reads `screens[screenKey].menuId` to determine LIVE state
- **No "+" column in table header** — adding screens is done via the ScreenManager above

## UI: Headers (App.jsx, AdminDashboard.jsx)

- **Removed entirely** — no TV links, no copy buttons, no URL text in any header
- All TV link access goes through the ScreenManager component in the main content area

## UI: Stale Menu References on Delete

When a menu is deleted (in MenuList's `onDelete` handler), iterate `screenConfig.screens` and for any screen whose `menuId` matches the deleted menu ID, clear it to null. This keeps the screen list clean — no stale references pointing to deleted menus.

Implementation: after `deleteMenu()` succeeds, loop over `screenConfig.screens`, collect entries where `entry.menuId === menuId`, and call `clearScreen()` for each.

## API Functions (api.js)

| Function | Signature | Effect | Implementation Notes |
|----------|-----------|--------|---------------------|
| `addScreen` | `(restaurantId, label)` | Generates random ID, writes `screens.{id}: { label, menuId: null }`, returns id | **Must use `setDoc(..., { merge: true })`** — not `updateDoc` — because new restaurants may not have the `config/display` doc yet |
| `removeScreen` | `(restaurantId, screenId)` | Deletes `screens.{screenId}` using `deleteField()` | **Must use dot-path key syntax**: `updateDoc(ref, { [`screens.${screenId}`]: deleteField() })`. Nested object form (`{ screens: { [id]: deleteField() } }`) silently fails |
| `assignMenuToScreen` | `(restaurantId, menuId, screenId)` | Sets `screens.{screenId}.menuId` to menuId | Uses `updateDoc` — the doc is guaranteed to exist if `addScreen` ran first |
| `clearScreen` | `(restaurantId, screenId)` | Sets `screens.{screenId}.menuId` to null | Same dot-path pattern as `removeScreen` |

## TV Display (useMenuData.js)

Already updated: reads `data.screens?.[screenId]?.menuId || data.activeMenuId`.

## File Changes

| File | Action |
|------|--------|
| `admin-dashboard/src/api.js` | Modify `assignMenuToScreen`/`clearScreen` to use `screens.{id}.menuId`; add `addScreen`, `removeScreen`; import `deleteField` |
| `admin-dashboard/src/components/ScreenManager.jsx` | **New** — screen list with add/remove/copy, stale-reference handling |
| `admin-dashboard/src/components/MenuList.jsx` | Integrate ScreenManager; dynamic table columns from `screens` map keys; TvStatus reads `screens[key].menuId`; clear stale refs on menu delete |
| `admin-dashboard/src/App.jsx` | Remove TV link section from owner header |
| `admin-dashboard/src/components/AdminDashboard.jsx` | Remove TV link section from admin header |
| `tv-display/src/hooks/useMenuData.js` | Already updated — `data.screens?.[screenId]?.menuId` |
| `firestore.rules` | See below |

## Firestore Rules

Current rules allow any authed user to write to any restaurant's `config/{docId}`:

```
match /config/{docId} {
  allow read: if true;
  allow write: if request.auth != null;  ← too permissive
}
```

This is a pre-existing issue (not introduced by this feature). Ideally the write rule should check `resource.data.ownerUid` for the restaurant, but that would require `ownerUid` to exist on every restaurant doc (it currently does — `createRestaurant` sets it). **Out of scope for this change** — rules update is a separate concern.

## Key Design Decisions

1. **Map vs array**: Map allows atomic field-level updates without read-modify-write races. Array would require read-whole/mutate/write-back on every screen operation.
2. **Auto-generated IDs**: Users don't need to think about URL identifiers; opaque short strings avoid collision and slug-management complexity.
3. **No TV links in headers**: User explicitly wants just copy buttons in the ScreenManager; headers stay clean.
4. **Backward compat**: Existing `?r=xxx` links (without `?s=`) continue working via `activeMenuId` fallback. Links are frozen once activeMenuId stops being written — acceptable trade-off.
5. **Stale reference cleanup on delete**: Clearing a deleted menu's references from all screens keeps the UI honest — no dangling pointers to deleted menus.
