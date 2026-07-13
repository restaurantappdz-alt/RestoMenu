# RestoMenu Web — Digital Restaurant Menu System

A premium web app for restaurant menu management. Admin dashboard (React + shadcn/ui) with real-time TV display (Firebase Firestore).

---

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Admin UI:** shadcn/ui (Radix primitives) + lucide-react + sonner
- **Backend:** Firebase (Firestore + Auth + Hosting)
- **Real-time:** Firestore `onSnapshot()`
- **Theme:** Dark slate with Gold (#D4AF37) accent

---

## Prerequisites

- **Node.js 18+** and **npm**
- **Firebase account** — project `restomenu2`
- **Firebase CLI** — `npm install -g firebase-tools`

---

## Firebase Setup

### 1. Create Firebase Project

Already created: **restomenu2**

### 2. Enable Firestore Database

1. Open [Firebase Console](https://console.firebase.google.com/project/restomenu2/firestore)
2. Click **Create database**
3. Choose **Start in test mode**
4. Select a region (e.g., `eur3`)

### 3. Enable Authentication

1. Go to **Authentication** → **Sign-in method**
2. Click **Email/Password** → **Enable** → **Save**
3. Go to **Users** tab → **Add user**
4. Create: `owner@restomenu.com` / `password123`

### 4. Deploy Firestore Rules

```bash
cd ~/Programing/Restmenu-web
firebase deploy --only firestore:rules
```

---

## Project Structure

```
Restmenu-web/
├── admin-dashboard/        # Admin panel (Vite + React + shadcn/ui)
│   ├── src/
│   │   ├── App.jsx         # Auth guard + layout
│   │   ├── firebase.js     # Firebase config
│   │   ├── api.js          # Firestore CRUD
│   │   ├── seedDefault.js
│   │   ├── components/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── MenuList.jsx
│   │   │   ├── MenuEditor.jsx
│   │   │   ├── CategorySection.jsx
│   │   │   ├── ItemRow.jsx
│   │   │   ├── AddonRow.jsx
│   │   │   ├── TVPreview.jsx
│   │   │   └── ui/         # shadcn components
│   │   └── lib/utils.js
│   └── package.json
│
├── tv-display/             # TV frontend (Vite + React)
│   ├── src/
│   │   ├── App.jsx         # Real-time menu display
│   │   └── firebase.js     # Firebase config
│   └── package.json
│
├── firebase.json           # Hosting config
├── .firebaserc             # Project alias
├── firestore.rules         # Security rules
└── README.md
```

---

## Local Development

### 1. Install Dependencies

```bash
# Admin Dashboard
cd ~/Programing/Restmenu-web/admin-dashboard
npm install

# TV Display
cd ~/Programing/Restmenu-web/tv-display
npm install
```

### 2. Run Locally

Open **two terminal windows:**

```bash
# Terminal 1 — Admin Dashboard (port 5173)
cd ~/Programing/Restmenu-web/admin-dashboard
npm run dev

# Terminal 2 — TV Display (port 5174)
cd ~/Programing/Restmenu-web/tv-display
npm run dev
```

### 3. Open in Browser

- **Admin Dashboard:** http://localhost:5173
- **TV Display:** http://localhost:5174

### 4. Login

Use the credentials created in Firebase Console:
- Email: `owner@restomenu.com`
- Password: `password123`

### 5. Seed Data

1. Login to the admin dashboard
2. Click **"Seed Default"** — creates "Sandwich N'delda" menu
3. Click **"Display on TV"** on the menu row
4. Open the TV display — it will auto-update in real-time

---

## Deploy

### Admin Dashboard — Firebase Hosting

```bash
cd admin-dashboard && npm run build
cd ..
firebase deploy --only hosting:admin
```

### TV Display — GitHub Pages

Pushes to `main` that touch `tv-display/**` or `.github/workflows/deploy-tv.yml` trigger the GitHub Action at `.github/workflows/deploy-tv.yml`, which builds `tv-display/` and deploys it to GitHub Pages.

To trigger manually: **Actions → Deploy TV display to GitHub Pages → Run workflow**.

**One-time repo setup:** Go to **Settings → Pages → Build and deployment → Source → GitHub Actions**.

### Access Live

- **Admin Dashboard:** https://restomenu2.web.app
- **TV Display:** https://restaurantappdz-alt.github.io/RestoMenu/

> **Note:** The admin dashboard deploys to Firebase Hosting. The TV display deploys to GitHub Pages via GitHub Actions (`.github/workflows/deploy-tv.yml`).

---

## How It Works

### Admin Flow
1. Sign in with email/password
2. If no restaurant exists yet, name your restaurant (creates a `restaurants/{id}` doc)
3. View all menus for your restaurant in a table
4. Create/edit menus with categories, items, and add-ons
5. Click **"Display on TV"** to select which menu shows on the TV
6. Copy your restaurant's unique TV link from the header to configure the TV
7. TV Preview tab shows exactly what customers see

### TV Display Flow
1. TV loads with `?r={restaurantId}` in the URL, cached in `localStorage`
2. `onSnapshot(restaurants/{restaurantId}/config/display)` listens for `activeMenuId` changes
3. When admin selects a menu → TV detects the change instantly
4. `onSnapshot(restaurants/{restaurantId}/menus/{activeMenuId})` renders the menu in real-time
5. If network fails → displays cached menu with "Offline Mode" badge
6. No scrolling — full 16:9 layout with glassmorphism cards

### Firestore Data Model

```
Collection: restaurants/
  { auto-id }
    ownerUid: string
    name: string
    createdAt: timestamp

  Collection: restaurants/{restaurantId}/menus/
    { auto-id }
      name: string
      categories: array
        [{ name, items: [{ name, price }], addons: [{ name, price }] }]
      selectedLayout: string
      createdAt: timestamp

  Document: restaurants/{restaurantId}/config/display
    activeMenuId: string | null
    updatedAt: timestamp
```

---

## Security Rules

Current rules (in `firestore.rules`):
- **Read:** Anyone can read menus and config
- **Write:** Only authenticated users can modify
- **Delete:** Only authenticated users can delete

> **Note:** The current rules only cover the old root-level paths (`/menus/{menuId}` and `/config/{docId}`). After switching to the nested structure under `restaurants/{restaurantId}/`, these rules must be updated to match the new paths with an `ownerUid` check. This is a separate task.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Firebase: Error (auth/operation-not-allowed)` | Enable Email/Password auth in Firebase Console |
| Firestore permission denied | Deploy rules: `firebase deploy --only firestore:rules` |
| Port already in use | Kill the process or change port in `vite.config.js` |
| TV shows "Waiting for Menu" | Click "Display on TV" on any menu in admin dashboard |
| Blank screen on deploy | Run `npm run build` before `firebase deploy` |
