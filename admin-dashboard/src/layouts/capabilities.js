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
  categoryGapPx: 0,
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
    itemAreaPx: 647,
    categoryHeaderPx: 78,
    categoryGapPx: 36,
    itemHeightPx: 63,
    columns: 1,
    supportsAddons: 'sidebar',
  },
  bistro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Bistro Chalkboard',
    itemAreaPx: 756,
    categoryHeaderPx: 67,
    categoryGapPx: 48,
    itemHeightPx: 46,
    columns: 1,
    supportsAddons: 'footer',
  },
  brasserie: {
    ...DEFAULT_CAPABILITIES,
    name: 'Brasserie',
    itemAreaPx: 735,
    categoryHeaderPx: 66,
    categoryGapPx: 35,
    itemHeightPx: 42,
    columns: 2,
    supportsAddons: 'sidebar',
  },
  coffeeShop: {
    ...DEFAULT_CAPABILITIES,
    name: 'Coffee Shop',
    itemAreaPx: 632,
    categoryHeaderPx: 78,
    categoryGapPx: 38,
    itemHeightPx: 47,
    columns: 1,
  },
  minimal: {
    ...DEFAULT_CAPABILITIES,
    name: 'Minimal',
    itemAreaPx: 754,
    categoryHeaderPx: 58,
    categoryGapPx: 38,
    itemHeightPx: 49,
    columns: 1,
  },
  modern: {
    ...DEFAULT_CAPABILITIES,
    name: 'Modern',
    itemAreaPx: 746,
    categoryHeaderPx: 52,
    categoryGapPx: 29,
    itemHeightPx: 49,
    columns: 1,
  },
  moroccan: {
    ...DEFAULT_CAPABILITIES,
    name: 'Moroccan',
    itemAreaPx: 692,
    categoryHeaderPx: 71,
    categoryGapPx: 29,
    itemHeightPx: 75,
    columns: 2,
    supportsAddons: 'footer',
  },
  natureBistro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Nature Bistro',
    itemAreaPx: 631,
    categoryHeaderPx: 54,
    categoryGapPx: 7,
    itemHeightPx: 55,
    columns: 2,
    supportsAddons: 'sidebar',
  },
  pro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Pro Premium',
    itemAreaPx: 700,
    categoryHeaderPx: 46,
    categoryGapPx: 23,
    itemHeightPx: 54,
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
 * categories and items after fixed chrome. categoryHeaderPx accounts for the
 * title, separator, and its bottom margin. categoryGapPx is the gap BETWEEN
 * consecutive category blocks.
 *
 * Items may be laid out in multiple columns (columns field).
 *
 * @param {string} layoutKey - Layout identifier
 * @param {number} categoryCount - Number of categories in the menu
 * @returns {number} Maximum items that fit on screen, or null if unlimited
 */
export function getMaxItems(layoutKey, categoryCount) {
  const caps = LAYOUT_CAPABILITIES[layoutKey]
  if (!caps) return null

  if (caps.maxItems != null) return caps.maxItems

  if (caps.itemAreaPx == null || caps.categoryHeaderPx == null || caps.itemHeightPx == null) {
    return null
  }

  const catGap = (caps.categoryGapPx || 0) * Math.max(0, categoryCount - 1)
  const totalCatCost = categoryCount * caps.categoryHeaderPx + catGap
  const remaining = caps.itemAreaPx - totalCatCost
  if (remaining <= 0) return 0

  const itemsPerRow = caps.columns || 1
  const rows = Math.floor(remaining / caps.itemHeightPx)
  return Math.max(0, rows * itemsPerRow)
}
