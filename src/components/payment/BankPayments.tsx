'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Landmark } from 'lucide-react'
import { getBankColor } from '@/lib/ethiopian-banks'
import { useI18n } from '@/lib/i18n'

export interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  branch?: string | null
  qrData?: string | null
  visible: boolean
  order: number
}

const qrText = (account: BankAccount) =>
  account.qrData ||
  [
    `Bank: ${account.bankName}`,
    `Account Name: ${account.accountName}`,
    `Account Number: ${account.accountNumber}`,
    ...(account.branch ? [`Branch: ${account.branch}`] : []),
  ].join('\n')

function QrImage({ text }: { text: string }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let active = true
    QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: '#1c1917' } })
      .then((url) => {
        if (active) setSrc(url)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [text])

  if (!src) {
    return (
      <div className="w-[200px] h-[200px] rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    )
  }
  return (
    <img
      src={src}
      width={200}
      height={200}
      alt="Payment QR code"
      className="rounded-xl bg-white p-2"
    />
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const { t } = useI18n()

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Ignore copy failures
    }
  }

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        copied
          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
          : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? t('pay.copied') : t('pay.copy')}
    </button>
  )
}

export default function BankPayments({ accounts }: { accounts: BankAccount[] }) {
  const { t } = useI18n()

  if (accounts.length === 0) {
    return (
      <div className="text-center py-20">
        <Landmark className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600" />
        <p className="text-muted-foreground mt-4">{t('pay.noAccounts')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {accounts.map((account) => {
        const color = getBankColor(account.bankName)
        const initials = account.bankName
          .split(' ')
          .map((w) => w[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()

        return (
          <div
            key={account.id}
            className="glass rounded-2xl p-6 card-hover flex flex-col"
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0"
                style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
              >
                {initials || '🏦'}
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  {account.bankName}
                </h3>
                {account.branch ? (
                  <p className="text-xs text-muted-foreground">
                    {t('pay.branch')}: {account.branch}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-6 items-start">
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('pay.accountName')}
                  </p>
                  <p className="font-medium text-sm mt-0.5">{account.accountName}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {t('pay.accountNumber')}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <p className="font-mono font-semibold text-sm tracking-wide">
                      {account.accountNumber}
                    </p>
                    <CopyButton text={account.accountNumber} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <QrImage text={qrText(account)} />
                <CopyButton text={qrText(account)} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
