import { NextResponse } from 'next/server'
import { migrateRegistrationsVariableSymbol } from '../../../lib/migrate-registrations-vs'

/**
 * GET endpoint pro spuštění migrace variable_symbol sloupce
 */
export async function GET() {
  try {
    const result = await migrateRegistrationsVariableSymbol()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Registrations variable_symbol migration completed successfully',
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
