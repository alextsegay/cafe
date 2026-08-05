import { Navbar, Footer } from '@/components/shared'
import { GallerySection } from '@/components/landing'
import { prisma } from '@/lib/prisma'
import type { Gallery } from '@/types'

async function getData() {
  try {
    const [cafe, gallery] = await Promise.all([
      prisma.cafe.findFirst(),
      prisma.gallery.findMany({
        orderBy: { order: 'asc' },
      }),
    ])

    return {
      cafe: cafe ? {
        ...cafe,
        openingHours: cafe.openingHours as any,
        socialLinks: cafe.socialLinks as any,
        dailySpecial: cafe.dailySpecial as any,
      } : null,
      gallery: gallery.map(item => ({
        ...item,
        image: item.image,
      })) as Gallery[],
    }
  } catch {
    return { cafe: null, gallery: [] as Gallery[] }
  }
}

export async function generateMetadata() {
  const data = await getData()
  
  return {
    title: data.cafe ? `${data.cafe.name} | Gallery` : 'Gallery',
    description: 'Browse our gallery and see the ambiance of our café.',
  }
}

export default async function GalleryPage() {
  const { cafe, gallery } = await getData()

  return (
    <main className="min-h-screen">
      <Navbar
        logo={cafe?.logo || undefined}
        cafeName={cafe?.name}
      />
      <GallerySection images={gallery} />
      <Footer
        cafeName={cafe?.name}
        address={cafe?.address || undefined}
        phone={cafe?.phone || undefined}
        email={cafe?.email || undefined}
        openingHours={cafe?.openingHours || undefined}
        socialLinks={cafe?.socialLinks || undefined}
      />
    </main>
  )
}
