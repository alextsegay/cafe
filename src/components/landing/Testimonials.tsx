'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  text: string
}

interface TestimonialsProps {
  testimonials?: Testimonial[]
  title?: string
  subtitle?: string
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Coffee Enthusiast',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    rating: 5,
    text: 'The best coffee I have ever had! The atmosphere is incredible and the staff is so friendly. Definitely my go-to spot for working remotely.',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Food Blogger',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    rating: 5,
    text: 'Their pastries are absolutely divine. I especially love the avocado toast and the croissants. The attention to detail is remarkable.',
  },
  {
    id: '3',
    name: 'Emily Davis',
    role: 'Regular Customer',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    rating: 5,
    text: 'A hidden gem! The ambiance is perfect for both dates and catching up with friends. Their seasonal menu is always a pleasant surprise.',
  },
]

export function Testimonials({
  testimonials = defaultTestimonials,
  title,
  subtitle
}: TestimonialsProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { t } = useI18n()
  const displayTitle = title || t('testimonials.title')
  const displaySubtitle = subtitle || t('testimonials.subtitle')

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-transparent via-cream/20 to-transparent">
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
            {t('testimonials.label')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2">
            {displayTitle}
          </h2>
          <p className="text-lg text-muted-foreground mt-4">
            {displaySubtitle}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass rounded-3xl p-8 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-2 w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                <Quote className="w-6 h-6 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground/80 leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
