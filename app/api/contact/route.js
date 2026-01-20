import { NextResponse } from 'next/server'
import { sendContactEmail } from '../../../lib/email'

export async function POST(request) {
  try {
    // Detekovat, zda je to JSON (s JS) nebo form data (bez JS)
    const contentType = request.headers.get('content-type')
    let data

    if (contentType?.includes('application/json')) {
      // S JavaScriptem - JSON data
      data = await request.json()
    } else {
      // Bez JavaScriptu - form data
      const formData = await request.formData()
      data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        message: formData.get('message'),
      }
    }

    // Validace
    if (!data.name || !data.email || !data.message) {
      // Bez JS: redirect s error parametrem (303 See Other)
      if (!contentType?.includes('application/json')) {
        const redirectUrl = new URL('/', request.url)
        redirectUrl.hash = 'kontakt'
        redirectUrl.searchParams.set('contact', 'error')
        return Response.redirect(redirectUrl.toString(), 303)
      }
      return NextResponse.json(
        { error: 'Vyplň prosím všechna povinná pole' },
        { status: 400 }
      )
    }

    // Validace emailu
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      // Bez JS: redirect s error parametrem (303 See Other)
      if (!contentType?.includes('application/json')) {
        const redirectUrl = new URL('/', request.url)
        redirectUrl.hash = 'kontakt'
        redirectUrl.searchParams.set('contact', 'error')
        return Response.redirect(redirectUrl.toString(), 303)
      }
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
        // Bez JS: redirect s error parametrem (303 See Other)
        if (!contentType?.includes('application/json')) {
          const redirectUrl = new URL('/', request.url)
          redirectUrl.hash = 'kontakt'
          redirectUrl.searchParams.set('contact', 'error')
          return Response.redirect(redirectUrl.toString(), 303)
        }
        return NextResponse.json(
          { error: 'Nepodařilo se odeslat zprávu. Zkus to prosím znovu nebo napiš přímo na kouc@martinfuks.cz' },
          { status: 500 }
        )
      }
    }

    // Úspěch!
    // Bez JS: redirect s success parametrem (303 See Other)
    if (!contentType?.includes('application/json')) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.hash = 'kontakt'
      redirectUrl.searchParams.set('contact', 'success')
      return Response.redirect(redirectUrl.toString(), 303)
    }

    return NextResponse.json({
      success: true,
      message: 'Zpráva byla úspěšně odeslána',
    })
  } catch (error) {
    console.error('Contact error:', error)
    // Bez JS: redirect s error parametrem (303 See Other)
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const redirectUrl = new URL('/', request.url)
      redirectUrl.hash = 'kontakt'
      redirectUrl.searchParams.set('contact', 'error')
      return Response.redirect(redirectUrl.toString(), 303)
    }
    return NextResponse.json(
      { error: 'Něco se pokazilo. Zkus to prosím znovu.' },
      { status: 500 }
    )
  }
}
