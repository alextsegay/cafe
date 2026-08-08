import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'
import { I18nProvider } from '@/lib/i18n'
import { PWAProvider } from '@/components/PWAProvider'
import { prisma } from '@/lib/prisma'
import config from '@/lib/config'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

async function getSiteMetadata(): Promise<Metadata> {
  try {
    const cafe = await prisma.cafe.findFirst()
    const cafeName = cafe?.name || config.cafe.name
    const description = cafe?.tagline || config.cafe.tagline
    const logo = cafe?.logo || undefined

    return {
      title: {
        default: `${cafeName} | Digital Menu`,
        template: `%s | ${cafeName}`,
      },
      description,
      keywords: ['cafe', 'coffee', 'digital menu', 'restaurant', 'food'],
      authors: [{ name: cafeName }],
      openGraph: {
        title: `${cafeName} | Digital Menu`,
        description,
        type: 'website',
        locale: 'en_US',
        ...(logo && { images: [logo] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${cafeName} | Digital Menu`,
        description,
        ...(logo && { images: [logo] }),
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  } catch {
    return {
      title: {
        default: `${config.cafe.name} | Digital Menu`,
        template: `%s | ${config.cafe.name}`,
      },
      description: config.cafe.tagline,
      keywords: ['cafe', 'coffee', 'digital menu', 'restaurant', 'food'],
      authors: [{ name: config.cafe.name }],
      openGraph: {
        title: `${config.cafe.name} | Digital Menu`,
        description: config.cafe.tagline,
        type: 'website',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${config.cafe.name} | Digital Menu`,
        description: config.cafe.tagline,
      },
      robots: {
        index: true,
        follow: true,
      },
    }
  }
}

export const metadata: Metadata = await getSiteMetadata()

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: config.cafe.primaryColor },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <PWAProvider>
          <ThemeProvider>
            <I18nProvider>
              {children}
            </I18nProvider>
          </ThemeProvider>
        </PWAProvider>
      </body>
    </html>
  )
}
