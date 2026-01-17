import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

// Helper funkce pro ověření autentizace
function checkAuth(request) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return { authorized: false, error: 'Unauthorized - missing authorization header' }
  }

  const [type, password] = authHeader.split(' ')

  if (type !== 'Bearer' || !password) {
    return { authorized: false, error: 'Unauthorized - invalid authorization format' }
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

  if (!ADMIN_PASSWORD) {
    return { authorized: false, error: 'Server configuration error' }
  }

  if (password !== ADMIN_PASSWORD) {
    return { authorized: false, error: 'Unauthorized - invalid credentials' }
  }

  return { authorized: true }
}

// GET - Načíst všechny šablony
export async function GET(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const result = await sql`
      SELECT * FROM workshop_templates
      ORDER BY name
    `

    return NextResponse.json({
      success: true,
      templates: result.rows
    })
  } catch (error) {
    console.error('Workshop templates fetch error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst šablony workshopů' },
      { status: 500 }
    )
  }
}

// POST - Vytvořit novou šablonu
export async function POST(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const data = await request.json()

    const result = await sql`
      INSERT INTO workshop_templates (
        name, location, capacity, price_single, price_couple, type,
        program, address, what_to_bring, instructor_info,
        bank_account, variable_symbol
      )
      VALUES (
        ${data.name},
        ${data.location || ''},
        ${data.capacity || 20},
        ${data.price_single || 0},
        ${data.price_couple || 0},
        ${data.type || 'public'},
        ${data.program || ''},
        ${data.address || ''},
        ${data.what_to_bring || ''},
        ${data.instructor_info || ''},
        ${data.bank_account || ''},
        ${data.variable_symbol || ''}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      template: result.rows[0]
    })
  } catch (error) {
    console.error('Workshop template create error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit šablonu' },
      { status: 500 }
    )
  }
}

// PUT - Upravit šablonu
export async function PUT(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { error: 'Chybí ID šablony' },
        { status: 400 }
      )
    }

    await sql`
      UPDATE workshop_templates
      SET
        name = ${data.name},
        location = ${data.location || ''},
        capacity = ${data.capacity || 20},
        price_single = ${data.price_single || 0},
        price_couple = ${data.price_couple || 0},
        type = ${data.type || 'public'},
        program = ${data.program || ''},
        address = ${data.address || ''},
        what_to_bring = ${data.what_to_bring || ''},
        instructor_info = ${data.instructor_info || ''},
        bank_account = ${data.bank_account || ''},
        variable_symbol = ${data.variable_symbol || ''},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${data.id}
    `

    return NextResponse.json({
      success: true,
      message: 'Šablona byla úspěšně upravena'
    })
  } catch (error) {
    console.error('Workshop template update error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se upravit šablonu' },
      { status: 500 }
    )
  }
}

// DELETE - Smazat šablonu
export async function DELETE(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Chybí ID šablony' },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM workshop_templates
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: 'Šablona byla odstraněna'
    })
  } catch (error) {
    console.error('Workshop template delete error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se odstranit šablonu' },
      { status: 500 }
    )
  }
}
