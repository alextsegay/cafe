import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst()
    if (!cafe) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Parse JSON strings for SQLite compatibility
    const parsedCafe = {
      ...cafe,
      openingHours: cafe.openingHours ? JSON.parse(cafe.openingHours as string) : null,
      socialLinks: cafe.socialLinks ? JSON.parse(cafe.socialLinks as string) : null,
      dailySpecial: cafe.dailySpecial ? JSON.parse(cafe.dailySpecial as string) : null,
    }

    return NextResponse.json(parsedCafe)
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

    const cafe = await prisma.cafe.upsert({
      where: { slug: data.slug || 'premium-cafe' },
      update: {
        name: data.name,
        logo: data.logo,
        heroImage: data.heroImage,
        tagline: data.tagline,
        address: data.address,
        phone: data.phone,
        email: data.email,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        language: data.language,
        openingHours: data.openingHours ? JSON.stringify(data.openingHours) : null,
        socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        dailySpecial: data.dailySpecial ? JSON.stringify(data.dailySpecial) : null,
        dailySpecialUpdatedAt: data.dailySpecialUpdatedAt,
        mapEmbed: data.mapEmbed,
        aboutTitle: data.aboutTitle,
        aboutDescription: data.aboutDescription,
        aboutImage: data.aboutImage,
      },
      create: {
        name: data.name || 'Premium Café',
        slug: 'premium-cafe',
        logo: data.logo,
        heroImage: data.heroImage,
        tagline: data.tagline,
        address: data.address,
        phone: data.phone,
        email: data.email,
        primaryColor: data.primaryColor || '#C9A962',
        secondaryColor: data.secondaryColor || '#3D2914',
        language: data.language || 'en',
        openingHours: data.openingHours ? JSON.stringify(data.openingHours) : null,
        socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : null,
        dailySpecial: data.dailySpecial ? JSON.stringify(data.dailySpecial) : null,
        dailySpecialUpdatedAt: data.dailySpecialUpdatedAt,
        mapEmbed: data.mapEmbed,
        aboutTitle: data.aboutTitle,
        aboutDescription: data.aboutDescription,
        aboutImage: data.aboutImage,
      },
    })

    // Parse JSON strings for response
    const parsedCafe = {
      ...cafe,
      openingHours: cafe.openingHours ? JSON.parse(cafe.openingHours as string) : null,
      socialLinks: cafe.socialLinks ? JSON.parse(cafe.socialLinks as string) : null,
      dailySpecial: cafe.dailySpecial ? JSON.parse(cafe.dailySpecial as string) : null,
    }

    return NextResponse.json(parsedCafe)
  } catch (error) {
    console.error('Update cafe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
