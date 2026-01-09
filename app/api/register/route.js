import { NextResponse } from 'next/server'
import { createRegistration, getAllRegistrations } from '../../../lib/db'

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

    // TODO: Odeslání emailu s potvrzením (další krok)

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
export async function GET() {
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
