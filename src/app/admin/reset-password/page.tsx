'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import { Button, Input } from '@/components/ui'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setMessage('Invalid reset link. Please request a new password reset.')
      setMessageType('error')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(false)
    setMessage('')

    if (!token) {
      setMessage('Invalid reset link. Please request a new password reset.')
      setMessageType('error')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters')
      setMessageType('error')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      setMessageType('error')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(data.message)
        setMessageType('success')
        setIsSuccess(true)
        setTimeout(() => {
          router.push('/admin')
        }, 3000)
      } else {
        setMessage(data.error || 'Something went wrong')
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
      setMessageType('error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold font-display mb-2">Password Reset!</h1>
              <p className="text-muted-foreground">
                Your password has been successfully reset. Redirecting to login...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-2xl font-bold font-display">Reset Password</h1>
                <p className="text-muted-foreground mt-2">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />

                {message && (
                  <div className={`p-4 rounded-xl ${
                    messageType === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}>
                    {message}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
