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
import { mkdirSync } from 'node:fs'
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
