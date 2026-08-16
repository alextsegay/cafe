// Simple CSRF protection using double-submit cookie pattern

import { cookies } from 'next/headers'

const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'

function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function getCsrfToken(): string {
  const cookieStore = cookies()
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value

  if (!token) {
    token = generateToken()
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  }

  return token
}

export function validateCsrfToken(request: Request): { valid: boolean; error?: string } {
  const cookieToken = request.headers.get('cookie')?.split(';')
    ?.find(c => c.trim().startsWith(`${CSRF_COOKIE_NAME}=`))
    ?.split('=')[1]?.trim()

  const headerToken = request.headers.get(CSRF_HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return { valid: false, error: 'CSRF token missing' }
  }

  if (cookieToken !== headerToken) {
    return { valid: false, error: 'CSRF token mismatch' }
  }

  return { valid: true }
}
