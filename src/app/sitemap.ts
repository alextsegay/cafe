import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    const cafes = await prisma.cafe.findMany({
      select: { slug: true, updatedAt: true },
    })

    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
    ]

    const menuPages: MetadataRoute.Sitemap = cafes.map((cafe) => ({
      url: `${baseUrl}/menu/${cafe.slug}`,
      lastModified: new Date(cafe.updatedAt),
      changeFrequency: 'daily',
      priority: 0.9,
    }))

    return [...staticPages, ...menuPages]
  } catch {
    // Return basic sitemap if database is not available
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
      {
        url: `${baseUrl}/menu/premium-cafe`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]
  }
}
