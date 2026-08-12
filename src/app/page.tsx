import { Hero, About, FeaturedMenu, GallerySection, Testimonials, Contact } from '@/components/landing'
import { Navbar, Footer } from '@/components/shared'
import { prisma } from '@/lib/prisma'

export const revalidate = 0
export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const [cafe, menuItems, gallery] = await Promise.all([
      prisma.cafe.findFirst(),
      prisma.menuItem.findMany({
        where: { popular: true, available: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.gallery.findMany({
        orderBy: { order: 'asc' },
        take: 6,
      }),
    ])

    if (!cafe) return { cafe: null, menuItems: [], gallery: [] }

    return {
      cafe: {
        ...(cafe as any),
        openingHours: cafe.openingHours as any,
        socialLinks: cafe.socialLinks as any,
      } as any,
      menuItems,
      gallery,
    }
  } catch {
    return {
      cafe: null,
      menuItems: [],
      gallery: [],
    }
  }
}

export default async function HomePage() {
  const { cafe, menuItems, gallery } = await getData()

  return (
    <main className="min-h-screen">
      <Navbar 
        logo={cafe?.logo || undefined}
        cafeName={cafe?.name}
      />
      <Hero
        heroImage={cafe?.heroImage || undefined}
        cafeName={cafe?.name}
        tagline={cafe?.tagline || undefined}
      />
      <About
        image={cafe?.aboutImage || undefined}
        title={cafe?.aboutTitle || undefined}
        description={cafe?.aboutDescription || undefined}
      />
      <FeaturedMenu items={menuItems} />
      <GallerySection images={gallery} />
      <Testimonials />
      <Contact
        address={cafe?.address || undefined}
        phone={cafe?.phone || undefined}
        email={cafe?.email || undefined}
        openingHours={cafe?.openingHours || undefined}
        mapEmbed={cafe?.mapEmbed || undefined}
      />
      <Footer
        cafeName={cafe?.name}
        slug={cafe?.slug}
        address={cafe?.address || undefined}
        phone={cafe?.phone || undefined}
        email={cafe?.email || undefined}
        openingHours={cafe?.openingHours || undefined}
        socialLinks={cafe?.socialLinks || undefined}
      />
    </main>
  )
}
