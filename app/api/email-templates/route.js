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
      SELECT * FROM email_templates
      ORDER BY template_key
    `

    return NextResponse.json({
      success: true,
      templates: result.rows
    })
  } catch (error) {
    console.error('Email templates fetch error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst email šablony' },
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

    const { template_key, name, subject, html_body, variables } = await request.json()

    if (!template_key || !name || !subject || !html_body) {
      return NextResponse.json(
        { error: 'Chybí povinná pole (template_key, name, subject, html_body)' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO email_templates (template_key, name, subject, html_body, variables)
      VALUES (${template_key}, ${name}, ${subject}, ${html_body}, ${variables || null})
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      template: result.rows[0],
      message: 'Email šablona byla vytvořena'
    })
  } catch (error) {
    console.error('Email template create error:', error)

    // Check for duplicate key error
    if (error.message && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Šablona s tímto klíčem již existuje' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit email šablonu' },
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

    const { id, subject, html_body } = await request.json()

    if (!id || !subject || !html_body) {
      return NextResponse.json(
        { error: 'Chybí povinná pole (id, subject, html_body)' },
        { status: 400 }
      )
    }

    await sql`
      UPDATE email_templates
      SET
        subject = ${subject},
        html_body = ${html_body},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: 'Email šablona byla úspěšně upravena'
    })
  } catch (error) {
    console.error('Email template update error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se upravit email šablonu' },
      { status: 500 }
    )
  }
}
