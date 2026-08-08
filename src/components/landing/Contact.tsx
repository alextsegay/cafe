'use client'

import { useRef, useState, useEffect } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, ExternalLink } from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { Button, Input } from '@/components/ui'
import { useI18n } from '@/lib/i18n'
import { formatTime } from '@/lib/utils'
import config from '@/lib/config'

// Simple HTML sanitizer to prevent XSS
function sanitizeHtml(html: string): string {
  // Allow safe iframe embeds from trusted domains (e.g. Google Maps)
  const allowedIframeDomains = ['google.com', 'maps.google.com', 'www.google.com', 'maps.google.co']

  // Extract and preserve safe iframes
  const iframes: string[] = []
  let sanitized = html.replace(/<iframe\b([^>]*)><\/iframe>/gi, (match, attrs) => {
    const srcMatch = attrs.match(/src=["']([^"']+)["']/)
    if (srcMatch) {
      try {
        const url = new URL(srcMatch[1])
        if (allowedIframeDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain))) {
          // Strip dangerous attributes but keep safe ones
          const safeAttrs = attrs
            .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*on\w+\s*=\s*[^\s>]+/gi, '')
            .replace(/\s*style\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*style\s*=\s*[^\s>]+/gi, '')
            .replace(/\s*width\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*width\s*=\s*[^\s>]+/gi, '')
            .replace(/\s*height\s*=\s*["'][^"']*["']/gi, '')
            .replace(/\s*height\s*=\s*[^\s>]+/gi, '')
          const placeholder = `__IFRAME_${iframes.length}__`
          iframes.push(`<iframe${safeAttrs} style="width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe>`)
          return placeholder
        }
      } catch {
        // Invalid URL, skip
      }
    }
    return ''
  })

  // Remove all other iframes (untrusted)
  sanitized = sanitized.replace(/<iframe\b[^>]*><\/iframe>/gi, '')

  // Restore allowed iframes
  iframes.forEach((iframe, index) => {
    sanitized = sanitized.replace(`__IFRAME_${index}__`, iframe)
  })

  // Remove scripts and event handlers
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')

  return sanitized
}

interface ContactProps {
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
  mapEmbed?: string
}

export function Contact({
  address = config.cafe.address,
  phone = config.cafe.phone,
  email = config.cafe.email,
  openingHours = config.openingHours,
  mapEmbed,
}: ContactProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const [sanitizedMapEmbed, setSanitizedMapEmbed] = useState<string>('')
  const { t } = useI18n()

  useEffect(() => {
    if (mapEmbed) {
      setSanitizedMapEmbed(sanitizeHtml(mapEmbed))
    }
  }, [mapEmbed])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitStatus('idle')
    setErrorMessage('')

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get('firstName')?.toString() || ''
    const lastName = formData.get('lastName')?.toString() || ''
    const email = formData.get('email')?.toString() || ''
    const phone = formData.get('phone')?.toString() || ''
    const message = formData.get('message')?.toString() || ''

    if (!firstName || !lastName || !message) {
      setErrorMessage(t('contact.required'))
      setSubmitStatus('error')
      return
    }

    const data = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      phone,
      subject: formData.get('subject')?.toString() || '',
      message,
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setSubmitStatus('success')
        formRef.current?.reset()
      } else {
        const errorData = await res.json().catch(() => ({}))
        setErrorMessage(errorData.error || t('contact.error'))
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setErrorMessage(t('contact.networkError'))
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="space-y-16">
          <div>
            <span className="text-amber-600 font-medium tracking-wider uppercase text-sm">
              {t('contact.title')}
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
              {t('contact.visitUs')}
            </h2>
            <p className="text-lg text-muted-foreground mt-4">
              {t('contact.subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="glass rounded-3xl p-8 md:p-10 pb-6 md:pb-8 h-full">
                <h3 className="font-display text-2xl font-semibold mb-6">
                  {t('contact.sendMessage')}
                </h3>
                {submitStatus === 'success' ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                    <h4 className="font-semibold text-lg">{t('contact.success')}</h4>
                    <p className="text-muted-foreground mt-2">{t('contact.successMsg')}</p>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="firstName"
                        label={t('contact.firstName')}
                        placeholder="John"
                        required
                      />
                      <Input
                        name="lastName"
                        label={t('contact.lastName')}
                        placeholder="Doe"
                        required
                      />
                    </div>
                    <Input
                      name="email"
                      label={t('contact.email')}
                      type="email"
                      placeholder="john@example.com"
                    />
                    <Input
                      name="phone"
                      label={t('contact.phone')}
                      type="tel"
                      placeholder="+1 234 567 890"
                    />
                    <Input
                      name="subject"
                      label={t('contact.subject')}
                      placeholder={t('contact.subjectPlaceholder')}
                    />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-foreground/80">
                        {t('contact.message')}
                      </label>
                      <textarea
                        name="message"
                        className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 resize-none"
                        rows={5}
                        placeholder={t('contact.messagePlaceholder')}
                        required
                      />
                    </div>
                    {submitStatus === 'error' && (
                      <p className="text-red-500 text-sm">{errorMessage}</p>
                    )}
                    <Button type="submit" className="w-full mb-0" size="lg" disabled={isSubmitting}>
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? t('contact.sending') : t('contact.send')}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Right Column: Contact Info + Map */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Contact Info */}
              <div className="space-y-4">
                {address && (
                  <div className="flex items-start gap-4 p-4 glass rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('contact.address')}</h4>
                      <p className="text-muted-foreground">{address}</p>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className="flex items-start gap-4 p-4 glass rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('contact.phone')}</h4>
                      <p className="text-muted-foreground">{phone}</p>
                    </div>
                  </div>
                )}

                {email && (
                  <div className="flex items-start gap-4 p-4 glass rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('contact.email')}</h4>
                      <p className="text-muted-foreground">{email}</p>
                    </div>
                  </div>
                )}

                {openingHours && (
                  <div className="flex items-start gap-4 p-4 glass rounded-2xl">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{t('contact.hours')}</h4>
                      <div className="text-muted-foreground space-y-1 mt-1">
                        <p>{t('contact.monFri')}: {formatTime(openingHours.monday.open)} - {formatTime(openingHours.monday.close)}</p>
                        <p>{t('contact.saturday')}: {formatTime(openingHours.saturday.open)} - {formatTime(openingHours.saturday.close)}</p>
                        <p>{t('contact.sunday')}: {formatTime(openingHours.sunday.open)} - {formatTime(openingHours.sunday.close)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <a
                  href={`${config.maps.directionsUrl}${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  {t('contact.directions')}
                </a>
              </div>

              {/* Map */}
              <div className="relative h-[400px] rounded-3xl overflow-hidden">
                {sanitizedMapEmbed ? (
                  <div
                    className="w-full h-full"
                    dangerouslySetInnerHTML={{ __html: sanitizedMapEmbed }}
                  />
                ) : (
                  <iframe
                    src={`${config.maps.embedUrl}${encodeURIComponent(address)}&output=embed`}
                    title="Cafe Location"
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
