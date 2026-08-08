'use client'

import Link from 'next/link'
import { Instagram, Facebook, Twitter, MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useI18n } from '@/lib/i18n'
import { formatTime } from '@/lib/utils'
import config from '@/lib/config'

interface FooterProps {
  cafeName?: string
  address?: string
  phone?: string
  email?: string
  openingHours?: {
    monday: { open: string; close: string }
    tuesday: { open: string; close: string }
    wednesday: { open: string; close: string }
    thursday: { open: string; close: string }
    friday: { open: string; close: string }
    saturday: { open: string; close: string }
    sunday: { open: string; close: string }
  }
  socialLinks?: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
}

export function Footer({
  cafeName,
  address,
  phone,
  email,
  openingHours,
  socialLinks,
}: FooterProps) {
  const displayCafeName = cafeName || config.cafe.name
  const { theme } = useTheme()
  const { t } = useI18n()

  return (
    <footer className="relative bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{displayCafeName.charAt(0)}</span>
              </div>
              <span className="font-display text-xl sm:text-2xl font-semibold">{displayCafeName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('nav.home')}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href={`/menu/${config.cafe.slug}`} className="text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                  {t('hero.cta')}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-amber-600 transition-colors">
                  {t('nav.admin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t('contact.title')}</h4>
            <ul className="space-y-3">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{phone}</span>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{email}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Opening Hours */}
          {openingHours && (
            <div>
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                {t('contact.hours')}
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t('contact.monFri')}</span>
                  <span>{formatTime(openingHours.monday.open)} - {formatTime(openingHours.monday.close)}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t('contact.saturday')}</span>
                  <span>{formatTime(openingHours.saturday.open)} - {formatTime(openingHours.saturday.close)}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{t('contact.sunday')}</span>
                  <span>{formatTime(openingHours.sunday.open)} - {formatTime(openingHours.sunday.close)}</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {displayCafeName}. {t('footer.rights')}.
            </p>
            <p className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
