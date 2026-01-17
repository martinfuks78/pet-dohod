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

// GET - Seznam všech odběratelů (admin pouze)
export async function GET(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const result = await sql`
      SELECT id, email, subscribed_at, is_active
      FROM newsletter_subscribers
      ORDER BY subscribed_at DESC
    `

    return NextResponse.json({
      success: true,
      subscribers: result.rows
    })
  } catch (error) {
    console.error('Newsletter subscribers fetch error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst odběratele' },
      { status: 500 }
    )
  }
}

// DELETE - Smazat odběratele
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
        { error: 'Chybí ID odběratele' },
        { status: 400 }
      )
    }

    await sql`
      DELETE FROM newsletter_subscribers
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: 'Odběratel byl odstraněn'
    })
  } catch (error) {
    console.error('Newsletter subscriber delete error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se odstranit odběratele' },
      { status: 500 }
    )
  }
}
