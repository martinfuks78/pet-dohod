import { sql } from '@vercel/postgres'

/**
 * Migrace: Přidá chybějící sloupce do tabulky workshops
 * Spusť tento script pro aktualizaci existující databáze
 */
export async function migrateWorkshopColumns() {
  try {
    console.log('Starting workshop columns migration...')

    // Přidat sloupce, pokud neexistují
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS end_date DATE,
      ADD COLUMN IF NOT EXISTS program TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS what_to_bring TEXT,
      ADD COLUMN IF NOT EXISTS instructor_info TEXT,
      ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100),
      ADD COLUMN IF NOT EXISTS variable_symbol VARCHAR(50),
      ADD COLUMN IF NOT EXISTS amount INTEGER
    `

    console.log('✅ Workshop columns migration completed successfully')
    return { success: true, message: 'Migration completed' }
  } catch (error) {
    console.error('❌ Workshop columns migration error:', error)
    return { success: false, error: error.message }
  }
}

// Pokud je script spuštěn přímo
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateWorkshopColumns()
    .then((result) => {
      console.log(result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
