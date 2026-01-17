import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { sendRegistrationConfirmation, sendPaymentConfirmation } from '../../../lib/email'

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
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { registrationId, emailType } = await request.json()

    if (!registrationId || !emailType) {
      return NextResponse.json(
        { error: 'Chybí ID registrace nebo typ emailu' },
        { status: 400 }
      )
    }

    // Načíst registraci
    const regResult = await sql`
      SELECT * FROM registrations
      WHERE id = ${registrationId}
      LIMIT 1
    `

    if (regResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Registrace nenalezena' },
        { status: 404 }
      )
    }

    const registration = regResult.rows[0]

    // Načíst workshop pro detaily
    const workshopResult = await sql`
      SELECT * FROM workshops
      WHERE date = ${registration.workshop_date}
      AND location = ${registration.workshop_location}
      AND is_active = true
      LIMIT 1
    `

    const workshop = workshopResult.rows.length > 0 ? workshopResult.rows[0] : null

    // Formátovat data pro email funkce
    const formattedRegistration = {
      id: registration.id,
      firstName: registration.first_name,
      lastName: registration.last_name,
      email: registration.email,
      phone: registration.phone,
      workshopDate: registration.workshop_date,
      workshopLocation: registration.workshop_location,
      registrationType: registration.registration_type,
      partnerFirstName: registration.partner_first_name,
      partnerLastName: registration.partner_last_name,
      partnerEmail: registration.partner_email,
      price: registration.price,
      variable_symbol: registration.variable_symbol,
      notes: registration.notes,
    }

    // Poslat email podle typu
    let result
    if (emailType === 'confirmation') {
      result = await sendRegistrationConfirmation(formattedRegistration, workshop)
    } else if (emailType === 'payment') {
      result = await sendPaymentConfirmation(formattedRegistration)
    } else {
      return NextResponse.json(
        { error: 'Neplatný typ emailu' },
        { status: 400 }
      )
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email byl úspěšně odeslán'
      })
    } else {
      return NextResponse.json(
        { error: 'Nepodařilo se odeslat email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Resend email error:', error)
    return NextResponse.json(
      { error: 'Chyba při odesílání emailu' },
      { status: 500 }
    )
  }
}
