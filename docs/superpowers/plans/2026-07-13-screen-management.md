# Screen Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace numbered-screen keys with a managed list of screens (add/remove, custom labels, copy links) in the admin dashboard.

**Architecture:** Screens stored as a map `{ autoId: { label, menuId } }` inside the existing `config/display` doc. New `ScreenManager` component handles add/remove/copy. MenuList table renders dynamic columns per screen. TV display reads `screens[screenId].menuId`.

**Tech Stack:** Firebase Firestore, React, Firestore dot-path updates with `deleteField()`

## Global Constraints

- `addScreen` must use `setDoc` with `{ merge: true }` — not `updateDoc` — because new restaurants may not have `config/display` doc yet
- `removeScreen` and `clearScreen` must use dot-path key syntax: `{ [`screens.${screenId}`]: deleteField() }`. Nested object form `{ screens: { [id]: deleteField() } }` silently fails
- Screen IDs: auto-generated using `crypto.randomUUID().slice(0, 6)` — no external deps
- TV display backward compat: `data.screens?.[screenId]?.menuId || data.activeMenuId`
- Headers: no TV links displayed anywhere
- **Firestore rules**: Current rules at `config/{docId}` allow any authenticated user to write (`allow write: if request.auth != null;`). This is a **pre-existing security gap** — ideally writes should be restricted to the restaurant's owner. Fixing it properly requires admin management infrastructure (custom claims or admins collection) which is out of scope for this feature. No rules change in this plan; the gap is acknowledged and scoped separately.

---
### Task 1: API Layer (api.js)

**Files:**
- Modify: `admin-dashboard/src/api.js`

**Interfaces:**
- Consumes: Firestore `doc`, `updateDoc`, `setDoc`, `serverTimestamp`, `deleteField`, `db` (already imported)
- Produces:
  - `addScreen(restaurantId, label) => string` — creates screen entry with auto ID, returns ID
  - `removeScreen(restaurantId, screenId) => Promise<void>` — deletes entire screen entry
  - `assignMenuToScreen(restaurantId, menuId, screenId) => Promise<void>` — sets `screens.{id}.menuId`
  - `clearScreen(restaurantId, screenId) => Promise<void>` — deletes `screens.{id}.menuId`

- [ ] **Step 1: Verify `deleteField` is imported**

`deleteField` is already imported at line 11 of `api.js`. Move on.

- [ ] **Step 2: Replace `assignMenuToScreen` and `clearScreen`**

Current code writes to `screens.{screenKey}` (top-level). New model uses `screens.{screenKey}.menuId` for assign and `screens.{screenKey}.menuId` with `deleteField()` for clear.

Replace lines 91-103 with:

```js
export async function assignMenuToScreen(restaurantId, menuId, screenId) {
  await updateDoc(doc(db, 'restaurants', restaurantId, 'config', 'display'), {
    [`screens.${screenId}.menuId`]: menuId,
    updatedAt: serverTimestamp(),
  })
}

export async function clearScreen(restaurantId, screenId) {
  await updateDoc(doc(db, 'restaurants', restaurantId, 'config', 'display'), {
    [`screens.${screenId}.menuId`]: deleteField(),
    updatedAt: serverTimestamp(),
  })
}
```

- [ ] **Step 3: Add `addScreen` function**

Add after `clearScreen`:

```js
export async function addScreen(restaurantId, label) {
  const id = crypto.randomUUID().slice(0, 6)
  const ref = doc(db, 'restaurants', restaurantId, 'config', 'display')
  await setDoc(ref, {
    screens: {
      [id]: { label, menuId: null },
    },
    updatedAt: serverTimestamp(),
  }, { merge: true })
  return id
}
```

- [ ] **Step 4: Add `removeScreen` function**

```js
export async function removeScreen(restaurantId, screenId) {
  await updateDoc(doc(db, 'restaurants', restaurantId, 'config', 'display'), {
    [`screens.${screenId}`]: deleteField(),
    updatedAt: serverTimestamp(),
  })
}
```

- [ ] **Step 5: Verify build**

Run: `cd admin-dashboard && npm run build` — expect success (no semantic changes to imports yet).

---
### Task 2: ScreenManager Component

**Files:**
- Create: `admin-dashboard/src/components/ScreenManager.jsx`

**Interfaces:**
- Consumes: `screens` (Record<string, { label: string, menuId: string | null }>), `menus` (Array<{ id: string, name: string }>)
- Produces: `ScreenManager` component rendered above menu table — no callbacks needed because Firestore snapshot listener in MenuList picks up all changes reactively
- Internally calls: `addScreen`, `removeScreen`, `Copy` from lucide-react, `toast` from sonner

