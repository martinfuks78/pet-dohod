import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Přidat sloupce notes a tags do registrations tabulky
    await sql`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS tags TEXT
    `

    return NextResponse.json({
      success: true,
      message: 'Notes and tags columns added to registrations table'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
