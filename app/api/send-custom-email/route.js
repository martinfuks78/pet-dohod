import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function checkAuth(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return { authorized: false, error: 'Unauthorized - missing authorization header' }
  const [type, password] = authHeader.split(' ')
  if (type !== 'Bearer' || !password) return { authorized: false, error: 'Unauthorized - invalid authorization format' }
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  if (!ADMIN_PASSWORD) return { authorized: false, error: 'Server configuration error' }
  if (password !== ADMIN_PASSWORD) return { authorized: false, error: 'Unauthorized - invalid credentials' }
  return { authorized: true }
}

// Helper funkce pro nahrazení proměnných v šabloně
function replaceVariables(text, data) {
  let result = text
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, data[key] || '')
  })
  return result
}

// POST - Odeslat custom email jednomu účastníkovi
export async function POST(request) {
  try {
    const auth = checkAuth(request)
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { registrationId, templateKey, recipientEmails } = await request.json()

    if (!templateKey) {
      return NextResponse.json({ error: 'Chybí klíč šablony' }, { status: 400 })
    }

    // Načíst šablonu
    const templateResult = await sql`
      SELECT * FROM email_templates
      WHERE template_key = ${templateKey}
      LIMIT 1
    `

    if (templateResult.rows.length === 0) {
      return NextResponse.json({ error: 'Šablona nenalezena' }, { status: 404 })
    }

    const template = templateResult.rows[0]
    let sentCount = 0
    let errors = []

    // Pokud je registrationId, pošli email účastníkovi
    if (registrationId) {
      const regResult = await sql`SELECT * FROM registrations WHERE id = ${registrationId} LIMIT 1`

      if (regResult.rows.length === 0) {
        return NextResponse.json({ error: 'Registrace nenalezena' }, { status: 404 })
      }

      const registration = regResult.rows[0]

      // Připravit data pro nahrazení proměnných
      const variables = {
        firstName: registration.first_name,
        lastName: registration.last_name,
        email: registration.email,
        phone: registration.phone,
        workshopDate: registration.workshop_date,
        workshopLocation: registration.workshop_location,
        price: registration.price,
        variableSymbol: registration.variable_symbol,
        partnerFirstName: registration.partner_first_name,
        partnerLastName: registration.partner_last_name,
      }

      // Nahradit proměnné v předmětu a těle
      const subject = replaceVariables(template.subject, variables)
      const html = replaceVariables(template.html_body, variables)

      try {
        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: [registration.email],
          subject: subject,
          html: html,
        })

        if (error) {
          errors.push({ email: registration.email, error })
        } else {
          sentCount++
        }
      } catch (error) {
        errors.push({ email: registration.email, error: error.message })
      }
    }

    // Pokud jsou recipientEmails (bulk send), pošli všem
    if (recipientEmails && Array.isArray(recipientEmails)) {
      for (const email of recipientEmails) {
        const subject = template.subject // Pro bulk send bez personalizace
        const html = template.html_body

        try {
          const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: [email],
            subject: subject,
            html: html,
          })

          if (error) {
            errors.push({ email, error })
          } else {
            sentCount++
          }
        } catch (error) {
          errors.push({ email, error: error.message })
        }

        // Malé zpoždění mezi emaily
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    return NextResponse.json({
      success: true,
      message: `Odesláno ${sentCount} emailů`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Send custom email error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
