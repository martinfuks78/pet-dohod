import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

/**
 * GET - Vyhledá registraci podle emailu a variabilního symbolu
 * Query params: email, vs (variable symbol)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const vs = searchParams.get('vs')

    // Validace
    if (!email || !vs) {
      return NextResponse.json(
        { error: 'Chybí email nebo variabilní symbol' },
        { status: 400 }
      )
    }

    // Hledáme podle emailu a VS (může být buď variable_symbol nebo id)
    const result = await sql`
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        zip,
        workshop_date,
        workshop_location,
        registration_type,
        partner_first_name,
        partner_last_name,
        partner_email,
        price,
        variable_symbol,
        status,
        notes,
        created_at
      FROM registrations
      WHERE email = ${email}
      AND (variable_symbol = ${vs} OR id::text = ${vs})
      LIMIT 1
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Registrace nebyla nalezena. Zkontrolujte prosím email a variabilní symbol.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      registration: result.rows[0]
    })
  } catch (error) {
    console.error('Registration lookup error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se najít registraci' },
      { status: 500 }
    )
  }
}
