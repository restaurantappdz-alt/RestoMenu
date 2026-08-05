import { chromium } from 'playwright'
import { spawn, execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tvDir = path.resolve(__dirname, '..')
const outputDir = path.resolve(tvDir, 'public', 'layout-shots')
const devUrl = 'http://localhost:5174'

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
  { id: 'photoMenu',    name: 'Photo Menu' },
]

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok) return
    } catch { /* server not ready yet */ }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Dev server did not start within ${timeoutMs}ms`)
}

async function main() {
  console.log('Starting tv-display dev server...')
  const server = spawn('npm', ['run', 'dev'], {
    cwd: tvDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })
  server.stderr.on('data', (d) => process.stderr.write(d))

  try {
    await waitForServer(devUrl)
    console.log('Dev server ready.\n')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Preserve the mobile contract: keep existing capabilities blocks.
    const existingIndexPath = path.join(outputDir, 'layouts.json')
    let existing = {}
    try {
      const parsed = JSON.parse(fs.readFileSync(existingIndexPath, 'utf8'))
      existing = (parsed.layouts || []).reduce((map, l) => {
        map[l.id] = l
        return map
      }, {})
    } catch { /* no existing index — write fresh */ }

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
        await page.goto(url, { waitUntil: 'load', timeout: 15000 })
        await page.waitForTimeout(3000)
        const filePath = path.join(outputDir, `${layout.id}.jpg`)
        await page.screenshot({ path: filePath, type: 'jpeg', quality: 80 })
        const stats = fs.statSync(filePath)
        console.log(`${(stats.size / 1024).toFixed(1)} KB ✓`)
      } catch (err) {
        console.log(`FAILED ✗`)
        console.error(`    ${err.message}`)
      }
    }

    await browser.close()

    // Write index JSON
    const index = {
      layouts: layouts.map((l) => ({
        id: l.id,
        name: l.name,
        image: `/RestoMenu/layout-shots/${l.id}.jpg`,
        ...(existing[l.id]?.capabilities ? { capabilities: existing[l.id].capabilities } : {}),
      })),
    }
    fs.writeFileSync(
      path.join(outputDir, 'layouts.json'),
      JSON.stringify(index, null, 2),
    )
    console.log(`\n✓ layouts.json written (${layouts.length} entries)`)

    const allFiles = fs.readdirSync(outputDir).filter((f) => f.endsWith('.jpg'))
    const totalSize = allFiles.reduce(
      (sum, f) => sum + fs.statSync(path.join(outputDir, f)).size, 0
    )
    console.log(`Done. ${allFiles.length}/${layouts.length} screenshots, ${(totalSize / 1024).toFixed(0)} KB total`)
  } finally {
    // Kill the full process tree first (npm → Vite), THEN the shell — killing
    // the shell first orphans the vite child, which survives and keeps port 5174.
    try {
      execSync(`taskkill /F /T /PID ${server.pid} 2>nul`, { stdio: 'ignore' })
    } catch {}
    server.kill()
    console.log('Dev server stopped.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
