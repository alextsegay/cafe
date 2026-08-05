// Simple in-memory rate limiter for auth endpoints
// For production with multiple servers, use Redis-based rate limiting

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

const RATE_LIMIT_WINDOW = 10 * 1000 // 10 seconds
const RATE_LIMIT_MAX = 5 // max 5 attempts per window

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    // New window or expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count }
}

export function getClientIdentifier(request: Request): string {
  // Use IP address from headers (works with most proxies)
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  return ip
}
