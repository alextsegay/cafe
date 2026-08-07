'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Badge } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { formatPrice } from '@/lib/utils'
import type { MenuItem } from '@/types'

interface FeaturedMenuProps {
  items: MenuItem[]
  title?: string
  subtitle?: string
}

export function FeaturedMenu({
  items,
  title,
  subtitle
}: FeaturedMenuProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useI18n()
  const displayTitle = title || t('menu.featuredTitle')
  const displaySubtitle = subtitle || t('menu.featuredSubtitle')

  return (
    <section id="menu" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-transparent via-amber-50/30 to-transparent dark:via-amber-900/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-amber-600 font-medium tracking-wider uppercase text-sm">
            {t('menu.selection')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
            {displayTitle}
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            {displaySubtitle}
          </p>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/menu/premium-cafe?item=${item.id}`}>
                <article className="group h-full glass rounded-3xl overflow-hidden card-hover">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      {item.popular && <Badge variant="popular">{t('menu.popular')}</Badge>}
                      {item.isNew && <Badge variant="new">{t('menu.new')}</Badge>}
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-4 right-4">
                        <span className="text-2xl font-bold text-white drop-shadow-lg">
                          {formatPrice(item.price)}
                        </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold group-hover:text-amber-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center text-amber-600 text-sm font-medium">
                      <span>{t('menu.viewDetails')}</span>
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/menu/premium-cafe" className="btn-primary inline-flex items-center gap-2">
            {t('menu.viewFullMenu')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
