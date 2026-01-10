import { NextResponse } from 'next/server'
import { sendContactEmail } from '../../../lib/email'

export async function POST(request) {
  try {
    const data = await request.json()

    // Validace
    if (!data.name || !data.email || !data.message) {
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

    // Odeslání emailu (pokud je RESEND_API_KEY nastavený)
    if (process.env.RESEND_API_KEY) {
      try {
        await sendContactEmail(data)
        console.log('Contact email sent successfully')
      } catch (emailError) {
        console.error('Contact email send failed:', emailError)
        return NextResponse.json(
          { error: 'Nepodařilo se odeslat zprávu. Zkus to prosím znovu nebo napiš přímo na kouc@martinfuks.cz' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Zpráva byla úspěšně odeslána',
    })
  } catch (error) {
    console.error('Contact error:', error)
    return NextResponse.json(
      { error: 'Něco se pokazilo. Zkus to prosím znovu.' },
      { status: 500 }
    )
  }
}
