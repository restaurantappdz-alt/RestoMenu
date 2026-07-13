# TV Display Offline PWA

**Date:** 2026-07-13
**Status:** Approved

## Goal

The TV display app (`tv-display/`) must work fully offline as a PWA — installable to a TV home screen, launching and showing the cached menu with zero internet connectivity.

## Requirements

- **Full offline:** No internet required after the first online visit. App shell, fonts, and menu data all served from cache.
- **Auto-update:** When internet returns, Firestore `onSnapshot` reconnects and delivers latest data automatically.
- **No code migration:** Fix the existing codebase — minimal changes, same architecture.

## Data Flow

### Online (first visit + normal operation)

1. User visits `https://restaurantappdz-alt.github.io/RestoMenu/?r=<id>&s=<screenId>`
2. Service worker caches `index.html`, JS, CSS, Google Fonts
3. `useMenuData` subscribes to Firestore `config/display` doc via `onSnapshot`
4. On snapshot, resolves `activeMenuId`:
   - If `?s=` present: `data.screens[screenId].menuId`
   - Otherwise: `data.activeMenuId`
5. Saves the config doc to localStorage (`restomenu-tv-config_<id>`)
6. Subscribes to the menu doc via `onSnapshot`
7. On menu snapshot, caches menu data to localStorage (`restomenu-tv-cache_<id>`)
8. Renders the layout

### Offline → user opens PWA or reloads

1. Service worker intercepts navigation, serves cached `index.html`
2. Google Fonts served from cache
3. `useMenuData` mounts, tries `onSnapshot(config)` → fails
4. Error handler loads cached config from localStorage
5. Resolves `activeMenuId` from cached config using same logic as online (`screens?.[screenId]?.menuId || activeMenuId`)
6. Sets `activeMenuId`, which triggers the menu listener effect
7. Menu listener tries `onSnapshot(menu)` → fails → `offline = true`
8. Menu data is already loaded from localStorage cache (`loadCache` on mount + the `activeMenuId` trigger)
9. Renders layout with `offline` banner

### Offline → Online (PWA stays open)

- Firestore `onSnapshot` detects reconnection
- Fires snapshot callback with latest data
- Normal flow resumes: config + menu cached, rendered, `offline = false`

## Changes

### 1. `vite.config.js` — Service worker config

| Setting | Value | Reason |
|---------|-------|--------|
| `navigateFallback` | `'/RestoMenu/index.html'` | Serve cached HTML for any `?r=&s=` URL |
| Google Fonts runtime caching | CacheFirst for `fonts.googleapis.com` + `fonts.gstatic.com` | Fonts survive offline |
| Firestore runtime caching | Remove | Streaming protocol, not cacheable by Workbox |

### 2. `useMenuData.js` — Config doc caching

- Add `CONFIG_CACHE_KEY_PREFIX = 'restomenu-tv-config'`
- Functions `loadConfigCache(id)` / `saveConfigCache(id, data)`
- Config listener success: call `saveConfigCache(id, snap.data())`
- Config listener error: `loadConfigCache(id)` → resolve `activeMenuId` with same logic as online → `setActiveMenuId(cachedMenuId)` → menu loads from existing cache
- Menu listener error: keep existing menu state, set `offline = true` (already done)

### 3. `index.html` — PWA meta tags

- `<meta name="apple-mobile-web-app-capable" content="yes">`
- `<meta name="theme-color" content="#000000">`

### 4. Icon assets

- Already present: `public/icon-192.png`, `public/icon-512.png`

## Files Changed

- `tv-display/vite.config.js` — ~10 lines changed
- `tv-display/src/hooks/useMenuData.js` — ~30 lines added
- `tv-display/index.html` — ~2 lines added

## Offline Experience

| State | Behavior | Visual |
|-------|----------|--------|
| Online | Normal | Full layout |
| Offline, data cached | Menu displayed from cache | "Offline — cached menu" banner |
| Offline, no cache | Shows "Not Set Up" or blank | Graceful |
| Reconnected | Auto-updates within seconds | Banner disappears |
