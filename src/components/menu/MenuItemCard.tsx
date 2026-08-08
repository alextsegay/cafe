'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, X, Sun, Moon, Globe, Sparkles, Star, Flame, Coffee } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/lib/i18n'
import { Modal, Badge } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import config from '@/lib/config'
import type { MenuItem, Category } from '@/types'

interface MenuClientProps {
  cafeName: string
  categories: Category[]
  menuItems: MenuItem[]
  dailySpecial?: {
    name: string
    description: string
    price: number
    image?: string
  } | null
}

export function MenuClient({ cafeName, categories, menuItems, dailySpecial }: MenuClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [showSpecialModal, setShowSpecialModal] = useState(false)
  const [filteredItems, setFilteredItems] = useState(menuItems)
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage, t } = useI18n()

  useEffect(() => {
    let filtered = menuItems

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        item =>
          (item.name.toLowerCase().includes(query)) ||
          (item.nameAm?.toLowerCase().includes(query)) ||
          (item.description?.toLowerCase().includes(query))
      )
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === selectedCategory)
    }

    setFilteredItems(filtered)
  }, [searchQuery, selectedCategory, menuItems])

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <span className="text-white font-bold">{cafeName?.charAt(0) || config.cafe.name.charAt(0)}</span>
              </div>
              <span className="font-display text-xl font-semibold">{cafeName}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle language"
              >
                <Globe className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('menu.search')}
              className="w-full pl-12 pr-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation */}
        <div className="max-w-7xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {t('menu.all')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {language === 'en' ? category.name : (category.nameAm || category.name)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Daily Special Banner */}
      {dailySpecial && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <motion.article
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            onClick={() => setShowSpecialModal(true)}
            className="group cursor-pointer relative overflow-hidden rounded-3xl border-2 border-amber-400/50 shadow-2xl shadow-amber-500/30"
          >
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 opacity-90" />
            <motion.div
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 opacity-0 group-hover:opacity-30 transition-opacity"
              style={{ backgroundSize: "200% 200%" }}
            />

            {/* Sparkle decorations */}
            <div className="absolute top-4 right-4 text-4xl animate-pulse text-amber-300">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="absolute bottom-4 left-4 text-3xl animate-pulse delay-100 text-amber-300">
              <Star className="w-6 h-6" />
            </div>
            <div className="absolute top-1/2 right-8 text-2xl animate-pulse delay-200 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>

            <div className="relative z-10 p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                {/* Image */}
                {dailySpecial.image && (
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-xl flex-shrink-0"
                  >
                    <Image
                      src={dailySpecial.image}
                      alt={dailySpecial.name}
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                )}

                {/* Content */}
                <div className="flex-1 text-center sm:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge variant="warning" className="mb-2 sm:mb-3 text-xs sm:text-base font-semibold px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm border-2 border-white/30">
                      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 inline" />
                      {t('menu.dailySpecial')}
                    </Badge>
                    <h3 className="font-display text-2xl sm:text-4xl font-bold text-white drop-shadow-lg mb-1 sm:mb-2">
                      {dailySpecial.name}
                    </h3>
                    <p className="text-white/90 text-sm sm:text-lg mb-2 sm:mb-3 max-w-xl">
                      {dailySpecial.description}
                    </p>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block"
                    >
                      <span className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-2xl">
                        {formatPrice(dailySpecial.price)}
                      </span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      )}

      {/* Menu Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4 text-amber-600">
              <Coffee className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold">{t('menu.noItems')}</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                onClick={() => setSelectedItem(item)}
                className={`group cursor-pointer glass rounded-2xl overflow-hidden card-hover ${
                  !item.available ? 'opacity-60' : ''
                }`}
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.image || config.images.menuItem}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {item.popular && <Badge variant="popular">{t('menu.popular')}</Badge>}
                    {item.isNew && <Badge variant="new">{t('menu.new')}</Badge>}
                    {!item.available && <Badge variant="danger">{t('menu.unavailable')}</Badge>}
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-3 right-3">
                    <span className="text-2xl font-bold text-white drop-shadow-lg">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold group-hover:text-amber-600 transition-colors">
                    {language === 'en' ? item.name : (item.nameAm || item.name)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {language === 'en' ? item.description : (item.descriptionAm || item.description)}
                  </p>
                  <div className="mt-3 text-xs text-amber-600 font-medium">
                    {categories.find(c => c.id === item.categoryId)?.[language === 'en' ? 'name' : 'nameAm'] || 
                     categories.find(c => c.id === item.categoryId)?.name}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        size="lg"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={selectedItem.image || config.images.menuItem}
                alt={selectedItem.name}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    {language === 'en' ? selectedItem.name : (selectedItem.nameAm || selectedItem.name)}
                  </h2>
                  <p className="text-sm text-amber-600 mt-1">
                    {categories.find(c => c.id === selectedItem.categoryId)?.[language === 'en' ? 'name' : 'nameAm']}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold gradient-text">
                    {formatPrice(selectedItem.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {selectedItem.popular && <Badge variant="popular">{t('menu.popular')}</Badge>}
              {selectedItem.isNew && <Badge variant="new">{t('menu.new')}</Badge>}
              {selectedItem.available ? (
                <Badge variant="success">{t('menu.available')}</Badge>
              ) : (
                <Badge variant="danger">{t('menu.unavailable')}</Badge>
              )}
            </div>

            <div className="prose dark:prose-invert">
              <p className="text-muted-foreground">
                {language === 'en' ? selectedItem.description : (selectedItem.descriptionAm || selectedItem.description)}
              </p>
            </div>

            {(selectedItem.ingredients || selectedItem.ingredientsAm) && (
              <div>
                <h4 className="font-semibold mb-2">{t('menu.ingredients')}</h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' ? selectedItem.ingredients : (selectedItem.ingredientsAm || selectedItem.ingredients)}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Daily Special Modal */}
      <Modal
        isOpen={showSpecialModal}
        onClose={() => setShowSpecialModal(false)}
        size="lg"
      >
        {dailySpecial && (
          <div className="space-y-6">
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image
                src={dailySpecial.image || config.images.menuItem}
                alt={dailySpecial.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="popular">✨ {t('menu.dailySpecial')}</Badge>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-bold gradient-text">
                    {dailySpecial.name}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold gradient-text">
                    {formatPrice(dailySpecial.price)}
                  </span>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert">
              <p className="text-lg text-muted-foreground">
                {dailySpecial.description}
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-semibold text-amber-700 dark:text-amber-400">{t('menu.specialOffer')}</p>
                  <p className="text-sm text-muted-foreground">{t('menu.limitedTime')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
