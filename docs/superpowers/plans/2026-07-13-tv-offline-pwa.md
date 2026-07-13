# TV Display Offline PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the TV display app (tv-display/) a fully offline PWA — installable on a TV home screen, showing cached menu with zero internet.

**Architecture:** Offline-first: state initializers read cached config + menu immediately on mount, connectivity tracked via `navigator.onLine` + events, Firestore listeners only handle live updates (not offline detection).

**Tech Stack:** vite-plugin-pwa, Workbox, Firebase Firestore (onSnapshot), localStorage, navigator.onLine

## Global Constraints

- Must work fully offline after first online visit, including initial boot
- Must auto-update when internet returns (onSnapshot + online event)
- Must resolve `?s=` screen ID from cached config using same logic as online
- Error handlers on onSnapshot only fire for permission errors / deleted docs — never for offline
- All changes limited to `tv-display/` directory
- Build must pass for both `tv-display/` and `admin-dashboard/`

---

### Task 1: Update PWA service worker config

**Files:**
- Modify: `tv-display/vite.config.js`

- [ ] **Read current vite.config.js**

- [ ] **Replace VitePWA config:**

Current lines 9-33:
```js
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Restaurant Menu Display',
        short_name: 'Menu TV',
        start_url: '.',
        display: 'fullscreen',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'firestore-fallback', networkTimeoutSeconds: 4 }
          }
        ]
      }
    })
```

Replace with:
```js
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Restaurant Menu Display',
        short_name: 'Menu TV',
        start_url: '.',
        display: 'fullscreen',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        navigateFallback: '/RestoMenu/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
```

**Changes:** `navigateFallback: null` → `'/RestoMenu/index.html'`, removed Firestore cache, added Google Fonts `CacheFirst`.

- [ ] **Build to verify:**
```powershell
cd tv-display; npm run build
```
Expected: Build succeeds, `dist/sw.js` contains navigateFallback and font caching.

- [ ] **Commit:**
```powershell
git add tv-display/vite.config.js
git commit -m "feat(tv): fix PWA SW config — app shell fallback + Google Fonts caching"
```

---

### Task 2: Offline-first data layer + config caching

**Files:**
- Modify: `tv-display/src/hooks/useMenuData.js`

**Core design:**
- `useState` initializers read cached config + menu immediately (offline boot)
- `loading` starts `false` if we have matching cached data
- `offline` starts from `navigator.onLine`
- New effect listens to `online`/`offline` events
- Config listener saves to cache on success, error handler is clean (no offline logic)
- Menu listener error handler is clean (no offline fallback)

- [ ] **Read current useMenuData.js**

- [ ] **Add config cache key prefix after CACHE_KEY_PREFIX:**

```js
const CONFIG_CACHE_KEY_PREFIX = 'restomenu-tv-config'
```

- [ ] **Add config cache helpers after saveCache:**

```js
function loadConfigCache(restaurantId) {
  try {
    const raw = localStorage.getItem(`${CONFIG_CACHE_KEY_PREFIX}_${restaurantId}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveConfigCache(restaurantId, data) {
  try { localStorage.setItem(`${CONFIG_CACHE_KEY_PREFIX}_${restaurantId}`, JSON.stringify(data)) } catch {} 
}
```

- [ ] **Replace state declarations (lines 38-45):**

Old:
```js
  const [restaurantId, setRestaurantId] = useState(getRestaurantId)
  const [menu, setMenu] = useState(() => restaurantId ? loadCache(restaurantId) : null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [activeMenuId, setActiveMenuId] = useState(null)
```

New:
```js
  const [restaurantId, setRestaurantId] = useState(getRestaurantId)
  const [activeMenuId, setActiveMenuId] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return null
    const cached = loadConfigCache(rid)
    if (!cached) return null
    const sid = getScreenId()
    const raw = sid ? cached.screens?.[sid] : cached.activeMenuId
    return (raw && typeof raw === 'object' ? raw.menuId : raw) || null
  })
  const [menu, setMenu] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return null
    const cachedMenu = loadCache(rid)
    const cachedCfg = loadConfigCache(rid)
    if (!cachedMenu || !cachedCfg) return null
    const sid = getScreenId()
    const raw = sid ? cachedCfg.screens?.[sid] : cachedCfg.activeMenuId
    const expectedId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
    return cachedMenu.id === expectedId ? cachedMenu : null
  })
  const [loading, setLoading] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return true
    const cachedMenu = loadCache(rid)
    const cachedCfg = loadConfigCache(rid)
    if (!cachedMenu || !cachedCfg) return true
    const sid = getScreenId()
    const raw = sid ? cachedCfg.screens?.[sid] : cachedCfg.activeMenuId
    const expectedId = (raw && typeof raw === 'object' ? raw.menuId : raw) || null
    return cachedMenu.id !== expectedId
  })
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)
  const [waiting, setWaiting] = useState(() => {
    const rid = getRestaurantId()
    if (!rid) return false
    const cached = loadConfigCache(rid)
    if (!cached) return false
    const sid = getScreenId()
    const raw = sid ? cached.screens?.[sid] : cached.activeMenuId
    return !((raw && typeof raw === 'object' ? raw.menuId : raw) || null)
  })
  const [needsSetup, setNeedsSetup] = useState(false)
```

- [ ] **Add online/offline event listener effect** (after the state declarations, before the config effect):

```js
  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
```

- [ ] **Add config saving in first effect** (config listener success):

In the first `useEffect`, after `const data = snap.data() || {}` (line 61), insert:
```js
      saveConfigCache(id, data)
```

- [ ] **Replace config listener error handler (lines 73-76):**

Old:
```js
    }, () => {
      setOffline(true)
      setLoading(false)
    })
```

New:
```js
    }, (error) => {
      console.error('Config listener error:', error)
      setLoading(false)
    })
```

- [ ] **Clean up menu listener error handler (lines 94-97):**

Remove `setOffline(true)` call — keep only:
```js
    }, (error) => {
      console.error('Menu listener error:', error)
      setLoading(false)
    })
```

- [ ] **Remove `setOffline(false)` from menu listener success:**

On line 89, remove `setOffline(false)`. The connectivity event listener handles this.

- [ ] **Build to verify:**
```powershell
cd tv-display; npm run build
```

- [ ] **Commit:**
```powershell
git add tv-display/src/hooks/useMenuData.js
git commit -m "feat(tv): offline-first init — cached config + menu, connectivity events"
```

---

### Task 3: Add PWA meta tags

**Files:**
- Modify: `tv-display/index.html`

- [ ] **Read current index.html**

- [ ] **Add meta tags after viewport meta (line 5):**

```html
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#000000">
```

- [ ] **Build to verify:**
```powershell
cd tv-display; npm run build
```

- [ ] **Commit:**
```powershell
git add tv-display/index.html
git commit -m "feat(tv): add PWA meta tags for home screen install"
```

---

### Task 4: Build both projects and verify

- [ ] **Build tv-display:**
```powershell
cd tv-display; npm run build
```
Expected: Build succeeds, dist/sw.js contains navigateFallback and font caching.

- [ ] **Build admin-dashboard:**
```powershell
cd admin-dashboard; npm run build
```
Expected: Build succeeds, no regressions.

- [ ] **Final commit:**
```powershell
git add -A
git commit -m "chore: build both projects after offline PWA changes"
```
