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

// GET - Načíst audit log
export async function GET(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')

    let query
    if (entityType && entityId) {
      query = sql`
        SELECT * FROM audit_log
        WHERE entity_type = ${entityType}
        AND entity_id = ${entityId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else if (entityType) {
      query = sql`
        SELECT * FROM audit_log
        WHERE entity_type = ${entityType}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    } else {
      query = sql`
        SELECT * FROM audit_log
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    }

    const result = await query

    return NextResponse.json({
      success: true,
      logs: result.rows
    })
  } catch (error) {
    console.error('Audit log fetch error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst audit log' },
      { status: 500 }
    )
  }
}

// POST - Přidat záznam do audit logu
export async function POST(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { action, entityType, entityId, entityName, oldValues, newValues } = await request.json()

    if (!action || !entityType) {
      return NextResponse.json(
        { error: 'Action a entityType jsou povinné' },
        { status: 400 }
      )
    }

    await sql`
      INSERT INTO audit_log (
        action, entity_type, entity_id, entity_name, old_values, new_values
      )
      VALUES (
        ${action},
        ${entityType},
        ${entityId || null},
        ${entityName || null},
        ${oldValues ? JSON.stringify(oldValues) : null},
        ${newValues ? JSON.stringify(newValues) : null}
      )
    `

    return NextResponse.json({
      success: true,
      message: 'Audit log záznam vytvořen'
    })
  } catch (error) {
    console.error('Audit log create error:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit audit log záznam' },
      { status: 500 }
    )
  }
}
