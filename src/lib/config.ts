/**
 * Central configuration for the cafe platform.
 * All hardcoded values are sourced from environment variables with sensible defaults.
 * This allows the same codebase to serve multiple cafes without code changes.
 */

export const config = {
  // Cafe defaults (used when no cafe is configured in the database)
  cafe: {
    name: process.env.NEXT_PUBLIC_CAFE_NAME || 'Café',
    slug: process.env.NEXT_PUBLIC_CAFE_SLUG || 'cafe',
    tagline: process.env.NEXT_PUBLIC_CAFE_TAGLINE || 'Experience the Art of Fine Coffee',
    address: process.env.NEXT_PUBLIC_CAFE_ADDRESS || '',
    phone: process.env.NEXT_PUBLIC_CAFE_PHONE || '',
    email: process.env.NEXT_PUBLIC_CAFE_EMAIL || '',
    primaryColor: process.env.NEXT_PUBLIC_CAFE_PRIMARY_COLOR || '#C9A962',
    secondaryColor: process.env.NEXT_PUBLIC_CAFE_SECONDARY_COLOR || '#3D2914',
    language: process.env.NEXT_PUBLIC_CAFE_LANGUAGE || 'en',
    aboutTitle: process.env.NEXT_PUBLIC_CAFE_ABOUT_TITLE || 'Our Story',
    aboutDescription: process.env.NEXT_PUBLIC_CAFE_ABOUT_DESCRIPTION || '',
  },

  // Admin credentials (used for seeding). The password default is only for
  // local development — production fails loudly instead of seeding a known
  // default password.
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@cafemenu.com',
    password: (() => {
      const password = process.env.ADMIN_PASSWORD
      if (password) return password
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_PASSWORD environment variable is required in production')
      }
      return 'admin123'
    })(),
    name: process.env.ADMIN_NAME || 'Admin',
  },

  // App settings
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    currency: process.env.NEXT_PUBLIC_CURRENCY || 'ETB',
  },

  // Default opening hours
  openingHours: (() => {
    try {
      const hours = process.env.NEXT_PUBLIC_OPENING_HOURS
      if (hours) {
        return JSON.parse(hours)
      }
    } catch {
      // Fall through to default
    }
    return {
      monday: { open: '07:00', close: '22:00' },
      tuesday: { open: '07:00', close: '22:00' },
      wednesday: { open: '07:00', close: '22:00' },
      thursday: { open: '07:00', close: '22:00' },
      friday: { open: '07:00', close: '23:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '21:00' },
    }
  })(),

  // Default social links
  socialLinks: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || '',
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || '',
    twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER || '',
  },

  // Default image URLs (used as fallbacks)
  images: {
    hero: process.env.NEXT_PUBLIC_IMAGE_HERO || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&q=80',
    about: process.env.NEXT_PUBLIC_IMAGE_ABOUT || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    menuItem: process.env.NEXT_PUBLIC_IMAGE_MENU_ITEM || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    menuItemDetail: process.env.NEXT_PUBLIC_IMAGE_MENU_ITEM_DETAIL || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  },

  // Maps configuration
  maps: {
    directionsUrl: process.env.NEXT_PUBLIC_MAPS_DIRECTIONS_URL || 'https://www.google.com/maps/dir/?api=1&destination=',
    embedUrl: process.env.NEXT_PUBLIC_MAPS_EMBED_URL || 'https://www.google.com/maps?q=',
  },
}

export default config
