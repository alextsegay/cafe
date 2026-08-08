import { Navbar, Footer } from '@/components/shared'
import { About } from '@/components/landing'
import { prisma } from '@/lib/prisma'

async function getData() {
  try {
    const cafe = await prisma.cafe.findFirst()

    return {
      cafe: cafe ? {
        ...cafe,
        openingHours: cafe.openingHours as any,
        socialLinks: cafe.socialLinks as any,
        dailySpecial: cafe.dailySpecial as any,
      } : null,
    }
  } catch {
    return { cafe: null }
  }
}

export async function generateMetadata() {
  const data = await getData()
  
  return {
    title: data.cafe ? `${data.cafe.name} | About Us` : 'About Us',
    description: 'Learn more about our story, passion for coffee, and what makes us special.',
  }
}

export default async function AboutPage() {
  const { cafe } = await getData()

  return (
    <main className="min-h-screen">
      <Navbar
        logo={cafe?.logo || undefined}
        cafeName={cafe?.name}
      />
      <About
        image={cafe?.aboutImage || undefined}
        title={cafe?.aboutTitle || undefined}
        description={cafe?.aboutDescription || undefined}
      />
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
