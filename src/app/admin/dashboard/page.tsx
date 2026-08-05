import { prisma } from '@/lib/prisma'
import { UtensilsCrossed, FolderTree, EyeOff, Images, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

async function getStats() {
  try {
    const [menuItems, categories, hiddenItems, galleryImages, recentItems] = await Promise.all([
      prisma.menuItem.count(),
      prisma.category.count(),
      prisma.menuItem.count({ where: { available: false } }),
      prisma.gallery.count(),
      prisma.menuItem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
    ])

    return { menuItems, categories, hiddenItems, galleryImages, recentItems }
  } catch {
    return { menuItems: 0, categories: 0, hiddenItems: 0, galleryImages: 0, recentItems: [] }
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    {
      title: 'Total Menu Items',
      value: stats.menuItems,
      icon: UtensilsCrossed,
      color: 'from-amber-500 to-yellow-500',
      href: '/admin/menu',
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: FolderTree,
      color: 'from-emerald-500 to-teal-500',
      href: '/admin/categories',
    },
    {
      title: 'Hidden Items',
      value: stats.hiddenItems,
      icon: EyeOff,
      color: 'from-gray-500 to-gray-600',
      href: '/admin/menu',
    },
    {
      title: 'Gallery Images',
      value: stats.galleryImages,
      icon: Images,
      color: 'from-purple-500 to-pink-500',
      href: '/admin/gallery',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your café.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className="group glass rounded-2xl p-6 card-hover"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              href="/admin/menu?action=add"
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/30 dark:hover:to-yellow-900/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Add Menu Item</p>
                <p className="text-sm text-muted-foreground">Create a new menu item</p>
              </div>
            </Link>

            <Link
              href="/admin/categories?action=add"
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <FolderTree className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Manage Categories</p>
                <p className="text-sm text-muted-foreground">Organize your menu categories</p>
              </div>
            </Link>

            <Link
              href="/admin/qrcode"
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-white font-bold">QR</span>
              </div>
              <div>
                <p className="font-medium">Generate QR Code</p>
                <p className="text-sm text-muted-foreground">Get your digital menu QR</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Menu Items */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Recent Menu Items
            </h2>
            <Link href="/admin/menu" className="text-sm text-amber-600 hover:underline">
              View all
            </Link>
          </div>
          
          {stats.recentItems.length === 0 ? (
            <div className="text-center py-8">
              <UtensilsCrossed className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-muted-foreground mt-2">No menu items yet</p>
              <Link href="/admin/menu?action=add" className="text-amber-600 text-sm hover:underline mt-1 inline-block">
                Add your first item
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 flex items-center justify-center">
                    <UtensilsCrossed className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.category.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(item.price)}</p>
                    <p className={`text-xs ${item.available ? 'text-green-600' : 'text-red-500'}`}>
                      {item.available ? 'Available' : 'Hidden'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
