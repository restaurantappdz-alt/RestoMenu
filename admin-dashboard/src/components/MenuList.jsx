import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { onMenusSnapshot, createMenu, deleteMenu, setActiveMenu, seedDefaultMenu, onDisplayConfigSnapshot, assignMenuToScreen, clearScreen } from '@/api'
import { useRestaurant } from '@/RestaurantContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Plus, Trash2, ChefHat, X } from 'lucide-react'
import MenuEditor from './MenuEditor'
import ScreenManager from './ScreenManager'

const menuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
})

export default function MenuList() {
  const { restaurantId } = useRestaurant()
  const [menus, setMenus] = useState([])
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [screenConfig, setScreenConfig] = useState({ screens: {} })

  useEffect(() => {
    const unsub = onMenusSnapshot(restaurantId, (data) => setMenus(data))
    return unsub
  }, [restaurantId])

  useEffect(() => {
    const unsub = onDisplayConfigSnapshot(restaurantId, (data) => {
      const screens = data.screens || {}
      setScreenConfig({ ...data, screens })
    })
    return unsub
  }, [restaurantId])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: { name: '' },
  })

  const onCreate = async (data) => {
    try {
      await createMenu(restaurantId, data.name)
      toast.success(`Menu "${data.name}" created`)
      setDialogOpen(false)
      reset()
    } catch (e) {
      toast.error(e.message)
    }
  }

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

  const onAssign = async (menuId, screenKey) => {
    try {
      await assignMenuToScreen(restaurantId, menuId, screenKey)
      toast.success(`Assigned to TV ${screenKey}`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const onClear = async (screenKey) => {
    try {
      await clearScreen(restaurantId, screenKey)
      toast.success(`TV ${screenKey} cleared`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const onSeed = async () => {
    setSeeding(true)
    try {
      const id = await seedDefaultMenu(restaurantId)
      toast.success("Sandwich N'delda menu created!")
      await setActiveMenu(restaurantId, id)
      toast.success('TV display set to new menu')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSeeding(false)
    }
  }

  function TvStatus({ menuId, screenKey }) {
    const isLive = screenConfig.screens?.[screenKey]?.menuId === menuId

    if (isLive) {
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="bg-gold text-[#0D0D0D] text-[10px] font-bold px-2 py-0.5 rounded-full">LIVE</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClear(screenKey) }}
            className="text-zinc-600 hover:text-red-400 transition-colors"
            title={`Clear TV ${screenKey}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }

    return (
      <button
        onClick={(e) => { e.stopPropagation(); onAssign(menuId, screenKey) }}
        className="text-[11px] text-zinc-500 hover:text-gold border border-zinc-700 hover:border-gold/50 px-2 py-0.5 rounded transition-colors"
      >
        Set
      </button>
    )
  }

  if (selectedMenu) {
    return <MenuEditor menu={selectedMenu} onBack={() => setSelectedMenu(null)} />
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-gold">Your Menus</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Create and manage your restaurant menus
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onSeed} disabled={seeding}>
            <ChefHat className="w-4 h-4" />
            {seeding ? 'Seeding...' : 'Seed Default'}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4" />
                New Menu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Menu</DialogTitle>
                <DialogDescription>
                  Give your menu a name to get started.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onCreate)}>
                <div className="space-y-3 py-4">
                  <Label htmlFor="menu-name">Menu Name</Label>
                  <Input
                    id="menu-name"
                    placeholder="e.g., Lunch Menu"
                    {...register('name')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-400">{errors.name.message}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScreenManager
        screens={screenConfig.screens || {}}
        menus={menus}
      />

      {menus.length === 0 ? (
        <Card className="border-dashed border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gold/40" />
            </div>
            <p className="text-zinc-400 text-lg font-medium">No menus yet</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Name</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Items</TableHead>
                {Object.entries(screenConfig.screens || {}).sort(([, a], [, b]) => a.label.localeCompare(b.label)).map(([key, screen]) => (
                  <TableHead key={key} className="text-center">{screen.label}</TableHead>
                ))}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((menu) => {
                const catCount = menu.categories?.length || 0
                const itemCount = menu.categories?.reduce(
                  (sum, c) => sum + (c.items?.length || 0),
                  0,
                ) || 0
                return (
                  <TableRow
                    key={menu.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedMenu(menu)}
                  >
                    <TableCell className="font-medium text-zinc-200 group-hover:text-gold transition-colors">
                      {menu.name}
                    </TableCell>
                    <TableCell className="text-zinc-400">{catCount}</TableCell>
                    <TableCell className="text-zinc-400">{itemCount}</TableCell>
                    {Object.entries(screenConfig.screens || {}).sort(([, a], [, b]) => a.label.localeCompare(b.label)).map(([key]) => (
                      <TableCell key={key} className="text-center">
                        <TvStatus menuId={menu.id} screenKey={key} />
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(menu)
                          }}
                          title="Delete menu"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
