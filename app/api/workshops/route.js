import { NextResponse } from 'next/server'
import {
  getAllWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  getWorkshopRegistrationCount,
} from '../../../lib/db'

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

/**
 * GET - Získá všechny aktivní workshopy
 */
export async function GET() {
  try {
    const workshops = await getAllWorkshops()

    // Přidá počet registrací ke každému workshopu
    const workshopsWithCounts = await Promise.all(
      workshops.map(async (workshop) => {
        const registrationCount = await getWorkshopRegistrationCount(
          workshop.date,
          workshop.location
        )
        return {
          ...workshop,
          registrationCount,
        }
      })
    )

    return NextResponse.json({
      success: true,
      workshops: workshopsWithCounts,
    })
  } catch (error) {
    console.error('Error fetching workshops:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se načíst workshopy' },
      { status: 500 }
    )
  }
}

/**
 * POST - Vytvoří nový workshop
 */
export async function POST(request) {
  // Ověření autentizace
  const auth = checkAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    )
  }

  try {
    const data = await request.json()

    // Validace
    if (!data.date || !data.location || !data.priceSingle) {
      return NextResponse.json(
        { error: 'Vyplň prosím všechna povinná pole' },
        { status: 400 }
      )
    }

    const workshop = await createWorkshop(data)

    return NextResponse.json({
      success: true,
      workshop,
    })
  } catch (error) {
    console.error('Error creating workshop:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se vytvořit workshop' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Aktualizuje workshop
 */
export async function PUT(request) {
  // Ověření autentizace
  const auth = checkAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    )
  }

  try {
    const data = await request.json()

    if (!data.id) {
      return NextResponse.json(
        { error: 'Chybí ID workshopu' },
        { status: 400 }
      )
    }

    const workshop = await updateWorkshop(data.id, data)

    return NextResponse.json({
      success: true,
      workshop,
    })
  } catch (error) {
    console.error('Error updating workshop:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se aktualizovat workshop' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Smaže workshop (soft delete)
 */
export async function DELETE(request) {
  // Ověření autentizace
  const auth = checkAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Chybí ID workshopu' },
        { status: 400 }
      )
    }

    await deleteWorkshop(id)

    return NextResponse.json({
      success: true,
      message: 'Workshop byl smazán',
    })
  } catch (error) {
    console.error('Error deleting workshop:', error)
    return NextResponse.json(
      { error: 'Nepodařilo se smazat workshop' },
      { status: 500 }
    )
  }
}
