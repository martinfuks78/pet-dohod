import { sql } from '@vercel/postgres'

/**
 * Migration script to update workshops table
 * Run this once to add new columns and remove price_couple
 */
export async function migrateWorkshopsTable() {
  try {
    console.log('🔄 Starting workshops table migration...')

    // Add start_date column for proper sorting
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS start_date DATE
    `
    console.log('✅ Added start_date column')

    // Add end_date column for date range
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS end_date DATE
    `
    console.log('✅ Added end_date column')

    // Add detail columns
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS program TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS what_to_bring TEXT,
      ADD COLUMN IF NOT EXISTS instructor_info TEXT
    `
    console.log('✅ Added detail columns')

    // Add payment details columns
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS bank_account VARCHAR(50),
      ADD COLUMN IF NOT EXISTS variable_symbol VARCHAR(50),
      ADD COLUMN IF NOT EXISTS amount INTEGER
    `
    console.log('✅ Added payment details columns')

    // Remove price_couple column (will be done manually later to avoid data loss)
    // For now, we'll just stop using it in the app
    console.log('⚠️  price_couple column left in DB (will be removed later)')

    console.log('✅ Migration completed successfully!')
    return { success: true }
  } catch (error) {
    console.error('❌ Migration error:', error)
    throw error
  }
}
