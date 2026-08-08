'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Moon, Sun, Globe } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import config from '@/lib/config'

interface NavbarProps {
  transparent?: boolean
  logo?: string
  cafeName?: string
}

export function Navbar({ transparent = false, logo, cafeName }: NavbarProps) {
  const displayCafeName = cafeName || config.cafe.name
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useI18n()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        transparent 
          ? scrolled 
            ? 'glass shadow-lg' 
            : 'bg-transparent'
          : 'glass shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {logo ? (
              <img src={logo} alt={displayCafeName} className="h-10 w-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
            )}
            <span className="font-display text-xl font-semibold group-hover:text-amber-600 transition-colors">
              {displayCafeName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm font-medium hover:text-amber-600 transition-colors">
              {t('nav.about')}
            </Link>
            <Link href="/menu" className="text-sm font-medium hover:text-amber-600 transition-colors">
              {t('nav.menu')}
            </Link>
            <Link href="/gallery" className="text-sm font-medium hover:text-amber-600 transition-colors">
              {t('nav.gallery')}
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-amber-600 transition-colors">
              {t('nav.contact')}
            </Link>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle language"
                title={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
              <Link
                href="/menu"
                className="btn-primary text-sm"
              >
                {t('hero.cta')}
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-64' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-3 border-t border-gray-200 dark:border-gray-800 glass">
          <Link
            href="/about"
            className="block py-2 text-sm font-medium hover:text-amber-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.about')}
          </Link>
          <Link
            href="/menu"
            className="block py-2 text-sm font-medium hover:text-amber-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.menu')}
          </Link>
          <Link
            href="/gallery"
            className="block py-2 text-sm font-medium hover:text-amber-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.gallery')}
          </Link>
          <Link
            href="/contact"
            className="block py-2 text-sm font-medium hover:text-amber-600 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            {t('nav.contact')}
          </Link>
          <button
            onClick={() => { setLanguage(language === 'en' ? 'am' : 'en'); setIsOpen(false) }}
            className="flex items-center gap-2 py-2 text-sm font-medium hover:text-amber-600 transition-colors"
          >
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'አማርኛ' : 'English'}
          </button>
          <Link
            href="/menu"
            className="block w-full text-center btn-primary text-sm"
            onClick={() => setIsOpen(false)}
          >
            {t('hero.cta')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
