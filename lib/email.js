import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Pošle potvrzovací email po registraci na workshop
 */
export async function sendRegistrationConfirmation(registration) {
  try {
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
                  <p><strong>Číslo účtu:</strong> 123456789/0100</p>
                  <p><strong>Variabilní symbol:</strong> ${registration.id}</p>
                  <p><strong>Částka:</strong> ${registration.price}</p>
                  <p><strong>Zpráva pro příjemce:</strong> ${registration.firstName} ${registration.lastName} - ${registration.workshopDate}</p>
                </div>

                <p><strong>Důležité:</strong> Po připsání platby na účet ti pošleme potvrzení a další informace o workshopu.</p>

                <p>Pokud máš jakékoliv dotazy, neváhej napsat na <a href="mailto:info@petdohod.cz">info@petdohod.cz</a>.</p>

                <p>Těšíme se na viděnou!</p>
                <p><strong>Tým Pět dohod</strong></p>
              </div>

              <div class="footer">
                <p>ID registrace: ${registration.id}</p>
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

    console.log('Email sent successfully:', data)
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
