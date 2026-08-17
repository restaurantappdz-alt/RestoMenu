# RestoMenu Web — Digital Restaurant Menu System

The web side of **RestoMenu**: a real-time TV display app plus the canonical layout template library. All admin control happens in the **RestoMenuAdminMobile** Flutter app (restaurant & menu management, layout selection, subscriptions). This repo only serves what customers see.

---

## What Lives Here

| Path | Purpose |
|---|---|
| `tv-display/` | The public-facing TV display app (React + Vite + Tailwind). Deploys to GitHub Pages. |
| `shared/layouts/` | Canonical layout template source (10 layouts) + the pixel-budget capability registry. Consumed by the TV app via the `@layouts` Vite alias. |
| `shared/svgs/` | Shared image assets (e.g. plant overlays used by layouts). |
| `firebase.json` / `rtdb.rules.json` | Realtime Database security rules used by the subscription clock (`serverTimeCheck`) and the per-screen device lock (`tvLease`). Deploy with `firebase deploy --only database`. |
| `docs/` | Design documentation (capabilities system). |

> **No admin dashboard lives here anymore.** The web admin panel was removed in favor of the Flutter admin app (`RestoMenuAdminMobile`). The only writes to Firestore from this side are the anonymous RTDB writes (server time check + device lease); all menu/subscription data is written by the Flutter app.

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS (TV display)
- **Real-time:** Firestore `onSnapshot()` (menu + display config)
- **Hosting:** GitHub Pages (static, no server)
- **Theme:** Dark slate with Gold (#D4AF37) accent

---

## Project Structure

```
RestoMenuWeb/
├── tv-display/             # TV app (deploys to GitHub Pages)
│   ├── src/
│   │   ├── App.jsx         # Resolves layout via getLayout(selectedLayout)
│   │   ├── hooks/useMenuData.js   # Firestore data pipeline + offline cache
│   │   ├── subscriptionGuard.js   # Subscription expiry enforcement
│   │   ├── deviceLock.js          # Per-screen single-device lease (RTDB)
│   │   ├── PhoneMenuPage.jsx      # Phone/QR menu mode (?phone=1)
│   │   └── firebase.js            # Firebase config (project menu-85c70)
│   └── public/
│       ├── svgs/           # Cutlery/coffee pattern icons (loaded at runtime)
│       └── layout-shots/   # Layout previews + layouts.json (Layout Shots API)
├── shared/
│   ├── layouts/            # Canonical layout source (Vite alias @layouts)
│   └── svgs/               # Shared image assets
├── firebase.json           # RTDB rules config (project menu-85c70)
└── README.md
```

---

## TV Display Flow

1. TV loads with `?r={restaurantId}` (and optional `?s={screenId}`) in the URL, cached in `localStorage`.
2. `onSnapshot(restaurants/{restaurantId}/config/display)` resolves the active menu for the screen.
3. `onSnapshot(restaurants/{restaurantId}/menus/{activeMenuId})` renders the menu in real-time.
4. The layout is resolved via `getLayout(selectedLayout)` from `@layouts` (falls back to Classic).
5. `subscriptionGuard` enforces the subscription expiry (server-trusted clock via RTDB, fail-closed black screen when expired or unset).
6. `deviceLock` reserves each screen to a single device (RTDB lease with heartbeat).
7. If the network fails → renders the cached menu with an "Offline Mode" badge. Reloads on reconnect.
8. Phone mode (`?phone=1`) shows the QR menu — one merged layout, no device lock, no TV guard.

---

## Firestore Data Model (shared with the Flutter app)

```
Collection: restaurants/
  { auto-id }
    ownerUid: string
    name: string
    email: string
    phone: string
    availableLayouts: array
    activeUntil: timestamp        (subscription, mirrored from config/display)
    createdAt: timestamp

  Collection: restaurants/{restaurantId}/menus/
    { auto-id }
      name: string
      categories: array
        [{ name, items: [{ name, price, description?, tag?, imageUrl? }],
           addons: [{ name, price }] }]
      selectedLayout: string
      hero: { imageUrl, imagePublicId, name, description, label, price }
      createdAt: timestamp

  Document: restaurants/{restaurantId}/config/display
    activeMenuId: string | null
    screens: { [screenId]: { label, menuId } }
    phoneMenuIds: array          (QR mode; empty = all menus)
    phoneMenuLayout: string      (QR phone layout)
    expiresAt: timestamp         (admin-only write)
    updatedAt: timestamp
```

Menus and display config are **publicly readable** (the unauthenticated TV/QR pages need them); writes are owner-scoped, and `expiresAt` is admin-only — enforced by the Firestore rules in the **Flutter repo** (the authoritative rules file lives there).

---

## Layout Shots API

Static endpoint served from the TV app's `public/layout-shots/` folder:

```
GET https://screen.andalussmart.com/layout-shots/layouts.json
```

Returns all 10 layouts with `{ id, name, image, capabilities }`. The Flutter app fetches this to show users what each layout looks like before selecting it, and reads `capabilities` to adapt its editor fields. The shots ship with the TV app on every deploy, so the endpoint is always available.

---

## Local Development

```bash
cd tv-display
npm install
npm run dev        # http://localhost:5174
```

Preview a layout: `http://localhost:5174/?layout=classic` (use the `?layout=` query param).

Run the tests:

```bash
npm test           # Vitest suites (subscriptionGuard, deviceLock, menuCombiner, PhoneMenuPage, ...)
```

---

## Deploy

### TV Display — GitHub Pages

Pushes to `main` touching `tv-display/**`, `shared/**`, or `.github/workflows/deploy-tv.yml` trigger the GitHub Action (`.github/workflows/deploy-tv.yml`), which builds `tv-display/` and deploys to GitHub Pages.

```bash
git push origin main
```

Live: https://screen.andalussmart.com/

### RTDB Rules

The Realtime Database rules (`serverTimeCheck` clock + `tvLease` device lock) deploy to the `menu-85c70` project:

```bash
firebase deploy --only database
```

> **Warning:** do NOT deploy Firestore rules from this repo — the authoritative `firestore.rules` lives in the Flutter repo (`RestoMenuAdminMobile`). Deploying Firestore from here would overwrite the strict security model with nothing.

---

## How It Works — Admin Flow (Flutter app)

1. Restaurant owner signs in with name + password (or signs up) in the **RestoMenuAdminMobile** app.
2. Creates menus with categories, items, and add-ons; picks a layout; assigns menus to TV screens.
3. Changes appear on the TV in real time via Firestore — no reprint, no restart.
4. Super-admins manage subscription expiry (`expiresAt`) from the app's admin dashboard.
