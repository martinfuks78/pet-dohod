import { Resend } from 'resend'
import { generatePaymentQRCode } from './qr-code'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Pošle potvrzovací email po registraci na workshop
 */
export async function sendRegistrationConfirmation(registration, workshop) {
  try {
    // Platební údaje z workshopu nebo fallback na výchozí
    const bankAccount = workshop?.bank_account || '123456789/0100'
    const variableSymbol = registration.variable_symbol || registration.id
    const amount = workshop?.amount || registration.price

    // Vygenerovat QR kód pro platbu
    const qrCodeUrl = generatePaymentQRCode({
      bankAccount,
      amount: parseFloat(amount.toString().replace(/[^\d]/g, '')), // Odstranit "Kč" pokud je tam
      variableSymbol,
      message: `${registration.firstName} ${registration.lastName} - ${registration.workshopDate}`,
      size: '300x300'
    })

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [registration.email],
      subject: `Potvrzení registrace na workshop - ${registration.workshopDate}`,
      html: `
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
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              strong { color: #f49d15; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Děkujeme za registraci!</h1>
              </div>

              <div class="content">
                <p>Ahoj <strong>${registration.firstName}</strong>,</p>

                <p>Tvoje registrace na workshop <strong>Pět dohod</strong> byla úspěšně odeslána.</p>

                <div class="info-box">
                  <h3>📅 Detail workshopu</h3>
                  <p><strong>Termín:</strong> ${registration.workshopDate}</p>
                  <p><strong>Místo:</strong> ${registration.workshopLocation}</p>
                  <p><strong>Typ registrace:</strong> ${registration.registrationType === 'pair' ? 'Pár' : '1 osoba'}</p>
                  ${registration.partnerFirstName ? `<p><strong>Partner:</strong> ${registration.partnerFirstName} ${registration.partnerLastName}</p>` : ''}
                  <p><strong>Cena:</strong> ${registration.price}</p>
                </div>

                <div class="info-box">
                  <h3>💳 Platební údaje</h3>
                  <p><strong>Číslo účtu:</strong> ${bankAccount}</p>
                  <p><strong>Variabilní symbol:</strong> ${variableSymbol}</p>
                  <p><strong>Částka:</strong> ${amount} Kč</p>
                  <p><strong>Zpráva pro příjemce:</strong> ${registration.firstName} ${registration.lastName} - ${registration.workshopDate}</p>

                  <div style="text-align: center; margin-top: 20px; padding: 20px; background: white; border-radius: 8px;">
                    <p style="margin-bottom: 15px;"><strong>🔲 QR kód pro rychlou platbu</strong></p>
                    <img src="${qrCodeUrl}" alt="QR kód pro platbu" style="max-width: 250px; height: auto; margin: 0 auto; display: block;" />
                    <p style="font-size: 12px; color: #666; margin-top: 15px;">
                      Naskenuj QR kód v mobilní bance pro automatické vyplnění platby
                    </p>
                  </div>
                </div>

                <p><strong>Důležité:</strong> Po připsání platby na účet ti pošleme potvrzení a další informace o workshopu.</p>

                <p>Pokud máš jakékoliv dotazy, neváhej napsat na <a href="mailto:kouc@martinfuks.cz">kouc@martinfuks.cz</a>.</p>

                <p>Těšíme se na viděnou!</p>
                <p><strong>Tým Pět dohod</strong></p>
              </div>

              <div class="footer">
                <p>ID registrace: ${registration.id} | VS: ${variableSymbol}</p>
                <p>© 2026 Pět dohod - Workshop osobního rozvoje</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Pošle notifikaci administrátorovi o nové registraci
 */
export async function sendAdminNotification(registration) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [process.env.ADMIN_EMAIL || 'tvuj@email.cz'], // Změň na svůj email
      subject: `[ADMIN] Nová registrace na workshop - ${registration.workshopDate}`,
      html: `
        <h2>Nová registrace na workshop</h2>
        <p><strong>Účastník:</strong> ${registration.firstName} ${registration.lastName}</p>
        <p><strong>Email:</strong> ${registration.email}</p>
        <p><strong>Telefon:</strong> ${registration.phone}</p>
        <p><strong>Workshop:</strong> ${registration.workshopDate} - ${registration.workshopLocation}</p>
        <p><strong>Typ:</strong> ${registration.registrationType === 'pair' ? 'Pár' : '1 osoba'}</p>
        ${registration.partnerFirstName ? `<p><strong>Partner:</strong> ${registration.partnerFirstName} ${registration.partnerLastName} (${registration.partnerEmail})</p>` : ''}
        <p><strong>Cena:</strong> ${registration.price}</p>
        ${registration.notes ? `<p><strong>Poznámka:</strong> ${registration.notes}</p>` : ''}
        <p><strong>ID:</strong> ${registration.id}</p>
        <p><strong>Datum registrace:</strong> ${new Date(registration.createdAt).toLocaleString('cs-CZ')}</p>

        <hr>
        <p><a href="https://pet-dohod.vercel.app/admin">Otevřít admin panel</a></p>
      `,
    })

    if (error) {
      console.error('Admin notification error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Admin notification error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Pošle potvrzení platby po změně statusu na "confirmed"
 */
export async function sendPaymentConfirmation(registration) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: [registration.email],
      subject: `Platba potvrzena - Workshop ${registration.workshop_date}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
              strong { color: #4CAF50; }
              .checkmark { font-size: 48px; color: #4CAF50; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="checkmark">✓</div>
                <h1>Platba přijata!</h1>
              </div>

              <div class="content">
                <p>Ahoj <strong>${registration.first_name}</strong>,</p>

                <p>Potvrzujeme, že jsme obdrželi tvou platbu za workshop <strong>Pět dohod</strong>.</p>

                <div class="info-box">
                  <h3>📅 Detail workshopu</h3>
                  <p><strong>Termín:</strong> ${registration.workshop_date}</p>
                  <p><strong>Místo:</strong> ${registration.workshop_location}</p>
                  ${registration.partner_first_name ? `<p><strong>Partner:</strong> ${registration.partner_first_name} ${registration.partner_last_name}</p>` : ''}
                </div>

                <div class="info-box">
                  <h3>✉️ Co dál?</h3>
                  <p><strong>Týden před workshopem</strong> ti pošleme:</p>
                  <ul>
                    <li>Přesnou adresu místa konání</li>
                    <li>Detailní program obou dnů</li>
                    <li>Seznam věcí, které si vzít s sebou</li>
                    <li>Kontakt na organizátora</li>
                  </ul>
                </div>

                <p>Pokud máš jakékoliv dotazy, neváhej napsat na <a href="mailto:kouc@martinfuks.cz">kouc@martinfuks.cz</a> nebo zavolat na +420 603 551 119.</p>

                <p><strong>Těšíme se na viděnou!</strong></p>
                <p>Martin Fuks a tým Pět dohod</p>
              </div>

              <div class="footer">
                <p>ID registrace: ${registration.id} | VS: ${registration.variable_symbol}</p>
                <p>© 2026 Pět dohod - Workshop osobního rozvoje</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Payment confirmation email error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Payment confirmation email error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Pošle kontaktní zprávu z webu
 */
export async function sendContactEmail(contactData) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: ['kouc@martinfuks.cz'],
      replyTo: contactData.email,
      subject: `[KONTAKT] Nová zpráva od ${contactData.name}`,
      html: `
        <h2>Nová kontaktní zpráva z webu Pět dohod</h2>
        <p><strong>Jméno:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        ${contactData.phone ? `<p><strong>Telefon:</strong> ${contactData.phone}</p>` : ''}

        <h3>Zpráva:</h3>
        <p style="white-space: pre-wrap;">${contactData.message}</p>

        <hr>
        <p style="color: #666; font-size: 14px;">
          Odpověz na tento email a tvoje odpověď půjde přímo na ${contactData.email}
        </p>
      `,
    })

    if (error) {
      console.error('Contact email error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Contact email error:', error)
    return { success: false, error: error.message }
  }
}
