'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Sparkles } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useI18n } from '@/lib/i18n'

interface HeroProps {
  heroImage?: string
  cafeName?: string
  tagline?: string
}

export function Hero({ heroImage, cafeName = 'Premium Café', tagline }: HeroProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { t } = useI18n()
  const displayTagline = tagline || t('hero.tagline')

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroImage || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80'}
          alt="Café Interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-gradient" />
      </div>

      {/* Content */}
      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t('hero.tagline')}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
          >
            {cafeName}
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-base sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto px-2"
          >
            {displayTagline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
          >
            <Link
              href="/menu"
              className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 animate-glow"
            >
              {t('hero.cta')}
            </Link>
            <Link
              href="#about"
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-white/30 text-white font-medium hover:bg-white/10 transition-all duration-300"
            >
              {t('hero.explore')}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-8 h-8 text-white/60" />
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-4 sm:left-10 w-24 sm:w-32 h-24 sm:h-32 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-4 sm:right-10 w-32 sm:w-48 h-32 sm:h-48 bg-yellow-500/10 rounded-full blur-3xl" />
    </section>
  )
}
