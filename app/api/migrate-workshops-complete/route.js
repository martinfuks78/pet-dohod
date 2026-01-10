import { NextResponse } from 'next/server'
import { migrateWorkshopsComplete } from '../../../lib/migrate-workshops-complete'

/**
 * GET endpoint pro spuštění kompletní migrace workshops tabulky
 */
export async function GET() {
  try {
    const result = await migrateWorkshopsComplete()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Complete workshops migration completed successfully',
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Migration endpoint error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
