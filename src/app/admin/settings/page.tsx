'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Save, Loader2, Image as ImageIcon } from 'lucide-react'
import { Button, Input, Select } from '@/components/ui'

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
  const [settings, setSettings] = useState<CafeSettings>({
    name: '',
    slug: 'premium-cafe',
    logo: '',
    heroImage: '',
    tagline: 'Experience the Art of Fine Coffee',
    address: '',
    phone: '',
    email: '',
    primaryColor: '#C9A962',
    secondaryColor: '#3D2914',
    language: 'en',
    openingHours: {
      weekdays: { open: '07:00', close: '22:00' },
      saturday: { open: '08:00', close: '23:00' },
      sunday: { open: '08:00', close: '21:00' },
    },
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
    },
    dailySpecial: {
      name: '',
      description: '',
      price: '',
      image: '',
    },
    mapEmbed: '',
    aboutTitle: 'Our Story',
    aboutDescription: 'Welcome to Premium Café, where every cup tells a story. We source the finest beans from around the world and craft each beverage with dedication and love.',
    aboutImage: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [cafeData, setCafeData] = useState<any>(null)

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
      const res = await fetch('/api/cafe')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          // Convert individual days to weekdays format for settings form
          const dbOpeningHours = data.openingHours as any
          const openingHours = dbOpeningHours?.monday ? {
            weekdays: {
              open: dbOpeningHours.monday?.open || '07:00',
              close: dbOpeningHours.monday?.close || '22:00',
            },
            saturday: {
              open: dbOpeningHours.saturday?.open || '08:00',
              close: dbOpeningHours.saturday?.close || '23:00',
            },
            sunday: {
              open: dbOpeningHours.sunday?.open || '08:00',
              close: dbOpeningHours.sunday?.close || '21:00',
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
          (n: any) => n.type === 'warning' && n.title === 'Daily Special Expired'
        )
        if (!hasExpiredNotification) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'warning',
              title: 'Daily Special Expired',
              message: 'Your daily special has expired. Please update it to keep your menu fresh.',
            }),
          })
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error)
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
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
        fetchSettings() // Refresh to get updated timestamp
      } else {
        const errorData = await res.json().catch(() => ({}))
        setMessage(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      setMessage('An error occurred while saving')
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Customize your café's branding and information</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-xl text-sm ${
            message.includes('success') 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Café Name"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
            <Input
              label="URL Slug"
              value={settings.slug}
              onChange={(e) => setSettings({ ...settings, slug: e.target.value })}
              disabled
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Café Logo</label>
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
                    alert('Failed to upload logo image')
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
              <label className="block text-sm font-medium">Hero Image</label>
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
                    alert('Failed to upload hero image')
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
            label="Tagline"
            value={settings.tagline}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            placeholder="Experience the Art of Fine Coffee"
          />
        </div>

        {/* Contact Info */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">Contact Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Address"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            />
            <Input
              label="Phone"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
        </div>

        {/* Branding Colors */}
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="font-semibold text-lg">Branding Colors</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Primary Color</label>
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
              <label className="block text-sm font-medium">Secondary Color</label>
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
          <h2 className="font-semibold text-lg">Social Media Links</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Instagram"
              value={settings.socialLinks.instagram}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, instagram: e.target.value },
              })}
              placeholder="https://instagram.com/..."
            />
            <Input
              label="Facebook"
              value={settings.socialLinks.facebook}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: { ...settings.socialLinks, facebook: e.target.value },
              })}
              placeholder="https://facebook.com/..."
            />
            <Input
              label="Twitter"
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
          <h2 className="font-semibold text-lg">Opening Hours</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium shrink-0">Mon - Fri</span>
              <Input
                type="time"
                value={settings.openingHours.weekdays.open}
                onChange={(e) => updateOpeningHours('weekdays', 'open', e.target.value)}
                className="flex-1 min-w-0"
              />
              <span className="text-muted-foreground text-sm shrink-0">to</span>
              <Input
                type="time"
                value={settings.openingHours.weekdays.close}
                onChange={(e) => updateOpeningHours('weekdays', 'close', e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium shrink-0">Saturday</span>
              <Input
                type="time"
                value={settings.openingHours.saturday.open}
                onChange={(e) => updateOpeningHours('saturday', 'open', e.target.value)}
                className="flex-1 min-w-0"
              />
              <span className="text-muted-foreground text-sm shrink-0">to</span>
              <Input
                type="time"
                value={settings.openingHours.saturday.close}
                onChange={(e) => updateOpeningHours('saturday', 'close', e.target.value)}
                className="flex-1 min-w-0"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium shrink-0">Sunday</span>
              <Input
                type="time"
                value={settings.openingHours.sunday.open}
                onChange={(e) => updateOpeningHours('sunday', 'open', e.target.value)}
                className="flex-1 min-w-0"
              />
              <span className="text-muted-foreground text-sm shrink-0">to</span>
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
          <h2 className="font-semibold text-lg">Map Embed</h2>
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
            <h2 className="font-semibold text-lg">Daily Special Banner</h2>
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
          <h2 className="font-semibold text-lg">About Section</h2>

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
    </div>
  )
}
