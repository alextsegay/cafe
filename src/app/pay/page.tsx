import { Navbar, Footer } from '@/components/shared'
import BankPayments from '@/components/payment/BankPayments'
import { prisma } from '@/lib/prisma'
import { CreditCard } from 'lucide-react'

export const revalidate = 0
export const dynamic = 'force-dynamic'

async function getData() {
  try {
    const [cafe, accounts] = await Promise.all([
      prisma.cafe.findFirst(),
      prisma.bankAccount.findMany({
        where: { visible: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      }),
    ])

    return { cafe, accounts }
  } catch {
    return { cafe: null, accounts: [] }
  }
}

export async function generateMetadata() {
  const data = await getData()

  return {
    title: data.cafe ? `${data.cafe.name} | Pay` : 'Pay Us',
    description: 'Pay easily with your preferred bank account.',
  }
}

export default async function PayPage() {
  const { cafe, accounts } = await getData()

  return (
    <main className="min-h-screen">
      <Navbar logo={cafe?.logo || undefined} cafeName={cafe?.name} />
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white mb-5 shadow-lg">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            {cafe?.name || 'Café'} · Pay
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {cafe?.tagline || 'Choose your bank and transfer easily.'} Scan the QR
            or copy the account number to pay.
          </p>
        </div>

        <BankPayments accounts={accounts.map((a) => ({ ...a }))} />
      </section>
      <Footer
        cafeName={cafe?.name}
        slug={cafe?.slug}
        address={cafe?.address || undefined}
        phone={cafe?.phone || undefined}
        email={cafe?.email || undefined}
        openingHours={(cafe?.openingHours as any) || undefined}
        socialLinks={(cafe?.socialLinks as any) || undefined}
      />
    </main>
  )
}
