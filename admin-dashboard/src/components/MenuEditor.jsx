import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { updateMenu, onRestaurantDoc } from '@/api'
import { useRestaurant } from '@/RestaurantContext'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Pencil, Eye } from 'lucide-react'
import CategorySection from './CategorySection'
import TVPreview from './TVPreview'
import LayoutPicker from './LayoutPicker'
import { getMaxItems } from '@/layouts'

const LAYOUT_OPTIONS = [
  { value: 'classic', label: 'Classic Gold' },
  { value: 'bistro', label: 'Bistro Chalkboard' },
  { value: 'brasserie', label: 'Brasserie' },
  { value: 'coffeeShop', label: 'Coffee Shop' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'modern', label: 'Modern' },
  { value: 'moroccan', label: 'Moroccan' },
  { value: 'natureBistro', label: 'Nature Bistro' },
  { value: 'pro', label: 'Pro Premium' },
]

export default function MenuEditor({ menu, onBack }) {
  const { restaurantId } = useRestaurant()
  const [menuName, setMenuName] = useState(menu.name)
  const [categories, setCategories] = useState(menu.categories || [])
  const [selectedLayout, setSelectedLayout] = useState(menu.selectedLayout || 'classic')
  const [saving, setSaving] = useState(false)
  const [availableLayouts, setAvailableLayouts] = useState(null)

  const dynamicMax = getMaxItems(selectedLayout, categories.length)
  const categoryItemsCounts = categories.map((c) => (c.items || []).length)
  const totalItemCount = categoryItemsCounts.reduce((sum, count) => sum + count, 0)

  useEffect(() => {
    if (!restaurantId) return
    const unsub = onRestaurantDoc(restaurantId, (data) => {
      setAvailableLayouts(data.availableLayouts || null)
    })
    return unsub
  }, [restaurantId])

  const filteredOptions = availableLayouts
    ? LAYOUT_OPTIONS.filter((o) => availableLayouts.includes(o.value))
    : LAYOUT_OPTIONS

  const fullSave = async (overrides) => {
    setSaving(true)
    try {
      await updateMenu(restaurantId, menu.id, {
        name: menuName,
        categories: categories,
        selectedLayout,
        ...overrides,
      })
    } catch (e) {
      toast.error('Failed to save: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const save = async (newCategories) => {
    const cats = newCategories || categories
    const oldTotal = categories.reduce((sum, c) => sum + (c.items || []).length, 0)
    const newTotal = cats.reduce((sum, c) => sum + (c.items || []).length, 0)

    // Only block item additions beyond budget — allow edits/deletes even when over budget (pre-existing data)
    if (dynamicMax != null && newTotal > dynamicMax && newTotal > oldTotal) {
      toast.error(`Maximum items reached for this layout (${dynamicMax})`)
      return
    }

    setSaving(true)
    try {
      await updateMenu(restaurantId, menu.id, { name: menuName, categories: cats, selectedLayout })
    } catch (e) {
      toast.error('Failed to save: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const addCategory = () => {
    const newCat = { name: 'New Category', items: [], addons: [] }
    const updated = [...categories, newCat]
    setCategories(updated)
    save(updated)
    toast.success('Category added')
  }

  const updateCategory = (index, updatedCat) => {
    const updated = categories.map((c, i) => (i === index ? updatedCat : c))
    setCategories(updated)
    save(updated)
  }

  const deleteCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index)
    setCategories(updated)
    save(updated)
    toast.success('Category deleted')
  }

  const currentMenu = { ...menu, name: menuName, categories, selectedLayout }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <Input
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            onBlur={() => save()}
            className="text-2xl font-display font-bold text-gold bg-transparent border-0 border-b border-transparent hover:border-zinc-700 focus:border-gold px-0 py-1 h-auto rounded-none"
          />
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList>
          <TabsTrigger value="edit">
            <Pencil className="w-4 h-4 mr-1.5" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="w-4 h-4 mr-1.5" />
            TV Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-6 mt-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">
                Display Settings
              </h3>
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-zinc-300">TV Layout</label>
                {dynamicMax != null && (
                  <span className="text-xs text-zinc-500">
                    {totalItemCount}/{dynamicMax} items
                  </span>
                )}
              </div>
              <LayoutPicker
                value={selectedLayout}
                onValueChange={(val) => {
                  setSelectedLayout(val)
                  fullSave({ selectedLayout: val })
                }}
                options={filteredOptions}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Categories ({categories.length})
            </h3>
            <div className="flex items-center gap-3">
              {dynamicMax != null && (
                <span className="text-xs text-zinc-500">
                  {totalItemCount}/{dynamicMax} items
                </span>
              )}
              <Button size="sm" variant="outline" onClick={addCategory}>
                <Plus className="w-4 h-4" />
                Add Category
              </Button>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
              <p className="text-zinc-500 text-sm">No categories yet</p>
              <p className="text-zinc-600 text-xs mt-1">
                Add your first category to start building the menu
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {categories.map((category, index) => (
                <CategorySection
                  key={index}
                  category={category}
                  index={index}
                  categoryItemsCounts={categoryItemsCounts}
                  layoutMaxItems={dynamicMax}
                  onUpdate={(updated) => updateCategory(index, updated)}
                  onDelete={() => deleteCategory(index)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <TVPreview menu={currentMenu} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
