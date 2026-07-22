# Layout Shots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate 1280×720 JPEG screenshots of each of the 9 TV layout templates in empty state, serve them as static assets alongside the admin dashboard with a JSON index API.

**Architecture:** Playwright headless Chromium script renders each layout via the Vite dev server, screenshots at 1280×720 JPEG q0.8, saves to `admin-dashboard/public/layout-shots/`. A new `LayoutShotsPage` component renders a single layout with empty data when `?layout=` URL param is present, bypassing all auth. Vite bundles `public/` into `dist/` on build for Firebase Hosting deployment.

**Tech Stack:** React 18, Vite 6, Playwright, Firebase Hosting

## Global Constraints

- No React Router — use `URLSearchParams` for `?layout=` param routing
- `getLayout(key)` from `admin-dashboard/src/layouts/index.js` handles layout resolution — invalid keys default to Classic
- Layout components accept `{ categories, allAddons, offline, menu, title }` — pass empty data
- Vite base: `/RestoMenu/dashboard/`
- Dev server: `localhost:5173`
- Playwright output: JPEG quality 0.8, saved with `.jpg` extension (Playwright does not support WebP natively; JPEG achieves equivalent size goals)
- Playwright is a devDependency in `admin-dashboard/package.json`
- Output directory: `admin-dashboard/public/layout-shots/`

---

## File Structure

| File | Status | Responsibility |
|------|--------|----------------|
| `admin-dashboard/src/components/LayoutShotsPage.jsx` | **Create** | Renders a single empty layout at 16:9, no chrome |
| `admin-dashboard/src/App.jsx` | **Modify** | Early return check for `?layout=` param before auth |
| `scripts/generate-layout-shots.js` | **Create** | Playwright script: spawn dev server, screenshot 9 layouts, write JSON index |
| `admin-dashboard/package.json` | **Modify** | Add `playwright` devDep + `generate-shots` script |
| `admin-dashboard/public/layout-shots/` | **Create** | Output dir for screenshots + JSON (committed to git) |
| `admin-dashboard/vite.config.js` | No change | Already has `base: '/RestoMenu/dashboard/'` |

---

## Task Dependency Graph

```
Wave 1 (parallel):
  T1: LayoutShotsPage component  ────┐
  T2: Install Playwright              │ no deps
  T4: generate-layout-shots.js  ─────┤
  T5: Package.json scripts            │
                                     │
Wave 2 (after T1):
  T3: App.jsx routing  ◄──────────────┘ needs LayoutShotsPage to exist

Wave 3 (after T2, T3, T4, T5):
  T6: Generate + verify output
```

---

### Task 1: Create LayoutShotsPage component

**Files:**
- Create: `admin-dashboard/src/components/LayoutShotsPage.jsx`

**Interfaces:**
- Consumes: `getLayout(key)` from `../layouts` — returns a React component
- Produces: LayoutShotsPage component (default export)

**Acceptance Criteria:**
- Reads `?layout=` from URL, falls back to `'classic'` if missing/invalid
- Renders 16:9 container with black background, no admin chrome
- Passes empty data: `{ categories: [], allAddons: [], offline: false, menu: { name: 'Menu Name' }, title: 'Menu Name' }`
- Uses `getLayout()` for component resolution

- [ ] **Step 1: Create the component**

```jsx
import { getLayout } from '../layouts'

export default function LayoutShotsPage() {
  const params = new URLSearchParams(window.location.search)
  const layoutKey = params.get('layout') || 'classic'
  const LayoutComponent = getLayout(layoutKey)

  return (
    <div style={{ width: '100vw', height: '56.25vw', maxHeight: '100vh', overflow: 'hidden', background: '#000' }}>
      <LayoutComponent
        categories={[]}
        allAddons={[]}
        offline={false}
        menu={{ name: 'Menu Name' }}
        title="Menu Name"
      />
    </div>
  )
}
```

The 16:9 container uses `height: 56.25vw` (9/16 × 100) clamped to `100vh`. This fills the viewport at 1280×720 while scaling down on taller viewports. No CSS classes needed.

---

### Task 2: Install Playwright

