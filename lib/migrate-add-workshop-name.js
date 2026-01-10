import { sql } from '@vercel/postgres'

/**
 * Migrace: Přidá sloupec 'name' do tabulky workshops
 */
export async function migrateAddWorkshopName() {
  try {
    console.log('Starting workshop name column migration...')

    // Přidat sloupec name, pokud neexistuje
    await sql`
      ALTER TABLE workshops
      ADD COLUMN IF NOT EXISTS name VARCHAR(200)
    `

    console.log('✅ Workshop name column migration completed successfully')
    return { success: true, message: 'Migration completed' }
  } catch (error) {
    console.error('❌ Workshop name column migration error:', error)
    return { success: false, error: error.message }
  }
}

// Pokud je script spuštěn přímo
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAddWorkshopName()
    .then((result) => {
      console.log(result)
      process.exit(result.success ? 0 : 1)
    })
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}
