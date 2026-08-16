import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'
import config from '@/lib/config'

const updateCafeSchema = z.object({
  name: z.string().max(200).optional(),
  slug: z.string().max(100).optional(),
  logo: z.string().max(2000).nullable().optional(),
  heroImage: z.string().max(2000).nullable().optional(),
  tagline: z.string().max(500).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  phone: z.string().max(100).nullable().optional(),
  email: z.string().email().or(z.literal('')).nullable().optional(),
  primaryColor: z.string().max(50).optional(),
  secondaryColor: z.string().max(50).optional(),
  language: z.string().max(20).optional(),
  // JSON columns — validated as objects by Prisma at write time
  openingHours: z.any().optional(),
  socialLinks: z.any().optional(),
  dailySpecial: z.any().optional(),
  dailySpecialUpdatedAt: z.string().nullable().optional(),
  mapEmbed: z.string().max(20000).nullable().optional(),
  aboutTitle: z.string().max(500).nullable().optional(),
  aboutDescription: z.string().max(10000).nullable().optional(),
  aboutImage: z.string().max(2000).nullable().optional(),
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

    const data = await request.json()
    const validated = updateCafeSchema.parse(data)

    const existingCafe = await prisma.cafe.findFirst()
    const cafeData = {
      name: validated.name,
      slug: validated.slug || config.cafe.slug,
      logo: validated.logo,
      heroImage: validated.heroImage,
      tagline: validated.tagline,
      address: validated.address,
      phone: validated.phone,
      email: validated.email,
      primaryColor: validated.primaryColor || config.cafe.primaryColor,
      secondaryColor: validated.secondaryColor || config.cafe.secondaryColor,
      language: validated.language || config.cafe.language,
      openingHours: validated.openingHours,
      socialLinks: validated.socialLinks,
      dailySpecial: validated.dailySpecial,
      dailySpecialUpdatedAt: validated.dailySpecialUpdatedAt,
      mapEmbed: validated.mapEmbed,
      aboutTitle: validated.aboutTitle,
      aboutDescription: validated.aboutDescription,
      aboutImage: validated.aboutImage,
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
