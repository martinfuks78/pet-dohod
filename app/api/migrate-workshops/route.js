import { NextResponse } from 'next/server'
import { migrateWorkshopColumns } from '../../../lib/migrate-add-workshop-columns'

/**
 * GET endpoint pro spuštění migrace workshopů
 * Přidá chybějící sloupce do tabulky workshops
 */
export async function GET() {
  try {
    const result = await migrateWorkshopColumns()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Workshop migration completed successfully',
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
