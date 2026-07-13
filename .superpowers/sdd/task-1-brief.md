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
