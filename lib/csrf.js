import { NextResponse } from 'next/server'

/**
 * CSRF Protection Middleware
 *
 * Ověřuje, že požadavky pocházejí z důvěryhodného zdroje.
 * Kontroluje Origin/Referer header proti povoleným doménám.
 */

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://pet-dohod.vercel.app',
  'https://www.petdohod.cz',
  'https://petdohod.cz',
]

/**
 * Ověří, zda požadavek pochází z povolené domény
 */
export function checkCSRF(request) {
  // GET a HEAD požadavky nepotřebují CSRF ochranu
  const method = request.method
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return { valid: true }
  }

  // Kontrola Origin headeru (primární)
  const origin = request.headers.get('origin')
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return { valid: true }
  }

  // Fallback: kontrola Referer headeru
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`

      if (ALLOWED_ORIGINS.includes(refererOrigin)) {
        return { valid: true }
      }
    } catch (e) {
      // Neplatná referer URL
    }
  }

  return {
    valid: false,
    error: 'CSRF validation failed - invalid origin',
  }
}

/**
 * Middleware wrapper pro ochranu API endpointů
 */
export function withCSRF(handler) {
  return async (request, context) => {
    const csrfCheck = checkCSRF(request)

    if (!csrfCheck.valid) {
      return NextResponse.json(
        { error: csrfCheck.error },
        { status: 403 }
      )
    }

    return handler(request, context)
  }
}
