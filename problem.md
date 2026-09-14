# QR Multi-Menu Issues & Technical Debt

This document records the four identified issues causing multi-menu QR code problems across RestoMenuAdminMobile and RestoMenuWeb, to be addressed in upcoming fixes.

---

## 1. ⚠️ Certain Layouts Hardcode or Cap Items (The Biggest Trap)

If you select certain layouts, the code is programmed to drop extra categories or stop after a small number of items:

### Photo Menu (`photoMenu`)
In `shared/layouts/LayoutPhotoMenu.jsx` (lines 204–206):
```javascript
// Single-category display: only show items from the first category
const items = categories[0]?.items || []
const slicedItems = items.slice(0, capabilities.maxItems)
```
* **Problem:** This layout deliberately ignores all categories except the very first one (`categories[0]`). If you pick `Photo Menu`, all items from the second menu are discarded.

### Photo Grid (`photoGrid`) & Digital Board (`digitalBoard`)
In `shared/layouts/LayoutPhotoGrid.jsx` and `LayoutDigitalBoard.jsx`:
```javascript
if (allItems.length >= capabilities.maxItems) break // maxItems is 8
```
* **Problem:** They only show up to 8 items total. If your first menu already has 8 items, the second menu’s items will never appear.

### Parchment (`parchment`)
* **Problem:** Similarly caps items at 10 total (`maxItems: 10`).

> **Layouts that support all items:** Layouts like **Classic Gold**, **Bistro**, **Brasserie**, **Coffee Shop**, **Modern**, and **Pro** do render all categories and items without an 8-item cut-off.

---

## 2. 🔍 The QR Link vs. Firestore Desync (`phoneMenuIds`)

In the Flutter mobile app (`QrMenuStyleScreen.dart`):
When you generate the QR code, the app saves two things to Firestore (`restaurants/{id}/config/display`):
1. `phoneMenuLayout`: the selected layout.
2. `phoneMenuIds`: the list of selected menu IDs.

However, in the web app (`useAllMenus.js`):
* The website listens to `restaurants/{id}/config/display`, but it only updates `phoneMenuLayout`.
* **It completely ignores `phoneMenuIds` in Firestore.**
* Instead, it relies strictly on the URL query parameter `&m=id1,id2`.

### Why this explains the first-attempt failure:
* If you previously had a link/QR code that was generated with only one menu, scanning or opening that old link still sent `&m=menu1`.
* Even if you updated your selection in the mobile app, the old link/QR code will continue to only show the first menu because the website doesn't read the updated `phoneMenuIds` from Firestore.
* Only when you generated a brand new QR code (or freshly clicked "Copy Link" / "Share") did the URL get updated to `&m=id1,id2`, which is why it worked on your subsequent attempt.

---

## 3. 🧹 Empty Menu Filter (`combineMenus`)

In `tv-display/src/menuCombiner.js`:
```javascript
export function combineMenus(menus) {
  return (menus || []).filter((menu) =>
    (menu.categories || []).some((c) => (c.items || []).length > 0)
  )
}
```
* **Problem:** If the second menu had no items in its categories at the exact moment you tested (or if Firestore hadn't finished writing the second menu's items), `combineMenus` drops that menu completely.

---

## 4. 🗂️ Categories with the Same Name Are Not Merged

In `PhoneMenuPage.jsx`:
```javascript
const allCategories = useMemo(
  () => combined.map((menu) => menu.categories || []).flat(),
  [combined],
)
```
* **Problem:** If Menu 1 has a category called `"Boissons"` and Menu 2 also has a category called `"Boissons"`, they are not merged together. Instead, the page renders two separate `"Boissons"` sections one after the other.

---

## 5. 📺 TV Screen Menu Conflicts & Missing Schedule Overlap Validation

Unlike the phone QR code (which merges multiple menus into one page), a TV screen display is architected to render **only one menu document at a time**. Assigning multiple menus to a single TV screen was designed strictly for **day/time scheduling** (e.g., Breakfast from 07:00–11:30, Lunch from 11:30–17:00).

### What is broken:
1. **Unconnected Overlap Validation:**
   * A conflict detection helper `checkScheduleOverlap()` already exists in `lib/utils/menu_schedule.dart`, but it is **never called anywhere in the app** (`MenuCard` or `ScreenScheduleEditorSheet`).
   * As a result, users can assign multiple menus with overlapping hours or days to the same screen without any warning or error.
2. **Multiple "Always Show" Menus on the Same TV:**
   * The app allows assigning two or more menus set to "Always show" (no schedule) on the same TV screen.
   * On the TV web app (`useMenuData.js` -> `resolveMenuId`), it simply takes the first unscheduled menu in the list (`ids[0]`), so the second menu is permanently starved and never shown.
3. **Misleading "ON AIR" Badges in Mobile UI:**
   * In `MenuCard.dart`, both menus display the golden `"ON AIR"` badge for that screen, and the Screens tab says `Screen 1: Menu 1, Menu 2`, falsely implying both menus are active on the TV at the same time.

