### Task 4: Headers Cleanup

**Files:**
- Modify: `admin-dashboard/src/App.jsx`
- Modify: `admin-dashboard/src/components/AdminDashboard.jsx`

- [ ] **Edit 1: Remove TV link section from App.jsx owner header**

In `App.jsx`:
1. Delete the `<div className="hidden sm:flex items-center gap-3 text-xs">` block (contains `{[1, 2].map(...)}`)
2. Delete the line `const tvLink = ...` (contains `tvLink =`)
3. Remove `tvLink={tvLink}` from the `<RestaurantProvider` call

- [ ] **Edit 2: Remove TV link from AdminDashboard.jsx restaurant list**

In `AdminDashboard.jsx`, find the block that starts with `const tvLink = \`https://.../?r=${r.id}\`` and contains the clipboard copy button. Delete both the variable and the copy button JSX.

- [ ] **Edit 3: Remove TV link section from AdminDashboard.jsx selected-restaurant header**

In `AdminDashboard.jsx`:
1. Delete the `<div className="hidden sm:flex items-center gap-3 text-xs">` block (contains `{[1, 2].map(...)}`)
2. Delete the line `const tvLink = ...` (contains `tvLink = \`https://.../?r=${selectedRestaurant.id}`)
3. Remove `tvLink={tvLink}` from the `<RestaurantProvider` call

- [ ] **Verify build**

Run: `cd admin-dashboard && npm run build` — expect success.