- [ ] **Step 1: Create ScreenManager.jsx**

```jsx
import { useState } from 'react'
import { Copy, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { addScreen, removeScreen } from '@/api'
import { useRestaurant } from '@/RestaurantContext'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

function lookupMenuName(menuId, menus) {
  if (!menuId) return null
  const menu = menus.find((m) => m.id === menuId)
  if (!menu) return 'DELETED'
  return menu.name
}

export default function ScreenManager({ screens, menus }) {
  const { restaurantId } = useRestaurant()
  const [addOpen, setAddOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [label, setLabel] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState(false)

  const sorted = Object.entries(screens || {}).sort(([, a], [, b]) =>
    a.label.localeCompare(b.label)
  )

  const handleAdd = async () => {
    if (!label.trim()) return
    setAdding(true)
    try {
      await addScreen(restaurantId, label.trim())
      toast.success(`Screen "${label}" added`)
      setLabel('')
      setAddOpen(false)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    try {
      await removeScreen(restaurantId, removeTarget.id)
      toast.success(`Screen "${removeTarget.label}" removed`)
      setRemoveTarget(null)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setRemoving(false)
    }
  }

  const handleCopy = (screenId) => {
    const url = `https://restaurantappdz-alt.github.io/RestoMenu/?r=${restaurantId}&s=${screenId}`
    navigator.clipboard.writeText(url)
    toast.success('TV link copied!')
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">TV Screens</h3>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> Add Screen
        </Button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs text-zinc-600">No screens yet. Add one to start assigning menus.</p>
      ) : (
        <div className="space-y-1.5">
          {sorted.map(([id, screen]) => {
            const menuName = lookupMenuName(screen.menuId, menus)
            return (
              <div key={id} className="flex items-center gap-3 text-sm py-1.5 px-2 rounded-lg hover:bg-zinc-800/40 transition-colors">
                <span className="text-zinc-200 font-medium min-w-[120px]">{screen.label}</span>
                <span className={`text-xs ${menuName === 'DELETED' ? 'text-red-400' : menuName ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {menuName === 'DELETED' ? 'Menu deleted' : menuName || 'No menu assigned'}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => handleCopy(id)}
                    className="text-zinc-500 hover:text-gold transition-colors p-1"
                    title="Copy TV link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setRemoveTarget({ id, label: screen.label })}
                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                    title="Remove screen"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Screen Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Screen</DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="e.g., Bar TV"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-gold transition-colors text-sm"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setAddOpen(false); setLabel('') }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding || !label.trim()}>
              {adding ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Screen</DialogTitle>
            <DialogDescription>
              Remove "{removeTarget?.label}"? Any menu assigned to this screen will be unlinked.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button onClick={handleRemove} disabled={removing} className="bg-red-600 hover:bg-red-700 text-white">
              {removing ? 'Removing...' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.

---
### Task 3: MenuList Integration

**Files:**
- Modify: `admin-dashboard/src/components/MenuList.jsx`

**Interfaces:**
- Consumes: ScreenManager (from Task 2), updated api functions (from Task 1)
- Produces: Full menu view with screen management + dynamic TV columns

- [ ] **Step 1: Import ScreenManager**

Add after the MenuEditor import (line 24):
```js
import ScreenManager from './ScreenManager'
```

- [ ] **Step 2: Fix default screenConfig state**

Change line 36 from:
```js
const [screenConfig, setScreenConfig] = useState({ screens: { "1": null, "2": null } })
```
to:
```js
const [screenConfig, setScreenConfig] = useState({ screens: {} })
```

- [ ] **Step 3: Fix snapshot normalization**

Change lines 44-46 from:
```js
    const unsub = onDisplayConfigSnapshot(restaurantId, (data) => {
      const screens = data.screens || { "1": null, "2": null }
      setScreenConfig({ ...data, screens })
    })
```
to:
```js
    const unsub = onDisplayConfigSnapshot(restaurantId, (data) => {
      const screens = data.screens || {}
      setScreenConfig({ ...data, screens })
    })
```

- [ ] **Step 4: Fix TvStatus data read**

Change line 114 from:
```js
    const isLive = screenConfig.screens?.[screenKey] === menuId
```
to:
```js
    const isLive = screenConfig.screens?.[screenKey]?.menuId === menuId
```

- [ ] **Step 5: Fix TvStatus button text**

Change line 136 from:
```
        Set TV{screenKey}
```
to:
```
        Set
```

(The screen label is shown in the column header, so the button just says "Set")

- [ ] **Step 6: Fix table header labels**

Change lines 219-221 from:
```jsx
                {Object.keys(screenConfig.screens || {}).sort().map((key) => (
                  <TableHead key={key} className="text-center">TV {key}</TableHead>
                ))}
```
to:
```jsx
                {Object.entries(screenConfig.screens || {}).sort(([, a], [, b]) => a.label.localeCompare(b.label)).map(([key, screen]) => (
                  <TableHead key={key} className="text-center">{screen.label}</TableHead>
                ))}
```

- [ ] **Step 7: Fix table body cells sort order**

Change lines 243-247 from:
```jsx
                    {Object.keys(screenConfig.screens || {}).sort().map((key) => (
                      <TableCell key={key} className="text-center">
                        <TvStatus menuId={menu.id} screenKey={key} />
                      </TableCell>
                    ))}
```
to:
```jsx
                    {Object.entries(screenConfig.screens || {}).sort(([, a], [, b]) => a.label.localeCompare(b.label)).map(([key]) => (
                      <TableCell key={key} className="text-center">
                        <TvStatus menuId={menu.id} screenKey={key} />
                      </TableCell>
                    ))}
```

- [ ] **Step 8: Add ScreenManager above menu table**

Add after line 200 (closing `</div>` of the header section with buttons) and before line 202 (empty state check):

```jsx
      <ScreenManager
        screens={screenConfig.screens || {}}
        menus={menus}
      />
```

- [ ] **Step 9: Add stale reference cleanup on menu delete**

Update `onDelete` handler (lines 72-79) to:

```js
  const onDelete = async (menu) => {
    try {
      await deleteMenu(restaurantId, menu.id)
      const stale = Object.entries(screenConfig.screens || {})
        .filter(([, s]) => s.menuId === menu.id)
        .map(([key]) => key)
      await Promise.all(stale.map((key) => clearScreen(restaurantId, key)))
      toast.success(`Menu "${menu.name}" deleted`)
    } catch (e) {
      toast.error(e.message)
    }
  }
```

- [ ] **Step 10: Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.

---
### Task 4: Headers Cleanup

**Files:**
- Modify: `admin-dashboard/src/App.jsx`
- Modify: `admin-dashboard/src/components/AdminDashboard.jsx`

- [ ] **Step 1: Remove TV link section from App.jsx owner header**

Current code (around lines 99-110 in App.jsx) has a `<div className="hidden sm:flex items-center gap-3 text-xs">` block with `{[1, 2].map(...)}`. Delete that entire `<div>...</div>` block.

The resulting header right side should just have: user email + Sign Out button.

- [ ] **Step 2: Remove TV link section from AdminDashboard.jsx admin header**

Same pattern around lines 189-199 in AdminDashboard.jsx. Delete the `<div className="hidden sm:flex items-center gap-3 text-xs">` block entirely.

- [ ] **Step 3: Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.

---
### Task 5: Build Verification

- [ ] **Step 1: Build admin-dashboard**

Run: `cd admin-dashboard && npm run build`
Expected: Clean build, no errors

- [ ] **Step 2: Build tv-display**

Run: `cd tv-display && npm run build`
Expected: Clean build, no errors

- [ ] **Step 3: Verify useMenuData.js reads correct path**

Run: `rg 'screens\?\.\[screenId\]\?\.menuId' tv-display/src/hooks/useMenuData.js`
Expected: Match found on the config listener line

---
### Self-Review

**Spec coverage check:**
- Data model with auto IDs and label/menuId objects → Task 1 (API) + Task 3 (MenuList)
- ScreenManager UI (list, add, remove, copy) → Task 2
- Dynamic table columns → Task 3 (steps 6-7)
- Stale reference cleanup → Task 3 (step 9)
- Headers removed → Task 4
- TV display backward compat → Task 5 (step 3, pre-existing code)
- addScreen uses setDoc with merge → Task 1 (step 3)
- deleteField dot-path syntax → Task 1 (steps 2, 4)
- activeMenuId freeze → acknowledged in spec, no code change needed

**Placeholder scan:** All steps contain real code — no TBD, no "similar to", no vague instructions.

**Type consistency:** Task 1 api functions use `screenId` param name consistently. Task 2 ScreenManager passes `screenId` to `removeScreen`. Task 3 TvStatus uses `screenKey` prop (matches existing naming in MenuList). All aligned.
