import { NextResponse } from 'next/server'
import { migrateAddWorkshopName } from '../../../lib/migrate-add-workshop-name'

/**
 * GET endpoint pro spuštění migrace - přidání sloupce 'name'
 */
export async function GET() {
  try {
    const result = await migrateAddWorkshopName()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Workshop name migration completed successfully',
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