**Files:**
- Modify: `admin-dashboard/package.json` (devDependencies)

- [ ] **Step 1: Install Playwright**

```bash
cd C:\Users\LAPWIZ\Desktop\coding\APP MENU\RestoMenuWeb\admin-dashboard
npm install -D playwright
npx playwright install chromium
```

- [ ] **Step 2: Verify installation**

```bash
cd C:\Users\LAPWIZ\Desktop\coding\APP MENU\RestoMenuWeb\admin-dashboard
npx playwright --version
```

Expected: prints version number (e.g., `1.52.0`)

---

### Task 3: Wire App.jsx to render LayoutShotsPage on `?layout=` param

**Files:**
- Modify: `admin-dashboard/src/App.jsx`

**Interfaces:**
- Consumes: `LayoutShotsPage` (default export from `./components/LayoutShotsPage`)

- [ ] **Step 1: Add import and early return**

Add at the top of `admin-dashboard/src/App.jsx`:

```jsx
import LayoutShotsPage from './components/LayoutShotsPage'
```

Then inside the `App` component, add this as the **very first check** before any state or auth logic:

```jsx
export default function App() {
  // --- Layout shots bypass (no auth, no Firebase) ---
  const lsParams = new URLSearchParams(window.location.search)
  if (lsParams.has('layout')) {
    return <LayoutShotsPage />
  }

  const [user, setUser] = useState(null)
  // ... rest of existing code unchanged ...
```

- [ ] **Step 2: Verify no regression**

Check that:
- `http://localhost:5173/?layout=classic` → renders Classic Gold layout with no nav/login
- `http://localhost:5173/?layout=invalid` → renders Classic (default fallback)
- `http://localhost:5173/` → normal auth flow (login page)

---

### Task 4: Create Playwright screenshot generator script

**Files:**
- Create: `scripts/generate-layout-shots.js`

**Interfaces:**
- Consumes: dev server at `http://localhost:5173/?layout={id}`
- Produces: `admin-dashboard/public/layout-shots/{id}.jpg` + `layouts.json`

- [ ] **Step 1: Create the script**

