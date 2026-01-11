import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { createRegistration, getAllRegistrations, updateRegistrationStatus, deleteRegistration } from '../../../lib/db'
import { sendRegistrationConfirmation, sendAdminNotification, sendPaymentConfirmation, sendWaitlistConfirmation } from '../../../lib/email'

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

    // DEBUG - log received data
    console.log('📝 Registration data received:', {
      workshopId: data.workshopId,
      workshopDate: data.workshopDate,
      workshopLocation: data.workshopLocation,
      email: data.email
    })

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

    // Kontrola duplikátní registrace
    const existingReg = await sql`
      SELECT id FROM registrations
      WHERE email = ${data.email}
      AND workshop_date = ${data.workshopDate}
      AND workshop_location = ${data.workshopLocation}
      AND status != 'cancelled'
      LIMIT 1
    `

    if (existingReg.rows.length > 0) {
      return NextResponse.json(
        { error: 'Už jsi zaregistrován/a na tento workshop. Zkontroluj svůj email.' },
        { status: 400 }
      )
    }

    // Načíst workshop z databáze pro platební údaje
    const workshopResult = await sql`
      SELECT * FROM workshops
      WHERE id = ${data.workshopId}
      AND is_active = true
      LIMIT 1
    `

    const workshop = workshopResult.rows.length > 0 ? workshopResult.rows[0] : null

    if (!workshop) {
      return NextResponse.json(
        { error: 'Workshop nebyl nalezen nebo již není aktivní' },
        { status: 404 }
      )
    }

    // Zkontroluj kapacitu a určit status
    let initialStatus = 'pending'
    let isWaitlist = false

    if (workshop.capacity) {
      // Spočítej aktuální počet potvrzených a čekajících registrací
      const countResult = await sql`
        SELECT COUNT(*) as count FROM registrations
        WHERE workshop_date = ${data.workshopDate}
        AND workshop_location = ${data.workshopLocation}
        AND status IN ('pending', 'confirmed')
      `
      const currentCount = parseInt(countResult.rows[0].count)

      // Pokud je plný, zařaď na waitlist
      if (currentCount >= workshop.capacity) {
        initialStatus = 'waitlist'
        isWaitlist = true
      }
    }

    // Uložení do databáze
    console.log('📦 About to create registration with data:', {
      firstName: data.firstName,
      email: data.email,
      price: data.price,
      priceType: typeof data.price,
      workshopVS: workshop.variable_symbol,
      initialStatus: initialStatus,
      isWaitlist: isWaitlist
    })
    const registration = await createRegistration(data, workshop.variable_symbol, initialStatus)
    console.log('✅ Registration created:', registration.id, 'VS:', registration.variable_symbol, 'Status:', initialStatus)

    // Odeslání emailů (pokud je RESEND_API_KEY nastavený)
    if (process.env.RESEND_API_KEY) {
      // Email sending v samostatném try-catch aby neovlivnilo registraci
      setImmediate(async () => {
        try {
          // Potvrzení účastníkovi - odlišný email pro waitlist vs. normal
          const registrationData = {
            ...registration,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            workshopDate: data.workshopDate,
            workshopLocation: data.workshopLocation,
            registrationType: data.registrationType,
            partnerFirstName: data.partnerFirstName,
            partnerLastName: data.partnerLastName,
            price: data.price,
          }

          const confirmResult = isWaitlist
            ? await sendWaitlistConfirmation(registrationData, workshop)
            : await sendRegistrationConfirmation(registrationData, workshop)

          if (confirmResult.success) {
            console.log('✅ Confirmation email sent to:', data.email)
          } else {
            console.error('❌ Confirmation email failed:', confirmResult.error)
          }

          // Notifikace adminovi
          const adminResult = await sendAdminNotification({
            ...data,
            id: registration.id,
            variable_symbol: registration.variable_symbol,
            createdAt: new Date().toISOString(),
          })

          if (adminResult.success) {
            console.log('✅ Admin notification sent')
          } else {
            console.error('❌ Admin notification failed:', adminResult.error)
          }
        } catch (emailError) {
          // Email error neblokuje registraci - pouze logujeme
          console.error('❌ Email send exception:', emailError)
        }
      })
    } else {
      console.log('⚠️  RESEND_API_KEY not set, skipping email send')
    }

    // Pro waitlist neposíláme platební údaje
    let paymentDetails = null

    if (!isWaitlist) {
      // Vygenerovat QR kód pro response
      const { generatePaymentQRCode } = await import('../../../lib/qr-code')
      const qrCodeUrl = generatePaymentQRCode({
        bankAccount: workshop.bank_account,
        amount: data.price,
        variableSymbol: registration.variable_symbol,
        message: `${data.firstName} ${data.lastName} - ${data.workshopDate}`,
        size: '300x300'
      })

      paymentDetails = {
        bankAccount: workshop.bank_account,
        variableSymbol: registration.variable_symbol,
        amount: data.price,
        qrCodeUrl: qrCodeUrl
      }
    }

    return NextResponse.json({
      success: true,
      message: isWaitlist ? 'Zaregistrován jako náhradník' : 'Registrace byla úspěšně odeslána',
      registrationId: registration.id,
      isWaitlist: isWaitlist,
      paymentDetails: paymentDetails
    })
  } catch (error) {
    console.error('❌ Registration error:', error)
    console.error('❌ Error name:', error.name)
    console.error('❌ Error message:', error.message)
    console.error('❌ Error stack:', error.stack)
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

    // Pokud je status "confirmed", pošli potvrzovací email
    if (status === 'confirmed' && process.env.RESEND_API_KEY) {
      try {
        // Načíst plnou registraci pro email
        const fullReg = await sql`
          SELECT * FROM registrations WHERE id = ${id}
        `

        if (fullReg.rows.length > 0) {
          await sendPaymentConfirmation(fullReg.rows[0])
          console.log('Payment confirmation email sent for registration:', id)
        }
      } catch (emailError) {
        // Email error neblokuje update statusu - pouze logujeme
        console.error('Failed to send payment confirmation email:', emailError)
      }
    }

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
