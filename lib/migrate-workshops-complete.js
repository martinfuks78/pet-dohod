import { sql } from '@vercel/postgres'

/**
 * Kompletní migrace workshops tabulky
 * Přidá všechny chybějící sloupce
 */
export async function migrateWorkshopsComplete() {
  try {
    console.log('🔄 Starting complete workshops migration...')

    // Přidat sloupec name
    console.log('  Adding column: name')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS name VARCHAR(200)
    `

    // Přidat sloupec start_date
    console.log('  Adding column: start_date')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS start_date DATE
    `

    // Přidat sloupec end_date
    console.log('  Adding column: end_date')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS end_date DATE
    `

    // Přidat sloupec program
    console.log('  Adding column: program')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS program TEXT
    `

    // Přidat sloupec address
    console.log('  Adding column: address')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS address TEXT
    `

    // Přidat sloupec what_to_bring
    console.log('  Adding column: what_to_bring')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS what_to_bring TEXT
    `

    // Přidat sloupec instructor_info
    console.log('  Adding column: instructor_info')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS instructor_info TEXT
    `

    // Přidat sloupec bank_account
    console.log('  Adding column: bank_account')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS bank_account VARCHAR(100)
    `

    // Přidat sloupec variable_symbol
    console.log('  Adding column: variable_symbol')
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS variable_symbol VARCHAR(50)
    `

    console.log('✅ Complete workshops migration finished successfully')
    return { success: true, message: 'All columns added' }
  } catch (error) {
    console.error('❌ Complete workshops migration error:', error)
    return { success: false, error: error.message }
  }
}

// Pokud je script spuštěn přímo
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateWorkshopsComplete()
    .then((result) => {
      console.log(result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
