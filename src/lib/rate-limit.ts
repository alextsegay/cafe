import { NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export async function withRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 10000 // 10 seconds default
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Clean up expired entries
  if (entry && entry.resetTime < now) {
    rateLimitMap.delete(identifier)
  }

  const currentEntry = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs }

  if (currentEntry.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  currentEntry.count += 1
  rateLimitMap.set(identifier, currentEntry)

  return { success: true, remaining: maxRequests - currentEntry.count }
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0] || realIp || 'unknown'
  return ip
}

export async function rateLimitResponse(
  request: Request,
  maxRequests: number = 5,
  windowMs: number = 10000
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request)
  const { success, remaining } = await withRateLimit(identifier, maxRequests, windowMs)

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
  }

  return null
}
