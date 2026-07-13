### Task 3: MenuList Integration

**Files:**
- Modify: `admin-dashboard/src/components/MenuList.jsx`

**Context:** The file currently has the old numbered-screen approach. You need to apply all 9 edits below. Each edit shows the exact old text to find and the new text to replace it with.

**Interfaces:**
- Consumes: `ScreenManager` component (from Task 2), updated `assignMenuToScreen`/`clearScreen` API (from Task 1)
- Produces: Full menu view with ScreenManager above table + dynamic TV columns from `screens` map

- [ ] **Edit 1: Import ScreenManager**

Find:
```
import MenuEditor from './MenuEditor'
```
Replace with:
```
import MenuEditor from './MenuEditor'
import ScreenManager from './ScreenManager'
```

- [ ] **Edit 2: Fix default screenConfig state**

Find:
```
  const [screenConfig, setScreenConfig] = useState({ screens: { "1": null, "2": null } })
```
Replace with:
```
  const [screenConfig, setScreenConfig] = useState({ screens: {} })
```

- [ ] **Edit 3: Fix snapshot normalization**

Find:
```
    const unsub = onDisplayConfigSnapshot(restaurantId, (data) => {
      const screens = data.screens || { "1": null, "2": null }
      setScreenConfig({ ...data, screens })
    })
```
Replace with:
```
    const unsub = onDisplayConfigSnapshot(restaurantId, (data) => {
      const screens = data.screens || {}
      setScreenConfig({ ...data, screens })
    })
```

- [ ] **Edit 4: Fix onDelete with stale reference cleanup**

Find:
```
  const onDelete = async (menu) => {
    try {
      await deleteMenu(restaurantId, menu.id)
      toast.success(`Menu "${menu.name}" deleted`)
    } catch (e) {
      toast.error(e.message)
    }
  }
```
Replace with:
```
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

- [ ] **Edit 5: Fix TvStatus data read**

Find:
```
    const isLive = screenConfig.screens?.[screenKey] === menuId
```
Replace with:
```
    const isLive = screenConfig.screens?.[screenKey]?.menuId === menuId
```

- [ ] **Edit 6: Fix TvStatus button text**

Find:
```
        Set TV{screenKey}
```
Replace with:
```
        Set
```

- [ ] **Edit 7: Fix table header labels**

Find:
```
                {Object.keys(screenConfig.screens || {}).sort().map((key) => (
                  <TableHead key={key} className="text-center">TV {key}</TableHead>
                ))}
```
Replace with:
```
                {Object.entries(screenConfig.screens || {}).sort(([, a], [, b]) => a.label.localeCompare(b.label)).map(([key, screen]) => (
                  <TableHead key={key} className="text-center">{screen.label}</TableHead>
                ))}
```

- [ ] **Edit 8: Fix table body cells sort order**

Find:
```
                    {Object.keys(screenConfig.screens || {}).sort().map((key) => (
                      <TableCell key={key} className="text-center">
                        <TvStatus menuId={menu.id} screenKey={key} />
                      </TableCell>
                    ))}
```
Replace with:
```
                    {Object.entries(screenConfig.screens || {}).sort(([, a], [, b]) => a.label.localeCompare(b.label)).map(([key]) => (
                      <TableCell key={key} className="text-center">
                        <TvStatus menuId={menu.id} screenKey={key} />
                      </TableCell>
                    ))}
```

- [ ] **Edit 9: Add ScreenManager above menu table**

Find (the closing `</div>` of the header section, just before the menus empty check):
```
      </div>

      {menus.length === 0 ? (
```
Replace with:
```
      </div>

      <ScreenManager
        screens={screenConfig.screens || {}}
        menus={menus}
      />

      {menus.length === 0 ? (
```

- [ ] **Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.
