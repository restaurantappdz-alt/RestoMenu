/**
 * Layout Capabilities Registry
 *
 * Describes what data each layout supports. Apps (TV, mobile, admin) can
 * query this to understand what a layout can display without knowing its
 * internals.
 *
 * When adding a new layout:
 * 1. Create the component
 * 2. Add its capabilities entry below
 * 3. The app will now know what data to send it
 */

const DEFAULT_CAPABILITIES = {
  maxItems: null,
  itemAreaPx: null,
  categoryHeaderPx: null,
  itemHeightPx: null,
  columns: 1,
  supportsDescriptions: false,
  supportsTags: false,
  supportsHeroPhoto: false,
  supportsItemImages: false,
  supportsAddons: false,
  supportsCategoryHeaders: true,
  displayMode: 'full-menu',
  hasHeader: true,
  hasFooter: false,
}

export const LAYOUT_CAPABILITIES = {
  classic: {
    ...DEFAULT_CAPABILITIES,
    name: 'Classic Gold',
    itemAreaPx: 792,
    categoryHeaderPx: 144,
    itemHeightPx: 72,
    supportsAddons: 'sidebar',
  },
  bistro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Bistro Chalkboard',
    itemAreaPx: 850,
    categoryHeaderPx: 104,
    itemHeightPx: 68,
    supportsAddons: 'footer',
  },
  brasserie: {
    ...DEFAULT_CAPABILITIES,
    name: 'Brasserie',
    itemAreaPx: 672,
    categoryHeaderPx: 66,
    itemHeightPx: 42,
    columns: 2,
    supportsAddons: 'sidebar',
  },
  coffeeShop: {
    ...DEFAULT_CAPABILITIES,
    name: 'Coffee Shop',
    itemAreaPx: 780,
    categoryHeaderPx: 100,
    itemHeightPx: 44,
    columns: 2,
  },
  minimal: {
    ...DEFAULT_CAPABILITIES,
    name: 'Minimal',
    itemAreaPx: 830,
    categoryHeaderPx: 90,
    itemHeightPx: 46,
    columns: 2,
  },
  modern: {
    ...DEFAULT_CAPABILITIES,
    name: 'Modern',
    itemAreaPx: 860,
    categoryHeaderPx: 82,
    itemHeightPx: 50,
    columns: 3,
  },
  moroccan: {
    ...DEFAULT_CAPABILITIES,
    name: 'Moroccan',
    itemAreaPx: 800,
    categoryHeaderPx: 96,
    itemHeightPx: 44,
    columns: 2,
    supportsAddons: 'footer',
  },
  natureBistro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Nature Bistro',
    itemAreaPx: 780,
    categoryHeaderPx: 88,
    itemHeightPx: 40,
    columns: 2,
    supportsAddons: 'sidebar',
  },
  pro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Pro Premium',
    itemAreaPx: 680,
    categoryHeaderPx: 46,
    itemHeightPx: 52,
    columns: 2,
    supportsAddons: 'sidebar',
  },
  photoMenu: {
    ...DEFAULT_CAPABILITIES,
    name: 'Photo Menu',
    maxItems: 8,
    supportsDescriptions: true,
    supportsTags: true,
    supportsHeroPhoto: true,
    displayMode: 'single-category',
    hasFooter: true,
  },
}

export function getLayoutCapabilities(layoutKey) {
  const caps = LAYOUT_CAPABILITIES[layoutKey]
  if (!caps) return { ...DEFAULT_CAPABILITIES, name: layoutKey }
  return { ...caps }
}

export function getLayoutOptionalFields(layoutKey) {
  const caps = getLayoutCapabilities(layoutKey)
  const fields = []
  if (caps.supportsDescriptions) fields.push({ field: 'items[].description', type: 'string', desc: 'Item description (short paragraph)' })
  if (caps.supportsTags) fields.push({ field: 'items[].tag', type: 'string', desc: 'Item tag/badge (e.g. "Best Seller", "Spicy")' })
  if (caps.supportsHeroPhoto) {
    fields.push({ field: 'heroImageUrl', type: 'string', desc: 'URL to hero dish photo' })
    fields.push({ field: 'heroName', type: 'string', desc: 'Hero dish name (falls back to menu name)' })
    fields.push({ field: 'heroDescription', type: 'string', desc: 'Hero dish description' })
    fields.push({ field: 'heroLabel', type: 'string', desc: 'Hero label (e.g. "Chef\'s Recommendation")' })
    fields.push({ field: 'heroPrice', type: 'number', desc: 'Hero dish price' })
  }
  if (caps.supportsItemImages) fields.push({ field: 'items[].imageUrl', type: 'string', desc: 'Item photo URL' })
  return fields
}

/**
 * Compute the maximum number of items a layout can display without overflowing.
 *
 * Uses pixel budgets: itemAreaPx is the total height available for rendering
 * categories and items. Each category consumes categoryHeaderPx, then each
 * item row consumes itemHeightPx / columns (since multi-column layouts fit
 * more items per row).
 *
 * @param {string} layoutKey - Layout identifier
 * @param {number} categoryCount - Number of categories in the menu
 * @returns {number} Maximum items that fit on screen, or null if unlimited
 */
export function getMaxItems(layoutKey, categoryCount) {
  const caps = LAYOUT_CAPABILITIES[layoutKey]
  if (!caps) return null

  // Layouts with hard-coded maxItems (e.g. PhotoMenu) skip the pixel math
  if (caps.maxItems != null) return caps.maxItems

  // Layouts without pixel budgets have no limit
  if (caps.itemAreaPx == null || caps.categoryHeaderPx == null || caps.itemHeightPx == null) {
    return null
  }

  const headersCost = categoryCount * caps.categoryHeaderPx
  const remaining = caps.itemAreaPx - headersCost
  const max = Math.floor(remaining / caps.itemHeightPx)

  return Math.max(0, max)
}
