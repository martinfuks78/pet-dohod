import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Helper funkce pro ověření autentizace (nebo cron secret)
function checkAuth(request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  // Pokud je cron secret, ověř ho
  if (cronSecret) {
    if (cronSecret === process.env.CRON_SECRET) {
      return { authorized: true }
    }
    return { authorized: false, error: 'Invalid cron secret' }
  }

  // Jinak ověř admin heslo
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

async function sendReminderEmail(registration, workshop) {
  const subject = `Za týden se vidíme! - Workshop ${registration.workshop_date}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f49d15 0%, #aa8d66 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f49d15; }
          strong { color: #f49d15; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Za týden se vidíme! 🎉</h1>
          </div>

          <div class="content">
            <p>Ahoj <strong>${registration.first_name}</strong>,</p>

            <p>Za týden se setkáme na workshopu <strong>Pět dohod</strong>. Posíláme ti všechny důležité informace!</p>

            <div class="info-box">
              <h3>📅 Kdy a kde</h3>
              <p><strong>Termín:</strong> ${registration.workshop_date}</p>
              <p><strong>Místo:</strong> ${registration.workshop_location}</p>
              ${workshop?.address ? `<p><strong>Adresa:</strong> ${workshop.address}</p>` : ''}
            </div>

            ${workshop?.program ? `
            <div class="info-box">
              <h3>📋 Program</h3>
              <p style="white-space: pre-line;">${workshop.program}</p>
            </div>
            ` : ''}

            ${workshop?.what_to_bring ? `
            <div class="info-box">
              <h3>🎒 Co si vzít s sebou</h3>
              <p style="white-space: pre-line;">${workshop.what_to_bring}</p>
            </div>
            ` : ''}

            <div class="info-box">
              <h3>ℹ️ Důležité informace</h3>
              <ul>
                <li>Prosíme o příchod 15 minut před začátkem</li>
                <li>V případě dotazů nás neváhej kontaktovat</li>
                <li>Těšíme se na společné setkání!</li>
              </ul>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              S úctou,<br>
              <strong>Martin Fuks</strong><br>
              Lektor workshopu Pět dohod<br>
              📧 kouc@martinfuks.cz<br>
              📱 +420 603 551 119
            </p>
          </div>
        </div>
      </body>
    </html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [registration.email],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Reminder email error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Reminder email exception:', error)
    return { success: false, error: error.message }
  }
}

// GET endpoint pro odeslání připomínek
export async function GET(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Najdi workshopy, které začínají za 7 dní
    const now = new Date()
    const in7Days = new Date()
    in7Days.setDate(in7Days.getDate() + 7)

    // Formátuj datum na YYYY-MM-DD pro porovnání
    const targetDate = in7Days.toISOString().split('T')[0]

    console.log('🔍 Hledám workshopy pro datum:', targetDate)

    // Načti workshopy začínající za 7 dní
    const workshopsResult = await sql`
      SELECT * FROM workshops
      WHERE start_date::date = ${targetDate}::date
      AND is_active = true
    `

    const workshops = workshopsResult.rows
    console.log(`📅 Nalezeno ${workshops.length} workshopů pro ${targetDate}`)

    if (workshops.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Žádné workshopy za 7 dní',
        sent: 0
      })
    }

    let sentCount = 0
    let errors = []

    // Pro každý workshop najdi potvrzené registrace
    for (const workshop of workshops) {
      const registrationsResult = await sql`
        SELECT * FROM registrations
        WHERE workshop_date = ${workshop.date}
        AND workshop_location = ${workshop.location}
        AND status = 'confirmed'
      `

      const registrations = registrationsResult.rows
      console.log(`👥 Workshop ${workshop.date} - ${registrations.length} potvrzených registrací`)

      // Pošli připomínku každému účastníkovi
      for (const registration of registrations) {
        const result = await sendReminderEmail(registration, workshop)

        if (result.success) {
          sentCount++
          console.log(`✅ Připomínka odeslána: ${registration.email}`)
        } else {
          errors.push({
            email: registration.email,
            error: result.error
          })
          console.error(`❌ Chyba při odesílání: ${registration.email}`, result.error)
        }

        // Přidej malé zpoždění mezi emaily
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Připomínky odeslány`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Send reminders error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
