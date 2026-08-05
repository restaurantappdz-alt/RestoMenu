/**
 * Regenerates the layout thumbnails in tv-display/public/layout-shots.
 *
 * The shot list comes from shared/layouts/capabilities.js (single source of
 * truth for layout ids). Shots render via the TV app's ?demo=1 mode, which
 * shows fixture data without Firebase.
 *
 * Prereqs:
 *   1. Build + serve the TV app:
 *        cd ../../tv-display && npm install && npm run build && npm run preview
 *      (vite preview serves on http://localhost:4173 with base /RestoMenu/)
 *   2. From THIS folder:
 *        npm install && npm run shoot
 *
 * Usage:
 *   node shoot.mjs [baseUrl] [outDir]
 *   default baseUrl: http://localhost:4173/RestoMenu/
 *   default outDir : ../../tv-display/public/layout-shots
 *
 * Uses the installed Chrome when available (channel: 'chrome'), otherwise
 * the Playwright-bundled Chromium.
 */
import { chromium } from 'playwright'
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { LAYOUT_CAPABILITIES } from '../../shared/layouts/capabilities.js'

const here = dirname(fileURLToPath(import.meta.url))
const baseUrl = `${(process.argv[2] || 'http://localhost:4173/RestoMenu/').replace(/\/$/, '')}/`
const outDir = resolve(process.argv[3] || `${here}/../../tv-display/public/layout-shots`)

const VIEWPORT = { width: 1280, height: 720 }
const layoutIds = Object.keys(LAYOUT_CAPABILITIES)

mkdirSync(outDir, { recursive: true })

let browser
try {
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true })
    console.log('Using installed Chrome.')
  } catch {
    browser = await chromium.launch({ headless: true })
    console.log('Using Playwright Chromium.')
  }

  const page = await browser.newPage({ viewport: VIEWPORT })
  const failures = []

  for (const id of layoutIds) {
    const url = `${baseUrl}?demo=1&layout=${id}`
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
      await page.waitForSelector(`[data-layout="${id}"]`, { timeout: 15000 })
      await page.waitForTimeout(1500)
      await page.screenshot({ path: `${outDir}/${id}.jpg`, type: 'jpeg', quality: 82 })
      console.log(`OK ${id} -> ${outDir}\\${id}.jpg`)
    } catch (err) {
      failures.push(id)
      console.error(`FAIL ${id}: ${String(err.message).split('\n')[0]}`)
    }
  }

  await browser.close()

  // Rewrite layouts.json so the mobile app's cache-busting version tracks
  // the freshly generated shots (same bytes => same version => cache hit).
  const version = contentVersion(outDir)
  const existing = readIndex(outDir)
  writeFileSync(
    resolve(outDir, 'layouts.json'),
    JSON.stringify(
      {
        version,
        layouts: layoutIds.map((id) => ({
          id,
          name: LAYOUT_CAPABILITIES[id].name,
          image: `/RestoMenu/layout-shots/${id}.jpg?v=${version}`,
          ...(existing[id]?.capabilities
            ? { capabilities: existing[id].capabilities }
            : {}),
        })),
      },
      null,
      2,
    ),
  )
  console.log(`layouts.json version=${version} (${layoutIds.length} entries)`)

  if (failures.length) {
    console.error(`Failed ${failures.length}/${layoutIds.length}: ${failures.join(', ')}`)
    process.exit(1)
  }
  console.log(`Done - ${layoutIds.length} shots regenerated.`)
  process.exit(0)
} catch (err) {
  console.error(`Fatal: ${err.message}`)
  process.exit(1)
}

/** Content hash of every .jpg in dir — new bytes => new version. */
function contentVersion(dir) {
  const hash = createHash('sha256')
  const files = readdirSync(dir).filter((f) => f.endsWith('.jpg')).sort()
  for (const f of files) {
    hash.update(f)
    hash.update(readFileSync(resolve(dir, f)))
  }
  return hash.digest('hex').slice(0, 12)
}

/** Reads the existing index (preserves capabilities blocks), if any. */
function readIndex(dir) {
  try {
    const parsed = JSON.parse(readFileSync(resolve(dir, 'layouts.json'), 'utf8'))
    return (parsed.layouts || []).reduce((map, l) => {
      map[l.id] = l
      return map
    }, {})
  } catch {
    return {}
  }
}
