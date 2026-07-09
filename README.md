# RestoMenu

Digital TV menu display + admin dashboard.

## Project Structure

```
restomenu-web/
├── admin-dashboard/   # React admin app (shadcn/ui, Firebase Auth)
├── tv-display/        # React TV display app (public-facing)
└── README.md
```

## Adding a New Layout

1. Create `tv-display/src/layouts/LayoutMyNew.jsx`
   - Use inline styles or Tailwind (no Classic-specific CSS classes)
   - Export as default. Props: `{ categories, allAddons, offline, menu, title }`
2. Register in `layouts/index.js`:
   - Import the component
   - Add entry to `layouts` object and `layoutOptions` array
3. Add option in `MenuEditor.jsx` `LAYOUT_OPTIONS` array
4. Build both apps and verify
