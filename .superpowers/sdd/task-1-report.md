# Task 1 Report: API Layer

## Status
DONE

## Summary
Implemented `addScreen`, `removeScreen`, `assignMenuToScreen`, and `clearScreen` in `admin-dashboard/src/api.js` following the task specification.

### Changes Made
- **`assignMenuToScreen`** (line 91): Updated to use `screens.{screenId}.menuId` dot-path. Renamed `screenKey` param to `screenId`.
- **`clearScreen`** (line 98): Updated to use `screens.{screenId}.menuId` with `deleteField()`. Renamed `screenKey` param to `screenId`.
- **`addScreen`** (line 105): New function — generates 6-char ID via `crypto.randomUUID().slice(0, 6)`, writes to `screens.{id}: { label, menuId: null }` using `setDoc` with `{ merge: true }`.
- **`removeScreen`** (line 117): New function — deletes `screens.{screenId}` key entirely using `deleteField()`.

### Compliance with Global Constraints
- `addScreen` uses `setDoc` with `{ merge: true }` ✓
- `removeScreen` and `clearScreen` use dot-path key syntax with `deleteField()` ✓
- Screen IDs use `crypto.randomUUID().slice(0, 6)` — no external dependencies ✓

### Build Result
`npm run build` — **SUCCESS** (1700 modules transformed, built in 9.18s)
