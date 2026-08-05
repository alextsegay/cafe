import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/hooks/useTheme'
import { I18nProvider } from '@/lib/i18n'
import { PWAProvider } from '@/components/PWAProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'Premium Café | Digital Menu',
  description: 'Experience the art of fine coffee with our premium digital menu. Explore our selection of artisan coffees, teas, pastries, and more.',
  keywords: ['cafe', 'coffee', 'digital menu', 'premium cafe', 'artisan coffee'],
  authors: [{ name: 'Premium Café' }],
  openGraph: {
    title: 'Premium Café | Digital Menu',
    description: 'Experience the art of fine coffee with our premium digital menu.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Premium Café | Digital Menu',
    description: 'Experience the art of fine coffee with our premium digital menu.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#C9A962' },
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
