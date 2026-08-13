import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import config from '@/lib/config'
import { z } from 'zod'

const timeRangeSchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/, 'Opening time must use HH:mm format'),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'Closing time must use HH:mm format'),
})

const openingHoursSchema = z.object({
  monday: timeRangeSchema,
  tuesday: timeRangeSchema,
  wednesday: timeRangeSchema,
  thursday: timeRangeSchema,
  friday: timeRangeSchema,
  saturday: timeRangeSchema,
  sunday: timeRangeSchema,
})

const optionalUrlSchema = z.string().url().or(z.literal('')).optional()
const optionalTextSchema = z.string().optional()
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex value')

const cafeSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Cafe name is required'),
  slug: z.string().trim().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  logo: optionalUrlSchema,
  heroImage: optionalUrlSchema,
  tagline: optionalTextSchema,
  address: optionalTextSchema,
  phone: optionalTextSchema,
  email: z.string().email('Email must be valid').optional().or(z.literal('')),
  primaryColor: colorSchema.optional(),
  secondaryColor: colorSchema.optional(),
  language: z.enum(['en', 'am']).optional(),
  openingHours: openingHoursSchema.optional(),
  socialLinks: z.object({
    instagram: optionalUrlSchema,
    facebook: optionalUrlSchema,
    twitter: optionalUrlSchema,
  }).optional(),
  dailySpecial: z.object({
    name: optionalTextSchema,
    description: optionalTextSchema,
    price: z.string().optional().or(z.number()).or(z.literal('')),
    image: optionalUrlSchema,
  }).optional(),
  dailySpecialUpdatedAt: z.string().datetime({ offset: true }).nullable().optional(),
  mapEmbed: optionalTextSchema,
  aboutTitle: optionalTextSchema,
  aboutDescription: optionalTextSchema,
  aboutImage: optionalUrlSchema,
})

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst()
    if (!cafe) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(cafe, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = cafeSettingsSchema.parse(await request.json())

    const existingCafe = await prisma.cafe.findFirst()
    const cafeData = {
      name: data.name,
      slug: data.slug || config.cafe.slug,
      logo: data.logo,
      heroImage: data.heroImage,
      tagline: data.tagline,
      address: data.address,
      phone: data.phone,
      email: data.email,
      primaryColor: data.primaryColor || config.cafe.primaryColor,
      secondaryColor: data.secondaryColor || config.cafe.secondaryColor,
      language: data.language || config.cafe.language,
      openingHours: data.openingHours,
      socialLinks: data.socialLinks,
      dailySpecial: data.dailySpecial,
      dailySpecialUpdatedAt: data.dailySpecialUpdatedAt ? new Date(data.dailySpecialUpdatedAt) : null,
      mapEmbed: data.mapEmbed,
      aboutTitle: data.aboutTitle,
      aboutDescription: data.aboutDescription,
      aboutImage: data.aboutImage,
    }

    const cafe = existingCafe
      ? await prisma.cafe.update({
          where: { id: existingCafe.id },
          data: cafeData,
        })
      : await prisma.cafe.create({
          data: {
            ...cafeData,
            name: data.name || config.cafe.name,
          },
        })

    return NextResponse.json(cafe)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Update cafe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return PUT(request)
}
