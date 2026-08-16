import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '10 s'),
  prefix: 'ratelimit',
})

export async function checkRateLimit(identifier: string) {
  const { success, remaining, reset } = await ratelimit.limit(identifier)
  return { allowed: success, remaining, reset }
}

export function getClientIdentifier(request: Request): string {
  // Prefer the platform-provided real IP. On Vercel, x-real-ip is set by the
  // platform and cannot be spoofed by the client.
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()

  // Fall back to the rightmost x-forwarded-for entry (closest to the server).
  // The leftmost entries can be attacker-supplied, so never trust them.
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length > 0) return parts[parts.length - 1]
  }

  return 'unknown'
}
