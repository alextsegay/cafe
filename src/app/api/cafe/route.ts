import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import config from '@/lib/config'

export async function GET() {
  try {
    const cafe = await prisma.cafe.findFirst()
    if (!cafe) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(cafe)
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
      dailySpecialUpdatedAt: data.dailySpecialUpdatedAt,
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
    console.error('Update cafe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return PUT(request)
}
