'use client'

import { useState, useEffect } from 'react'
import { Download, Printer, QrCode, Loader2, Copy, Check } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import QRCodeLib from 'qrcode'

export default function QRCodePage() {
  const [menuUrl, setMenuUrl] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [cafeSlug, setCafeSlug] = useState('premium-cafe')
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [qrSize, setQrSize] = useState(400)

  useEffect(() => {
    fetchCafe()
  }, [])

  useEffect(() => {
    if (menuUrl) {
      generateQRCode()
    }
  }, [menuUrl, qrSize])

  const fetchCafe = async () => {
    try {
      const res = await fetch('/api/cafe')
      if (res.ok) {
        const data = await res.json()
        if (data) {
          setCafeSlug(data.slug)
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
          setMenuUrl(`${baseUrl}/menu/${data.slug}`)
        }
      }
    } catch (error) {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      setMenuUrl(`${baseUrl}/menu/${cafeSlug}`)
    } finally {
      setIsLoading(false)
    }
  }

  const generateQRCode = async () => {
    try {
      const canvas = document.createElement('canvas')
      await QRCodeLib.toCanvas(canvas, menuUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCodeUrl(canvas.toDataURL('image/png'))
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadPNG = () => {
    const link = document.createElement('a')
    link.download = `cafe-menu-qr-${cafeSlug}.png`
    link.href = qrCodeUrl
    link.click()
  }

  const downloadSVG = async () => {
    try {
      const svgString = await QRCodeLib.toString(menuUrl, {
        type: 'svg',
        width: qrSize,
        margin: 2,
      })
      
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `cafe-menu-qr-${cafeSlug}.svg`
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating SVG:', error)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${cafeSlug}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: system-ui;
              }
              img { max-width: 300px; }
              p { margin-top: 20px; font-size: 14px; color: #666; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <p>Scan to view our digital menu</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold">QR Code Generator</h1>
        <p className="text-muted-foreground mt-1">Generate and download QR codes for your digital menu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Preview */}
        <div className="glass rounded-2xl p-8 flex flex-col items-center">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-full max-w-sm mx-auto"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
                <QrCode className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Button onClick={downloadPNG}>
              <Download className="w-4 h-4 mr-2" />
              Download PNG
            </Button>
            <Button variant="secondary" onClick={downloadSVG}>
              <Download className="w-4 h-4 mr-2" />
              Download SVG
            </Button>
            <Button variant="secondary" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Settings */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="font-semibold text-lg">QR Code Settings</h2>
            
            <Input
              label="Menu URL"
              value={menuUrl}
              onChange={(e) => setMenuUrl(e.target.value)}
            />

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">QR Code Size</label>
                <input
                  type="range"
                  min="200"
                  max="800"
                  step="50"
                  value={qrSize}
                  onChange={(e) => setQrSize(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>200px</span>
                  <span>{qrSize}px</span>
                  <span>800px</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-6">
            <h2 className="font-semibold text-lg">Share Your Menu</h2>
            
            <p className="text-sm text-muted-foreground">
              Share this URL with your customers. When they scan the QR code, they'll be taken directly to your digital menu.
            </p>

            <div className="flex gap-2">
              <Input
                value={menuUrl}
                readOnly
                className="flex-1"
              />
              <Button variant="secondary" onClick={copyToClipboard}>
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">Print Tips</h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• For best results, print at 300 DPI</li>
              <li>• Recommended minimum size: 2" x 2" (5cm x 5cm)</li>
              <li>• Use high contrast paper (white background)</li>
              <li>• Place QR codes in well-lit areas</li>
              <li>• Test the QR code with your phone before printing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
