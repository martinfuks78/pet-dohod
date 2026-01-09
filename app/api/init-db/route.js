import { NextResponse } from 'next/server'
import { initDatabase } from '../../../lib/db'

/**
 * Endpoint pro inicializaci databáze
 * Zavolej jednou po nastavení .env.local
 *
 * GET /api/init-db
 */
export async function GET() {
  try {
    await initDatabase()
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
    })
  } catch (error) {
    console.error('Init DB error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}
