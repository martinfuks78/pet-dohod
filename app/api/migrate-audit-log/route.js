import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Vytvořit tabulku pro audit log
    await sql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INTEGER,
        entity_name TEXT,
        old_values JSONB,
        new_values JSONB,
        user_type VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Vytvořit index pro rychlejší vyhledávání
    await sql`
      CREATE INDEX IF NOT EXISTS idx_audit_log_entity
      ON audit_log(entity_type, entity_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
      ON audit_log(created_at DESC)
    `

    return NextResponse.json({
      success: true,
      message: 'Audit log table created successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
