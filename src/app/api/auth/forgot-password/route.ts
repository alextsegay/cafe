import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'If an account exists with this email, a reset link has been sent.' 
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // In production, send email with reset link
    // For now, return the token in response (for development)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${resetToken}`

    console.log('Password reset link:', resetUrl)

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with this email, a reset link has been sent.',
      // Only include this in development
      ...(process.env.NODE_ENV === 'development' && { resetUrl, resetToken })
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
