'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Save, Loader2, Image as ImageIcon, KeyRound, Eye, EyeOff } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'
import config from '@/lib/config'
import { useI18n } from '@/lib/i18n'

interface CafeSettings {
  id?: string
  name: string
  slug: string
  logo: string
  heroImage: string
  tagline: string
  address: string
  phone: string
  email: string
  primaryColor: string
  secondaryColor: string
  language: string
  openingHours: {
    weekdays: { open: string; close: string }
    saturday: { open: string; close: string }
    sunday: { open: string; close: string }
  }
  socialLinks: {
    instagram: string
    facebook: string
    twitter: string
  }
  dailySpecial: {
    name: string
    description: string
    price: string
    image: string
  }
  mapEmbed: string
  aboutTitle: string
  aboutDescription: string
  aboutImage: string
}

export default function SettingsPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [settings, setSettings] = useState<CafeSettings>({
    name: '',
    slug: config.cafe.slug,
    logo: '',
    heroImage: '',
    tagline: config.cafe.tagline,
    address: '',
    phone: '',
    email: '',
    primaryColor: config.cafe.primaryColor,
    secondaryColor: config.cafe.secondaryColor,
    language: 'en',
    openingHours: {
      weekdays: { open: config.openingHours.monday.open, close: config.openingHours.monday.close },
      saturday: { open: config.openingHours.saturday.open, close: config.openingHours.saturday.close },
      sunday: { open: config.openingHours.sunday.open, close: config.openingHours.sunday.close },
    },
    socialLinks: {
      instagram: config.socialLinks.instagram,
      facebook: config.socialLinks.facebook,
      twitter: config.socialLinks.twitter,
    },
    dailySpecial: {
      name: '',
      description: '',
      price: '',
      image: '',
    },
    mapEmbed: '',
    aboutTitle: t('about.title'),
    aboutDescription: t('about.description'),
    aboutImage: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [cafeData, setCafeData] = useState<any>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error'>('success')
  const [csrfToken, setCsrfToken] = useState('')

  const showMessage = (
    setter: (message: string) => void,
    typeSetter: (type: 'success' | 'error') => void,
    text: string,
    type: 'success' | 'error',
  ) => {
    typeSetter(type)
    setter(text)
    window.setTimeout(() => setter(''), 5000)
  }

  useEffect(() => {
    // Fetch CSRF token
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-csrf' }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [])

  const isSpecialExpired = (updatedAt: string) => {
    const updated = new Date(updatedAt)
    const now = new Date()
    const hoursDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60)
    return hoursDiff > 24
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/cafe', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data) {
          // Convert individual days to weekdays format for settings form
          const dbOpeningHours = data.openingHours as any
          const openingHours = dbOpeningHours?.monday ? {
            weekdays: {
              open: dbOpeningHours.monday?.open || config.openingHours.monday.open,
              close: dbOpeningHours.monday?.close || config.openingHours.monday.close,
            },
            saturday: {
              open: dbOpeningHours.saturday?.open || config.openingHours.saturday.open,
              close: dbOpeningHours.saturday?.close || config.openingHours.saturday.close,
            },
            sunday: {
              open: dbOpeningHours.sunday?.open || config.openingHours.sunday.open,
              close: dbOpeningHours.sunday?.close || config.openingHours.sunday.close,
            },
          } : data.openingHours

          setSettings({
            ...settings,
            ...data,
            openingHours: openingHours || settings.openingHours,
            socialLinks: data.socialLinks || settings.socialLinks,
            dailySpecial: data.dailySpecial || settings.dailySpecial,
            mapEmbed: data.mapEmbed || '',
          })
          setCafeData(data)

          // Check if daily special is expired and create notification
          if (data.dailySpecialUpdatedAt && data.dailySpecial?.name) {
            const updated = new Date(data.dailySpecialUpdatedAt)
            const now = new Date()
            const hoursDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60)
            if (hoursDiff > 24) {
              checkAndCreateNotification()
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkAndCreateNotification = async () => {
    try {
      // Check if notification already exists
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const notifications = await res.json()
          const hasExpiredNotification = notifications.some(
          (n: any) => n.type === 'warning' && n.title === t('admin.dailySpecialExpired')
        )
        if (!hasExpiredNotification) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'warning',
              title: t('admin.dailySpecialExpired'),
              message: t('admin.dailySpecialExpiredMsg'),
            }),
          })
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      showMessage(setPasswordMessage, setPasswordMessageType, 'New passwords do not match', 'error')
      return
    }

    setIsChangingPassword(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        showMessage(setPasswordMessage, setPasswordMessageType, 'Password changed successfully!', 'success')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showMessage(setPasswordMessage, setPasswordMessageType, data.error || 'Failed to change password', 'error')
      }
    } catch {
      showMessage(setPasswordMessage, setPasswordMessageType, 'An error occurred. Please try again.', 'error')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      const dbData = {
        ...settings,
        openingHours: getDbOpeningHours(),
        dailySpecialUpdatedAt: settings.dailySpecial.name ? new Date().toISOString() : null,
      }
      const res = await fetch('/api/cafe', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbData),
      })

      if (res.ok) {
        const updatedCafe = await res.json()
        setCafeData(updatedCafe)
        showMessage(setMessage, setMessageType, t('admin.settingsSaved'), 'success')
        router.refresh()
      } else {
        const errorData = await res.json().catch(() => ({}))
        showMessage(setMessage, setMessageType, errorData.error || t('admin.saveFailed'), 'error')
      }
    } catch (error) {
      showMessage(setMessage, setMessageType, t('admin.saveError'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const updateOpeningHours = (day: keyof typeof settings.openingHours, field: 'open' | 'close', value: string) => {
    setSettings({
      ...settings,
      openingHours: {
        ...settings.openingHours,
        [day]: { ...settings.openingHours[day], [field]: value },
      },
    })
  }

  // Convert settings format (weekdays/saturday/sunday) to DB format (individual days)
  const getDbOpeningHours = () => {
    const { weekdays, saturday, sunday } = settings.openingHours
    return {
      monday: weekdays,
      tuesday: weekdays,
      wednesday: weekdays,
      thursday: weekdays,
      friday: weekdays,
      saturday,
      sunday,
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {(message || passwordMessage) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none px-4">
          <div
            role="status"
            aria-live="polite"
            className={`pointer-events-auto max-w-md rounded-2xl px-6 py-4 text-center text-sm font-medium shadow-2xl backdrop-blur-md ${
              (passwordMessage ? passwordMessageType : messageType) === 'success'
                ? 'bg-green-100/95 text-green-800 dark:bg-green-900/90 dark:text-green-100'
                : 'bg-red-100/95 text-red-800 dark:bg-red-900/90 dark:text-red-100'
            }`}
          >
            {passwordMessage || message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">{t('admin.settings')}</h1>
          <p className="text-muted-foreground mt-1">{t('admin.settingsSubtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">{t('admin.basicInfo')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin.cafeName')}
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
            <Input
              label={t('admin.urlSlug')}
              value={settings.slug}
              onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">{t('admin.cafeLogo')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  const uploadFormData = new FormData()
                  uploadFormData.append('file', file)

                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                  })

                  if (res.ok) {
                    const data = await res.json()
                    setSettings({ ...settings, logo: data.url })
                  } else {
                    alert(t('admin.uploadLogoFailed'))
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {settings.logo && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border">
                  <Image src={settings.logo} alt="Logo preview" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Hero Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">{t('admin.heroImage')}</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  const uploadFormData = new FormData()
                  uploadFormData.append('file', file)

                  const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                  })

                  if (res.ok) {
                    const data = await res.json()
                    setSettings({ ...settings, heroImage: data.url })
                  } else {
                    alert(t('admin.uploadHeroFailed'))
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {settings.heroImage && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border">
                  <Image src={settings.heroImage} alt="Hero preview" fill className="object-cover" />
                </div>
              )}
            </div>
          </div>

          <Input
            label={t('admin.tagline')}
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            placeholder={t('hero.tagline')}
          />
        </div>

        {/* Contact Info */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">{t('admin.contactInfo')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('admin.address')}
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
            <Input
              label={t('admin.phone')}
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>

          <Input
            label={t('admin.email')}
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
        </div>

        {/* Branding Colors */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">{t('admin.brandingColors')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t('admin.primaryColor')}</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">{t('admin.secondaryColor')}</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="w-12 h-12 rounded-lg border cursor-pointer"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">{t('admin.socialLinks')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label={t('admin.instagram')}
              value={settings.socialLinks.instagram}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, instagram: e.target.value },
              })}
              placeholder="https://instagram.com/..."
            />
            <Input
              label={t('admin.facebook')}
              value={settings.socialLinks.facebook}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, facebook: e.target.value },
              })}
              placeholder="https://facebook.com/..."
            />
            <Input
              label={t('admin.twitter')}
              value={settings.socialLinks.twitter}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, twitter: e.target.value },
              })}
              placeholder="https://twitter.com/..."
            />
          </div>
        </div>

        {/* Opening Hours */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">{t('admin.openingHours')}</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium shrink-0">{t('admin.weekdays')}</span>
              <Input
                type="time"
                value={settings.openingHours.weekdays.open}
                onChange={(e) => updateOpeningHours('weekdays', 'open', e.target.value)}
                className="flex-1 min-w-0"
              />
              <span className="text-muted-foreground text-sm shrink-0">{t('admin.to')}</span>
              <Input
                type="time"
                value={settings.openingHours.weekdays.close}
                onChange={(e) => updateOpeningHours('weekdays', 'close', e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium shrink-0">{t('admin.saturday')}</span>
              <Input
                type="time"
                value={settings.openingHours.saturday.open}
                onChange={(e) => updateOpeningHours('saturday', 'open', e.target.value)}
                className="flex-1 min-w-0"
              />
              <span className="text-muted-foreground text-sm shrink-0">{t('admin.to')}</span>
              <Input
                type="time"
                value={settings.openingHours.saturday.close}
                onChange={(e) => updateOpeningHours('saturday', 'close', e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium shrink-0">{t('admin.sunday')}</span>
              <Input
                type="time"
                value={settings.openingHours.sunday.open}
                onChange={(e) => updateOpeningHours('sunday', 'open', e.target.value)}
                className="flex-1 min-w-0"
              />
              <span className="text-muted-foreground text-sm shrink-0">{t('admin.to')}</span>
              <Input
                type="time"
                value={settings.openingHours.sunday.close}
                onChange={(e) => updateOpeningHours('sunday', 'close', e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
          </div>
        </div>

        {/* Map Embed */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">{t('admin.mapEmbed')}</h2>
          <p className="text-sm text-muted-foreground">
            Paste your Google Maps or other map embed code below. This will be displayed on the contact page.
          </p>
          <textarea
            value={settings.mapEmbed}
            onChange={(e) => setSettings({ ...settings, mapEmbed: e.target.value })}
            placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
            rows={6}
            className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 resize-none font-mono text-sm"
          />
        </div>

        {/* Daily Special */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{t('admin.dailySpecial')}</h2>
            {cafeData?.dailySpecialUpdatedAt && (
              <div className={`text-sm px-3 py-1 rounded-full ${
                isSpecialExpired(cafeData.dailySpecialUpdatedAt)
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {isSpecialExpired(cafeData.dailySpecialUpdatedAt) ? '⚠️ Expired' : '✓ Active'}
              </div>
            )}
          </div>

          {cafeData?.dailySpecialUpdatedAt && (
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(cafeData.dailySpecialUpdatedAt).toLocaleString()}
              {isSpecialExpired(cafeData.dailySpecialUpdatedAt) && (
                <span className="text-red-600 dark:text-red-400 ml-2">(Expired 24h ago)</span>
              )}
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Special Name"
              value={settings.dailySpecial.name}
              onChange={(e) => setSettings({
                ...settings,
                dailySpecial: { ...settings.dailySpecial, name: e.target.value },
              })}
              placeholder="Today's Special"
            />
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={settings.dailySpecial.price}
              onChange={(e) => setSettings({
                ...settings,
                dailySpecial: { ...settings.dailySpecial, price: e.target.value },
              })}
              placeholder="9.99"
            />
          </div>

          <Input
            label="Description"
            value={settings.dailySpecial.description}
            onChange={(e) => setSettings({
              ...settings,
              dailySpecial: { ...settings.dailySpecial, description: e.target.value },
            })}
            placeholder="Describe the special..."
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return

                const uploadFormData = new FormData()
                uploadFormData.append('file', file)

                const res = await fetch('/api/upload', {
                  method: 'POST',
                  body: uploadFormData,
                })

                if (res.ok) {
                  const data = await res.json()
                  setSettings({
                    ...settings,
                    dailySpecial: { ...settings.dailySpecial, image: data.url },
                  })
                }
              }}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {settings.dailySpecial.image && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <Image src={settings.dailySpecial.image} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* About Section */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">{t('admin.aboutSection')}</h2>

          <Input
            label="About Title"
            value={settings.aboutTitle}
            onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
            placeholder="Our Story"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium">About Description</label>
            <textarea
              value={settings.aboutDescription}
              onChange={(e) => setSettings({ ...settings, aboutDescription: e.target.value })}
              placeholder="Tell your café's story..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-200 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">About Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return

                const uploadFormData = new FormData()
                uploadFormData.append('file', file)

                const res = await fetch('/api/upload', {
                  method: 'POST',
                  body: uploadFormData,
                })

                if (res.ok) {
                  const data = await res.json()
                  setSettings({ ...settings, aboutImage: data.url })
                }
              }}
              className="w-full px-4 py-3 rounded-xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
            {settings.aboutImage && (
              <div className="mt-2 relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={settings.aboutImage}
                  alt="About preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>


        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving} size="lg">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>

      {/* Change Password */}
      <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-500" />
            Change Password
          </h2>
          <p className="text-sm text-muted-foreground">
            Update your admin password. You'll need to use the new password next time you sign in.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 chars with uppercase, lowercase, number, special char"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" isLoading={isChangingPassword} variant="outline">
              <KeyRound className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </form>
        </div>

    </div>
  )
}
