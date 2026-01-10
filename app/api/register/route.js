import { NextResponse } from 'next/server'
import { createRegistration, getAllRegistrations, updateRegistrationStatus, deleteRegistration } from '../../../lib/db'
import { sendRegistrationConfirmation, sendAdminNotification } from '../../../lib/email'

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

export async function POST(request) {
  try {
    const data = await request.json()

    // Validace
    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return NextResponse.json(
        { error: 'Vyplň prosím všechna povinná pole' },
        { status: 400 }
      )
    }

    // Validace emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Zadej platný email' },
        { status: 400 }
      )
    }

    // Uložení do databáze
    const registration = await createRegistration(data)

    console.log('Nova registrace:', registration)

    // Odeslání emailů (pokud je RESEND_API_KEY nastavený)
    if (process.env.RESEND_API_KEY) {
      try {
        // Potvrzení účastníkovi
        await sendRegistrationConfirmation({
          ...data,
          id: registration.id,
          createdAt: new Date().toISOString(),
        })

        // Notifikace adminovi
        await sendAdminNotification({
          ...data,
          id: registration.id,
          createdAt: new Date().toISOString(),
        })

        console.log('Emails sent successfully')
      } catch (emailError) {
        // Email error neblokuje registraci - pouze logujeme
        console.error('Email send failed:', emailError)
      }
    } else {
      console.log('RESEND_API_KEY not set, skipping email send')
    }

    return NextResponse.json({
      success: true,
      message: 'Registrace byla úspěšně odeslána',
      registrationId: registration.id,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Něco se pokazilo. Zkus to prosím znovu.' },
      { status: 500 }
    )
  }
}

// GET endpoint pro získání všech registrací (pro admin)
export async function GET(request) {
  // Ověření autentizace
  const auth = checkAuth(request)
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    )
  }

  try {
    const registrations = await getAllRegistrations()
    return NextResponse.json({ registrations })
  } catch (error) {
    console.error('Get registrations error:', error)
    return NextResponse.json(
      { error: 'Chyba při načítání registrací' },
      { status: 500 }
    )
  }
}

// PUT endpoint pro aktualizaci statusu registrace (pro admin)
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
    const { id, status } = data

    // Validace
    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID a status jsou povinné' },
        { status: 400 }
      )
    }

    // Validace statusu
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Neplatný status' },
        { status: 400 }
      )
    }

    await updateRegistrationStatus(id, status)

    return NextResponse.json({
      success: true,
      message: 'Status byl úspěšně aktualizován'
    })
  } catch (error) {
    console.error('Update registration error:', error)
    return NextResponse.json(
      { error: 'Chyba při aktualizaci registrace' },
      { status: 500 }
    )
  }
}

// DELETE endpoint pro smazání registrace (pro admin)
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
    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    // Validace
    if (!id) {
      return NextResponse.json(
        { error: 'ID je povinné' },
        { status: 400 }
      )
    }

    await deleteRegistration(id)

    return NextResponse.json({
      success: true,
      message: 'Registrace byla úspěšně smazána'
    })
  } catch (error) {
    console.error('Delete registration error:', error)
    return NextResponse.json(
      { error: 'Chyba při mazání registrace' },
      { status: 500 }
    )
  }
}
