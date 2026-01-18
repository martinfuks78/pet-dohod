import { NextResponse } from 'next/server'

/**
 * Rate Limiting Middleware
 *
 * Omezuje počet požadavků z jedné IP adresy.
 * Podporuje Vercel KV (Redis) pro persistent storage nebo in-memory fallback.
 */

// In-memory storage jako fallback (když KV není dostupné)
const inMemoryStore = new Map()

/**
 * Konfigurace rate limitů
 */
const RATE_LIMITS = {
  // Registrace na workshop - 5 za hodinu
  registration: {
    windowMs: 60 * 60 * 1000, // 1 hodina
    maxRequests: 5,
  },
  // Kontaktní formulář - 3 za hodinu
  contact: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
  },
  // Newsletter subscribe - 5 za den
  newsletter: {
    windowMs: 24 * 60 * 60 * 1000, // 1 den
    maxRequests: 5,
  },
  // API obecně - 100 za minutu
  api: {
    windowMs: 60 * 1000, // 1 minuta
    maxRequests: 100,
  },
}

/**
 * Získá IP adresu z requestu
 */
function getClientIP(request) {
  // Vercel poskytuje IP v x-forwarded-for
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  // Fallback
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

/**
 * Kontrola rate limitu pomocí in-memory storage
 */
async function checkRateLimitInMemory(key, limit) {
  const now = Date.now()
  const record = inMemoryStore.get(key) || { count: 0, resetTime: now + limit.windowMs }

  // Reset pokud uplynul time window
  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + limit.windowMs
  }

  record.count++
  inMemoryStore.set(key, record)

  const remaining = Math.max(0, limit.maxRequests - record.count)
  const isAllowed = record.count <= limit.maxRequests

  return {
    isAllowed,
    remaining,
    resetTime: record.resetTime,
    total: limit.maxRequests,
  }
}

/**
 * Kontrola rate limitu pomocí Vercel KV (Redis)
 */
async function checkRateLimitKV(key, limit) {
  // TODO: Implementovat Vercel KV integraci
  // Pro aktivaci této funkce je potřeba:
  // 1. Vytvořit KV store na Vercel
  // 2. npm install @vercel/kv
  // 3. Přidat KV_* env variables do .env.local a Vercel

  /*
  import { kv } from '@vercel/kv'

  const now = Date.now()
  const record = await kv.get(key) || { count: 0, resetTime: now + limit.windowMs }

  if (now > record.resetTime) {
    record.count = 0
    record.resetTime = now + limit.windowMs
  }

  record.count++
  await kv.set(key, record, { px: limit.windowMs })

  const remaining = Math.max(0, limit.maxRequests - record.count)
  const isAllowed = record.count <= limit.maxRequests

  return {
    isAllowed,
    remaining,
    resetTime: record.resetTime,
    total: limit.maxRequests,
  }
  */

  // Fallback na in-memory
  return checkRateLimitInMemory(key, limit)
}

/**
 * Hlavní rate limiting funkce
 */
export async function checkRateLimit(request, limitType = 'api') {
  const ip = getClientIP(request)
  const limit = RATE_LIMITS[limitType]

  if (!limit) {
    console.warn(`Unknown rate limit type: ${limitType}`)
    return { isAllowed: true, remaining: 999, total: 999 }
  }

  const key = `rate-limit:${limitType}:${ip}`

  // Použít KV pokud je dostupné, jinak in-memory
  const useKV = process.env.KV_URL ? true : false

  if (useKV) {
    return checkRateLimitKV(key, limit)
  } else {
    return checkRateLimitInMemory(key, limit)
  }
}

/**
 * Middleware wrapper pro rate limiting
 */
export function withRateLimit(handler, limitType = 'api') {
  return async (request, context) => {
    const result = await checkRateLimit(request, limitType)

    // Přidat rate limit headers do odpovědi
    const headers = {
      'X-RateLimit-Limit': result.total.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime?.toString() || '',
    }

    if (!result.isAllowed) {
      return NextResponse.json(
        {
          error: 'Příliš mnoho požadavků. Zkuste to prosím později.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers,
        }
      )
    }

    // Spustit handler a přidat headers
    const response = await handler(request, context)

    // Přidat rate limit headers k odpovědi
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}

/**
 * Vyčistí staré záznamy z in-memory storage (garbage collection)
 */
export function cleanupInMemoryStore() {
  const now = Date.now()
  for (const [key, record] of inMemoryStore.entries()) {
    if (now > record.resetTime + 60000) { // 1 minuta po resetu
      inMemoryStore.delete(key)
    }
  }
}

// Spustit cleanup každých 5 minut
if (typeof global !== 'undefined') {
  setInterval(cleanupInMemoryStore, 5 * 60 * 1000)
}
