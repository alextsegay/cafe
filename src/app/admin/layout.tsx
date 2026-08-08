'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Images,
  Settings,
  QrCode,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import config from '@/lib/config'
import { useI18n } from '@/lib/i18n'

const navItems = [
  { href: '/admin/dashboard', labelKey: 'admin.dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', labelKey: 'admin.menu', icon: UtensilsCrossed },
  { href: '/admin/categories', labelKey: 'admin.categories', icon: FolderTree },
  { href: '/admin/gallery', labelKey: 'admin.gallery', icon: Images },
  { href: '/admin/contact', labelKey: 'admin.messages', icon: MessageSquare },
  { href: '/admin/notifications', labelKey: 'admin.notifications', icon: Bell },
  { href: '/admin/settings', labelKey: 'admin.settings', icon: Settings },
  { href: '/admin/qrcode', labelKey: 'admin.qrCode', icon: QrCode },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [user, setUser] = useState<{ email: string; name: string } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        router.push('/admin')
      }
    } catch {
      router.push('/admin')
    } finally {
      setIsChecking(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    })
    router.push('/admin')
    router.refresh()
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Don't show sidebar on login, forgot password, or reset password pages
  const isAuthPage = pathname === '/admin' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
          <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{config.cafe.name.charAt(0)}</span>
          </div>
          <span className="font-semibold">{config.cafe.name}</span>
        </div>
        <div className="w-10" />
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isSidebarCollapsed ? 'lg:w-20' : 'lg:w-72',
          !isSidebarCollapsed ? 'w-72' : 'w-20'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">{config.cafe.name.charAt(0)}</span>
            </div>
            {!isSidebarCollapsed && <span className="font-display text-xl font-semibold">{config.cafe.name}</span>}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn('p-4 space-y-1', isSidebarCollapsed && 'px-2')}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
                  isSidebarCollapsed && 'justify-center px-3'
                )}
                title={isSidebarCollapsed ? t(item.labelKey) : undefined}
               >
                 <item.icon className="w-5 h-5 shrink-0" />
                 {!isSidebarCollapsed && <span className="font-medium">{t(item.labelKey)}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className={cn('absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700', isSidebarCollapsed ? 'p-2' : 'p-4')}>
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                isSidebarCollapsed && 'justify-center px-3'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold">{user?.name?.charAt(0) || config.cafe.name.charAt(0)}</span>
              </div>
              {!isSidebarCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-sm">{user?.name || config.cafe.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', isUserMenuOpen && 'rotate-180')} />
                </>
              )}
            </button>

            {isUserMenuOpen && !isSidebarCollapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-sm">{t('admin.viewWebsite')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t('admin.logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('pt-16 lg:pt-0 min-h-screen transition-all duration-300', isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72')}>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
