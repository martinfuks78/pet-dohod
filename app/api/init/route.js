import { NextResponse } from 'next/server'
import { initDatabase } from '../../../lib/db'

/**
 * GET endpoint pro inicializaci databáze
 * Vytvoří tabulky a přidá chybějící sloupce
 */
export async function GET() {
  try {
    const result = await initDatabase()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully',
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Init endpoint error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
