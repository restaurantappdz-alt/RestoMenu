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
  maxItems: null,           // null = unlimited
  supportsDescriptions: false,
  supportsTags: false,
  supportsHeroPhoto: false,
  supportsItemImages: false,
  supportsAddons: false,    // 'sidebar' | 'footer' | false
  supportsCategoryHeaders: true,
  displayMode: 'full-menu', // 'full-menu' | 'single-category' | 'grid'
  hasHeader: true,
  hasFooter: false,
}

export const LAYOUT_CAPABILITIES = {
  classic: {
    ...DEFAULT_CAPABILITIES,
    name: 'Classic Gold',
    supportsAddons: 'sidebar',
  },
  bistro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Bistro Chalkboard',
    supportsAddons: 'footer',
  },
  brasserie: {
    ...DEFAULT_CAPABILITIES,
    name: 'Brasserie',
    supportsAddons: 'sidebar',
  },
  coffeeShop: {
    ...DEFAULT_CAPABILITIES,
    name: 'Coffee Shop',
  },
  minimal: {
    ...DEFAULT_CAPABILITIES,
    name: 'Minimal',
  },
  modern: {
    ...DEFAULT_CAPABILITIES,
    name: 'Modern',
  },
  moroccan: {
    ...DEFAULT_CAPABILITIES,
    name: 'Moroccan',
    supportsAddons: 'footer',
  },
  natureBistro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Nature Bistro',
    supportsAddons: 'sidebar',
  },
  pro: {
    ...DEFAULT_CAPABILITIES,
    name: 'Pro Premium',
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

/**
 * Get capabilities for a specific layout.
 * Returns a copy so callers can't mutate the registry.
 */
export function getLayoutCapabilities(layoutKey) {
  const caps = LAYOUT_CAPABILITIES[layoutKey]
  if (!caps) return { ...DEFAULT_CAPABILITIES, name: layoutKey }
  return { ...caps }
}

/**
 * Get the field requirements summary — what fields this layout
 * supports that are OPTIONAL in the data model.
 */
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
