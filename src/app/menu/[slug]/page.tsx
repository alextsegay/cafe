import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MenuClient } from '@/components/menu/MenuItemCard'
import { Navbar, Footer } from '@/components/shared'

interface MenuPageProps {
  params: Promise<{ slug: string }>
}

async function getData(slug: string) {
  try {
    const cafe = await prisma.cafe.findUnique({
      where: { slug },
    })

    if (!cafe) return null

    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    })

    const menuItems = await prisma.menuItem.findMany({
      where: { available: true },
      include: { category: true },
      orderBy: [{ popular: 'desc' }, { isNew: 'desc' }, { createdAt: 'desc' }],
    })

    // Check if daily special is expired (older than 24 hours)
    let dailySpecial = cafe.dailySpecial as any
    if (cafe.dailySpecialUpdatedAt && dailySpecial) {
      const updated = new Date(cafe.dailySpecialUpdatedAt)
      const now = new Date()
      const hoursDiff = (now.getTime() - updated.getTime()) / (1000 * 60 * 60)
      if (hoursDiff > 24) {
        dailySpecial = null // Don't show expired special
      }
    }

    return {
      cafe: {
        ...cafe,
        openingHours: cafe.openingHours as any,
        socialLinks: cafe.socialLinks as any,
        dailySpecial,
      },
      categories,
      menuItems: menuItems.map(item => ({
        ...item,
        description: item.description as string | null,
        descriptionAm: item.descriptionAm as string | null,
        ingredients: item.ingredients as string | null,
        ingredientsAm: item.ingredientsAm as string | null,
      })),
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: MenuPageProps) {
  const { slug } = await params
  const data = await getData(slug)
  
  if (!data) {
    return {
      title: 'Menu Not Found',
    }
  }

  return {
    title: `${data.cafe.name} | Digital Menu`,
    description: `Explore our delicious menu at ${data.cafe.name}`,
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params
  const data = await getData(slug)

  if (!data) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Navbar
        logo={data.cafe.logo || undefined}
        cafeName={data.cafe.name}
      />
      <MenuClient
        cafeName={data.cafe.name}
        categories={data.categories}
        menuItems={data.menuItems}
        dailySpecial={data.cafe.dailySpecial}
      />
      <Footer
        cafeName={data.cafe.name}
        address={data.cafe.address || undefined}
        phone={data.cafe.phone || undefined}
        email={data.cafe.email || undefined}
        openingHours={data.cafe.openingHours || undefined}
        socialLinks={data.cafe.socialLinks || undefined}
      />
    </main>
  )
}
