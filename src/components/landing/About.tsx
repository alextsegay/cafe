'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

interface AboutProps {
  image?: string
  title?: string
  description?: string
}

export function About({
  image = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  title,
  description,
}: AboutProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useI18n()
  const displayTitle = title || t('about.title')
  const displayDescription = description || t('about.description')

  const features = [
    { label: 'Since', value: '2018' },
    { label: 'Beans', value: '12+' },
    { label: 'Happy Customers', value: '50K+' },
  ]

  return (
    <section id="about" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={image}
                alt="Barista making coffee"
                fill
                className="object-cover"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-3xl -z-10" />
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-full -z-10" />
            
            {/* Floating Stats Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute -right-4 md:-right-8 top-1/4 glass rounded-2xl p-6 shadow-xl"
            >
              <div className="flex gap-8">
                {features.slice(0, 2).map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <span className="text-amber-600 font-medium tracking-wider uppercase text-sm">
                {t('about.subtitle')}
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
                {displayTitle}
              </h2>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {displayDescription}
            </p>

            <div className="grid grid-cols-3 gap-6 pt-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  className="text-center p-4 rounded-2xl bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10"
                >
                  <div className="text-3xl font-bold gradient-text">{feature.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{feature.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Decorative Quote */}
            <blockquote className="border-l-4 border-amber-500 pl-6 py-2">
              <p className="italic text-muted-foreground">
                {t('about.quote')}
              </p>
              <cite className="text-sm text-foreground/60 mt-2 block not-italic">
                {t('about.quoteAuthor')}
              </cite>
            </blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
