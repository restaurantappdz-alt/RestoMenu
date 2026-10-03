/**
 * Keep category order while limiting displayed menu items and omit empty headers.
 */
export function truncateCategories(categories, maxItems) {
  if (maxItems == null || !categories.length) return categories

  const totalItems = categories.reduce((sum, category) => sum + (category.items || []).length, 0)
  if (totalItems <= maxItems) return categories

  const result = categories.map((category) => ({ ...category, items: [...(category.items || [])] }))
  let remaining = maxItems

  for (let i = 0; i < result.length; i++) {
    if (remaining <= 0) {
      result[i].items = []
      continue
    }
    const categoryItemCount = result[i].items.length
    const share = Math.max(1, Math.round(remaining / (result.length - i)))
    const take = Math.min(categoryItemCount, share)
    result[i].items = result[i].items.slice(0, take)
    remaining -= take
  }

  return result.filter((category) => (category.items || []).length > 0)
}