### Solution needed:
* Connect `checkScheduleOverlap` in `SchedulePickerSheet` and `ScreenScheduleEditorSheet` to block or warn on overlapping schedules.
* Prevent assigning multiple "Always show" menus to the same screen (assigning a new "Always show" menu should replace the existing one, or require time scheduling).
* Only show the `"ON AIR"` badge on the menu that is *currently active* based on the schedule and current time.



---

## 6. 🎭 Random & Fallback Emoji Injections in Food / Category Names

Several layouts inject random or fallback emojis into dish names and category headers.

### Decision:
* **Remove all emojis** from these layouts.
* **Do NOT add photos** to layouts that were meant to be text-only; keep photos **only** on layouts that are already designed for photos.
* Simply display clean food and category names without any injected emojis.

### Layouts with Emoji Injections to Fix:
1. **`LayoutModern.jsx` (Lines 3, 39, 146, 163):**
   * Prepend an emoji from a 15-food cycling array (`['🥐', '☕', '🥗', '🍳', ...]`) to any dish without an image.
   * **Fix:** Remove `EMOJIS` array and emoji prepending; render `{item.name}` cleanly.
2. **`LayoutBrasserie.jsx` (Line 36):**
   * Injects a fork & knife emoji `🍽️` before every dish that lacks a photo.
   * **Fix:** Remove the emoji fallback; return `null` if no photo exists.
3. **`LayoutMoroccan.jsx` (Line 16):**
   * Injects a salad emoji `🥗` before every dish that lacks a photo (even for steaks, tagines, and drinks).
   * **Fix:** Remove the emoji fallback; return `null` if no photo exists.
4. **`LayoutPro.jsx` (Lines 3–43, 226–228):**
   * Automatically scans category names against 29 keyword substrings to inject emojis (`☕`, `🍔`, `🍕`, `🔥`, `🍽️`).
   * **Fix:** Remove the keyword emoji dictionary and render `{cat.name}` cleanly.
5. **`LayoutNatureBistro.jsx` (Line 239):**
   * Wraps all category headers with leaf emojis (`<h2>🌿 {cat.name} 🌿</h2>`).
   * **Fix:** Remove `🌿` leaves from the header.

---

## 7. 📱 Layouts Not Optimized for Phone QR Code

Five layouts are not properly adapted for phone screens in QR code mode (`?phone=1`):

### 1. Digital Board Grid (`digitalBoard` — `LayoutDigitalBoard.jsx`)
* **What is broken on phone:**
  * Flattens all items and **drops all category headers completely** (`supportsCategoryHeaders: false`).
  * Hardcoded **8-item cap** (`slice(0, 8)`): items 9+ are discarded.
  * In portrait mode, card wrappers for 5 and 7 items lack the `.layout-digital-board-card` class, causing broken card dimensions.
* **Phone Optimization needed:**
  * Retain category separation and headers when viewed on a phone.
  * Remove the 8-item cut-off so customers can scroll through all available dishes.

### 2. Parchment Tradition (`parchment` — `LayoutParchment.jsx`)
* **What is broken on phone:**
  * Hardcoded **10-item cap** (`slice(0, 10)`).
  * Flattens all items and **drops all category headers** (never renders `cat.name`).
  * Dishes in the menu card are text-only; photos are pulled into detached side galleries that inject **fake Unsplash photos** of couscous/tagine if fewer than 5 photos exist.
  * Card inner wrapper retains `h-full` and `justify-evenly`, causing compressed text on mobile.
* **Phone Optimization needed:**
  * Show category headers and full item list without a 10-item cap.
  * Stop injecting fake stock photos.

### 3. Photo Grid (`photoGrid` — `LayoutPhotoGrid.jsx`)
* **What is broken on phone:**
  * Hardcoded **8-item cap** (`slice(0, 8)`).
  * Flattens all items and **drops all category headers**.
  * If a dish has no photo, it injects **fake Unsplash stock photos** of mint tea, waffles, and pastries.
  * Has no `onError` handler, so broken links display broken-image glyphs.
  * Intermediate wrapper `div` retains `h-full` in portrait.
* **Phone Optimization needed:**
  * Group items under category headers.
  * Remove 8-item cap to allow scrolling through all dishes.
  * Remove fake stock photo substitution and add graceful image error handling.

### 4. Photo Menu (`photoMenu` — `LayoutPhotoMenu.jsx`)
* **What is broken on phone:**
  * **Single-category lock:** Hardcoded to `categories[0]` only (lines 204–206). All categories from index 1 onward are completely discarded.
  * Dishes in the list are text-only; only the hero photo is rendered.
  * In portrait mode, the hero photo renders *below* the menu items instead of at the top.
* **Phone Optimization needed:**
  * Allow all categories to be displayed instead of only the first one.
  * Position the hero photo at the top of the mobile view as a header banner.

### 5. Brasserie (`brasserie` — `LayoutBrasserie.jsx`)
* **What is broken on phone:**
  * Menu items column has `maxWidth: clamp(500px, 55vw, 800px)`. On standard 360px–390px mobile screens, this forces a 500px minimum width, causing **horizontal overflow and cut-off text**.
  * Uses the fallback fork/knife emoji `🍽️` on dishes without photos.
* **Phone Optimization needed:**
  * Set `maxWidth: 100%` on mobile screens to prevent horizontal overflow.
  * Remove the fallback emoji.
