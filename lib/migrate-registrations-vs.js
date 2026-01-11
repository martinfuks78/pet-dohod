import { sql } from '@vercel/postgres'

/**
 * Migrace pro přidání sloupce variable_symbol do tabulky registrations
 */
export async function migrateRegistrationsVariableSymbol() {
  try {
    console.log('🔄 Starting registrations variable_symbol migration...')

    // Přidat sloupec variable_symbol
    console.log('  Adding column: variable_symbol')
    await sql`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS variable_symbol VARCHAR(20)
    `

    console.log('✅ Registrations variable_symbol migration finished successfully')
    return { success: true, message: 'variable_symbol column added' }
  } catch (error) {
    console.error('❌ Registrations migration error:', error)
    return { success: false, error: error.message }
  }
}

// Pokud je script spuštěn přímo
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateRegistrationsVariableSymbol()
    .then((result) => {
      console.log(result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