```js
import { chromium } from 'playwright'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const adminDir = path.resolve(rootDir, 'admin-dashboard')
const outputDir = path.resolve(adminDir, 'public', 'layout-shots')
const devUrl = 'http://localhost:5173'

const layouts = [
  { id: 'classic',      name: 'Classic Gold' },
  { id: 'bistro',       name: 'Bistro Chalkboard' },
  { id: 'brasserie',    name: 'Brasserie' },
  { id: 'coffeeShop',   name: 'Coffee Shop' },
  { id: 'minimal',      name: 'Minimal' },
  { id: 'modern',       name: 'Modern' },
  { id: 'moroccan',     name: 'Moroccan' },
  { id: 'natureBistro', name: 'Nature Bistro' },
  { id: 'pro',          name: 'Pro Premium' },
]

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch { /* server not ready yet */ }
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error(`Dev server did not start within ${timeoutMs}ms`)
}

async function main() {
  console.log('Starting admin-dashboard dev server...')
  const server = spawn('npm', ['run', 'dev'], {
    cwd: adminDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })
  server.stderr.on('data', d => process.stderr.write(d))

  try {
    await waitForServer(devUrl)
    console.log('Dev server ready.\n')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const browser = await chromium.launch()
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()

    for (const layout of layouts) {
      const url = `${devUrl}/?layout=${layout.id}`
      process.stdout.write(`  [${layout.id}] ${layout.name}... `)
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
        await page.waitForTimeout(3000) // let animations settle
        const filePath = path.join(outputDir, `${layout.id}.jpg`)
        await page.screenshot({ path: filePath, type: 'jpeg', quality: 0.8 })
        const stats = fs.statSync(filePath)
        console.log(`${(stats.size / 1024).toFixed(1)} KB ✓`)
      } catch (err) {
        console.log(`FAILED ✗`)
        console.error(`    ${err.message}`)
      }
    }

    await browser.close()

    // Write index JSON — use paths relative to the site base
    const index = {
      layouts: layouts.map(l => ({
        id: l.id,
        name: l.name,
        image: `/RestoMenu/dashboard/layout-shots/${l.id}.jpg`,
      })),
    }
    fs.writeFileSync(
      path.join(outputDir, 'layouts.json'),
      JSON.stringify(index, null, 2),
    )
    console.log(`\n✓ layouts.json written (${layouts.length} entries)`)

    // Summary
    const allFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'))
    const totalSize = allFiles.reduce(
      (sum, f) => sum + fs.statSync(path.join(outputDir, f)).size, 0
    )
    console.log(`Done. ${allFiles.length}/${layouts.length} screenshots, ${(totalSize / 1024).toFixed(0)} KB total`)
  } finally {
    server.kill()
    console.log('Dev server stopped.')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

**Edge case handling:**
- Output dir missing → created
- Dev server timeout → throws, exits non-zero
- Single layout fails → logged, continues to others
- Dev server killed in `finally` block on both success and failure

---

### Task 5: Update package configuration

**Files:**
- Modify: `admin-dashboard/package.json`

- [ ] **Step 1: Add generate-shots script**

```json
{
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview",
    "generate-shots": "node ../scripts/generate-layout-shots.js"
  }
}
```

The script runs from `admin-dashboard/` directory. `../scripts/` resolves to repo root's `scripts/`.

---

### Task 6: Generate and verify output

- [ ] **Step 1: Run the script**

```bash
cd C:\Users\LAPWIZ\Desktop\coding\APP MENU\RestoMenuWeb\admin-dashboard
npm run generate-shots
```

- [ ] **Step 2: Verify files exist**

```bash
Get-ChildItem -Path "C:\Users\LAPWIZ\Desktop\coding\APP MENU\RestoMenuWeb\admin-dashboard\public\layout-shots"
```

Expected:
```
classic.jpg
bistro.jpg
brasserie.jpg
coffeeShop.jpg
minimal.jpg
modern.jpg
moroccan.jpg
natureBistro.jpg
pro.jpg
layouts.json
```

- [ ] **Step 3: Verify JSON content**

```bash
Get-Content "C:\Users\LAPWIZ\Desktop\coding\APP MENU\RestoMenuWeb\admin-dashboard\public\layout-shots\layouts.json"
```

Expected: valid JSON with 9 layout entries, each with `id`, `name`, `image` fields.

- [ ] **Step 4: Spot-check screenshot sizes**

```bash
Get-ChildItem "C:\Users\LAPWIZ\Desktop\coding\APP MENU\RestoMenuWeb\admin-dashboard\public\layout-shots\*.jpg" | Select-Object Name, Length | Format-Table -AutoSize
```

Expected: each file 50-200 KB, total < 2 MB for all 9.

- [ ] **Step 5: Verify Vite build includes the files**

```bash
cd C:\Users\LAPWIZ\Desktop\coding\APP MENU\RestoMenuWeb\admin-dashboard
npm run build
Get-ChildItem -Path "dist/layout-shots"
```

Expected: `dist/layout-shots/` exists with all 9 JPGs + JSON.

---

## Commit Strategy

| # | Message | Files |
|---|---------|-------|
| 1 | `feat: add LayoutShotsPage with ?layout= URL param routing` | `admin-dashboard/src/components/LayoutShotsPage.jsx` (new), `admin-dashboard/src/App.jsx` (edit) |
| 2 | `feat: add Playwright screenshot generator script` | `scripts/generate-layout-shots.js` (new), `admin-dashboard/package.json` (edit) |
| 3 | `chore: add layout screenshot outputs` | `admin-dashboard/public/layout-shots/` (new directory) |

---

## Verification Checklist

- [ ] `npm run generate-shots` produces 9 JPGs + layouts.json
- [ ] `http://localhost:5173/?layout=classic` renders Classic Gold at 16:9, no chrome
- [ ] `http://localhost:5173/?layout=bistro` renders Bistro Chalkboard
- [ ] `http://localhost:5173/` still shows normal auth flow
- [ ] `npm run build` includes layout-shots/ in dist/
- [ ] Each screenshot < 200 KB, total < 2 MB
- [ ] layouts.json correctly lists all 9 layouts
