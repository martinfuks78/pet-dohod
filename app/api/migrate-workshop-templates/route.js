import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Vytvořit tabulku pro šablony workshopů
    await sql`
      CREATE TABLE IF NOT EXISTS workshop_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        location VARCHAR(255),
        capacity INTEGER,
        price_single DECIMAL(10,2),
        price_couple DECIMAL(10,2),
        type VARCHAR(50) DEFAULT 'public',
        program TEXT,
        address TEXT,
        what_to_bring TEXT,
        instructor_info TEXT,
        bank_account VARCHAR(50),
        variable_symbol VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Vložit výchozí šablonu pokud neexistují žádné
    const existingTemplates = await sql`SELECT COUNT(*) as count FROM workshop_templates`

    if (existingTemplates.rows[0].count === '0') {
      await sql`
        INSERT INTO workshop_templates (
          name, location, capacity, price_single, price_couple, type,
          program, address, what_to_bring, instructor_info,
          bank_account, variable_symbol
        )
        VALUES (
          'Pět dohod - Standardní workshop',
          'Praha',
          20,
          3500.00,
          6000.00,
          'public',
          'Sobota 9:00 - 17:00: Úvod, první tři dohody
Neděle 9:00 - 16:00: Čtvrtá a pátá dohoda, závěr',
          'Bude upřesněno týden před workshopem',
          'Poznámkový blok, pero, pohodlné oblečení',
          'Martin Fuks - lektor workshopu Pět dohod, kouč a facilitátor. Více na www.martinfuks.cz',
          '',
          ''
        )
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Workshop templates table migrated successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
