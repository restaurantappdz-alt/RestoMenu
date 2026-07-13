import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { onMenusSnapshot, createMenu, deleteMenu, setActiveMenu, seedDefaultMenu } from '@/api'
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
import { Plus, Trash2, Monitor, ChefHat, RefreshCw, Eye, Copy } from 'lucide-react'
import MenuEditor from './MenuEditor'

const menuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
})

export default function MenuList() {
  const { restaurantId, tvLink } = useRestaurant()
  const [menus, setMenus] = useState([])
  const [selectedMenu, setSelectedMenu] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const unsub = onMenusSnapshot(restaurantId, (data) => setMenus(data))
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
      toast.success(`Menu "${menu.name}" deleted`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const onSetDisplay = async (menuId) => {
    try {
      await setActiveMenu(restaurantId, menuId)
      toast.success('TV display updated!')
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

  const copyTvLink = () => {
    navigator.clipboard.writeText(tvLink)
    toast.success('TV link copied!')
  }

  if (selectedMenu) {
    return <MenuEditor menu={selectedMenu} onBack={() => setSelectedMenu(null)} />
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Mobile TV link — visible on small screens only */}
      <div className="sm:hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">TV Link</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs text-zinc-400 truncate bg-zinc-800/50 px-2 py-1.5 rounded">{tvLink}</code>
          <button onClick={copyTvLink} className="text-gold hover:text-gold/80 shrink-0" title="Copy">
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

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

      {menus.length === 0 ? (
        <Card className="border-dashed border-zinc-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-gold" />
            </div>
            <p className="text-zinc-400 text-lg font-medium">No menus yet</p>
            <p className="text-zinc-600 text-sm mt-1">
              Create your first menu or seed the default data
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-zinc-800/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Name</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Items</TableHead>
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
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSetDisplay(menu.id)
                          }}
                          title="Display on TV"
                        >
                          <Monitor className="w-4 h-4 text-gold" />
                        </Button>
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
