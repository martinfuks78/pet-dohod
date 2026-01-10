import { NextResponse } from 'next/server'
import { migrateWorkshopsTable } from '../../../lib/migrate-workshops'

/**
 * Migration endpoint - run once to update database schema
 * Access: GET /api/migrate
 */
export async function GET() {
  try {
    await migrateWorkshopsTable()

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error.message },
      { status: 500 }
    )
  }
}
