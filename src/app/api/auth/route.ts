import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword, generateToken, setAuthCookie, getCurrentUser } from '@/lib/auth'
import { checkRateLimit, getClientIdentifier } from '@/middleware/redis-rate-limit'
import { validateCsrfToken, getCsrfToken } from '@/middleware/csrf'
import config from '@/lib/config'

export async function POST(request: Request) {
  try {
    const { email, password, action } = await request.json()

    // CSRF token endpoint
    if (action === 'get-csrf') {
      const token = getCsrfToken()
      return NextResponse.json({ csrfToken: token })
    }

    // Validate CSRF token for state-changing operations
    if (action === 'login' || action === 'register' || action === 'logout' || action === 'change-password') {
      const csrfResult = validateCsrfToken(request)
      if (!csrfResult.valid) {
        return NextResponse.json({ error: csrfResult.error }, { status: 403 })
      }
    }

    // Rate limit login and register attempts
    if (action === 'login' || action === 'register') {
      const identifier = getClientIdentifier(request)
      const rateLimit = await checkRateLimit(identifier)

      if (!rateLimit.allowed) {
        return NextResponse.json(
          { error: 'Too many attempts. Please try again later.' },
          { status: 429 }
        )
      }
    }

    if (action === 'login') {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return NextResponse.json(
          { error: 'Account locked due to too many failed attempts. Please try again later.' },
          { status: 423 }
        )
      }

      const isValid = await verifyPassword(password, user.password)

      if (!isValid) {
        // Increment login attempts
        const newAttempts = user.loginAttempts + 1
        const lockedUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: newAttempts,
            lockedUntil,
          },
        })

        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Reset login attempts on successful login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
        },
      })

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      await setAuthCookie(token)

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    }

    if (action === 'change-password') {
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }

      const { currentPassword, newPassword } = await request.json()

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required' },
          { status: 400 }
        )
      }

      // Password complexity validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      if (!passwordRegex.test(newPassword)) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)' },
          { status: 400 }
        )
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      })

      if (!dbUser) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      const isValid = await verifyPassword(currentPassword, dbUser.password)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        )
      }

      const hashedPassword = await hashPassword(newPassword)
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      })
    }

    if (action === 'register') {
      const existing = await prisma.user.findUnique({
        where: { email },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      }

      // Password complexity validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      if (!passwordRegex.test(password)) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)' },
          { status: 400 }
        )
      }

      const hashedPassword = await hashPassword(password)
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: config.admin.name,
          role: 'admin',
        },
      })

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      await setAuthCookie(token)

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      })
    }

    if (action === 'logout') {
      const { clearAuthCookie } = await import('@/lib/auth')
      await clearAuthCookie()
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
