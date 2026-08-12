import { Navbar, Footer } from '@/components/shared'
import { Contact } from '@/components/landing'
import { prisma } from '@/lib/prisma'

async function getData() {
  try {
    const cafe = await prisma.cafe.findFirst()

    if (!cafe) return { cafe: null }

    return {
      cafe: {
        ...(cafe as any),
        openingHours: cafe.openingHours as any,
        socialLinks: cafe.socialLinks as any,
        dailySpecial: cafe.dailySpecial as any,
      } as any,
    }
  } catch {
    return { cafe: null }
  }
}

export async function generateMetadata() {
  const data = await getData()
  
  return {
    title: data.cafe ? `${data.cafe.name} | Contact Us` : 'Contact Us',
    description: 'Get in touch with us. We would love to hear from you.',
  }
}

export default async function ContactPage() {
  const { cafe } = await getData()

  return (
    <main className="min-h-screen">
      <Navbar
        logo={cafe?.logo || undefined}
        cafeName={cafe?.name}
      />
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
