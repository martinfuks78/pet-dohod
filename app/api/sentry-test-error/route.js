import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // Vyvolat testovací server-side chybu
    throw new Error('🧪 Sentry Server Test Error - Testovací chyba ze serveru!')
  } catch (error) {
    // Zachytit a odeslat do Sentry
    Sentry.captureException(error)

    return NextResponse.json({
      success: true,
      message: '✅ Server-side error byl zachycen a odeslán do Sentry!'
    })
  }
}
