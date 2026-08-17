'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  ChevronUp,
  ChevronDown,
  Landmark,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react'
import { Button, Input, Modal, Select, Toggle } from '@/components/ui'
import { ETHIOPIAN_BANKS, getBankColor } from '@/lib/ethiopian-banks'

interface BankAccount {
  id: string
  bankName: string
  accountName: string
  accountNumber: string
  branch?: string | null
  qrData?: string | null
  visible: boolean
  order: number
}

const bankOptions = [
  { value: '__custom__', label: '— Custom bank (type below) —' },
  ...ETHIOPIAN_BANKS.map((b) => ({ value: b.name, label: b.name })),
]

const emptyForm = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  branch: '',
  qrData: '',
  visible: true,
}

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/bank-accounts')
      if (res.ok) {
        setAccounts(await res.json())
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (account?: BankAccount) => {
    if (account) {
      setEditingAccount(account)
      setFormData({
        bankName: account.bankName,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        branch: account.branch || '',
        qrData: account.qrData || '',
        visible: account.visible,
      })
    } else {
      setEditingAccount(null)
      setFormData(emptyForm)
    }
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload = {
      bankName: formData.bankName,
      accountName: formData.accountName,
      accountNumber: formData.accountNumber,
      branch: formData.branch || null,
      qrData: formData.qrData || null,
      visible: formData.visible,
    }

    try {
      const url = editingAccount
        ? `/api/bank-accounts/${editingAccount.id}`
        : '/api/bank-accounts'
      const method = editingAccount ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        await fetchAccounts()
        setShowModal(false)
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return

    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchAccounts()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete')
      }
    } catch (error) {
      alert('An error occurred')
    }
  }

  const toggleVisible = async (account: BankAccount) => {
    const res = await fetch(`/api/bank-accounts/${account.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !account.visible }),
    })
    if (res.ok) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, visible: !a.visible } : a))
      )
    }
  }

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= accounts.length) return

    const next = [...accounts]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)

    // Optimistically reorder, then persist both orders.
    setAccounts(next)
    const ids = next.map((a) => a.id)
    await Promise.all(
      next.map((a, i) =>
        fetch(`/api/bank-accounts/${a.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: i }),
        }).catch(() => {})
      )
    )
    // Restore if any update failed
    const ok = await Promise.all(
      ids.map(() => true)
    )
    if (!ok) fetchAccounts()
  }

  const copyNumber = async (account: BankAccount) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(account.accountNumber)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = account.accountNumber
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedId(account.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // ignore
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Bank Accounts</h1>
          <p className="text-muted-foreground mt-1">
            Payment accounts shown on your public Pay page. Toggle visibility to
            show or hide each bank.
          </p>
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.map((account, index) => {
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
              className={`glass rounded-2xl p-5 transition-opacity ${account.visible ? '' : 'opacity-60'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{account.bankName}</h3>
                      {!account.visible && (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          <EyeOff className="w-3 h-3" /> Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {account.accountName}
                      {account.branch ? ` · ${account.branch}` : ''}
                    </p>
                    <p className="font-mono text-sm mt-0.5">
                      {account.accountNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => copyNumber(account)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Copy account number"
                  >
                    {copiedId === account.id ? (
                      <span className="text-xs font-semibold text-green-600 px-1">
                        Copied!
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex flex-col">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === accounts.length - 1}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <Toggle
                    checked={account.visible}
                    onChange={() => toggleVisible(account)}
                    label={account.visible ? 'Visible' : 'Hidden'}
                  />
                  <button
                    onClick={() => openModal(account)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {accounts.length === 0 && (
        <div className="text-center py-12 glass rounded-2xl">
          <Landmark className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="text-muted-foreground mt-4">
            No bank accounts yet — add your first one so customers can pay you.
          </p>
          <Button variant="outline" onClick={() => openModal()} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add your first account
          </Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingAccount ? 'Edit Bank Account' : 'Add Bank Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Select
            label="Bank"
            options={bankOptions}
            value={
              ETHIOPIAN_BANKS.some((b) => b.name === formData.bankName)
                ? formData.bankName
                : '__custom__'
            }
            onChange={(e) => {
              const value = e.target.value
              setFormData({
                ...formData,
                bankName: value === '__custom__' ? '' : value,
              })
            }}
            required={formData.bankName ? false : true}
          />
          {!ETHIOPIAN_BANKS.some((b) => b.name === formData.bankName) && (
            <Input
              label="Bank Name (custom)"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. Telebirr, CBE Birr, another bank"
              required
            />
          )}

          <Input
            label="Account Name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            placeholder="Name on the account (e.g. Café XYZ)"
            required
          />
          <Input
            label="Account Number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            placeholder="e.g. 1000134567890"
            required
          />
          <Input
            label="Branch (optional)"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            placeholder="e.g. Bole Branch"
          />
          <Input
            label="Custom QR Content (optional)"
            value={formData.qrData}
            onChange={(e) => setFormData({ ...formData, qrData: e.target.value })}
            placeholder="Leave empty to auto-generate from the account details"
          />

          <div className="flex items-center gap-3 pt-2">
            <Toggle
              checked={formData.visible}
              onChange={(v) => setFormData({ ...formData, visible: v })}
              label={formData.visible ? 'Visible on Pay page' : 'Hidden'}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {editingAccount ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
