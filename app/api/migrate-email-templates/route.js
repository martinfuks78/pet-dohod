import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
  try {
    // Vytvořit tabulku pro email šablony
    await sql`
      CREATE TABLE IF NOT EXISTS email_templates (
        id SERIAL PRIMARY KEY,
        template_key VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        subject TEXT NOT NULL,
        html_body TEXT NOT NULL,
        variables TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Vložit výchozí šablony pokud neexistují
    const existingTemplates = await sql`SELECT COUNT(*) as count FROM email_templates`

    if (existingTemplates.rows[0].count === '0') {
      // Šablona 1: Potvrzovací email po registraci
      await sql`
        INSERT INTO email_templates (template_key, name, subject, html_body, variables)
        VALUES (
          'registration_confirmation',
          'Potvrzení registrace',
          'Registrace na workshop Pět dohod - {{workshopDate}}',
          '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #f49d15; font-size: 28px; margin-bottom: 24px; font-family: Georgia, serif;">
      Děkujeme za registraci! 🙏
    </h2>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      Ahoj <strong>{{firstName}}</strong>,
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Tvoje registrace na workshop <strong>Pět dohod</strong> byla úspěšně přijata. Těšíme se na společné setkání!
    </p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px;">📅 Detail workshopu</h3>
      <p style="color: #78350f; margin: 8px 0;"><strong>Termín:</strong> {{workshopDate}}</p>
      <p style="color: #78350f; margin: 8px 0;"><strong>Místo:</strong> {{workshopLocation}}</p>
      {{#if registrationType_isPair}}
      <p style="color: #78350f; margin: 8px 0;"><strong>Typ:</strong> 👥 Registrace pro pár</p>
      {{/if}}
    </div>

    <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #1e40af; margin: 0 0 12px 0; font-size: 18px;">💳 Platební údaje</h3>
      <p style="color: #1e3a8a; margin: 8px 0;"><strong>Číslo účtu:</strong> {{bankAccount}}</p>
      <p style="color: #1e3a8a; margin: 8px 0;"><strong>Variabilní symbol:</strong> {{variableSymbol}}</p>
      <p style="color: #1e3a8a; margin: 8px 0;"><strong>Částka:</strong> {{price}}</p>
      <p style="color: #1e3a8a; margin: 8px 0; font-size: 14px;">Platbu prosím proveď do 7 dnů od registrace.</p>
    </div>

    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 18px;">ℹ️ Co dál?</h3>
      <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Po obdržení platby ti pošleme potvrzení</li>
        <li>Týden před workshopem obdržíš detailní informace včetně přesné adresy</li>
        <li>V případě dotazů nás neváhej kontaktovat</li>
      </ul>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      Těšíme se na setkání!
    </p>

    <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      S úctou,<br>
      <strong>Martin Fuks</strong><br>
      Lektor workshopu Pět dohod<br>
      📧 kouc@martinfuks.cz
    </p>
  </div>
</div>',
          '{"firstName": "text", "workshopDate": "text", "workshopLocation": "text", "registrationType": "text", "price": "text", "bankAccount": "text", "variableSymbol": "text"}'
        )
      `

      // Šablona 2: Potvrzení platby
      await sql`
        INSERT INTO email_templates (template_key, name, subject, html_body, variables)
        VALUES (
          'payment_confirmation',
          'Potvrzení platby',
          'Platba potvrzena - Workshop {{workshopDate}}',
          '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #10b981; font-size: 28px; margin-bottom: 24px; font-family: Georgia, serif;">
      Platba přijata! ✅
    </h2>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      Ahoj <strong>{{firstName}}</strong>,
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Potvrzujeme, že jsme obdrželi tvou platbu na workshop <strong>Pět dohod</strong>. Tvoje místo je nyní rezervováno!
    </p>

    <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #065f46; margin: 0 0 12px 0; font-size: 18px;">📅 Detail workshopu</h3>
      <p style="color: #047857; margin: 8px 0;"><strong>Termín:</strong> {{workshopDate}}</p>
      <p style="color: #047857; margin: 8px 0;"><strong>Místo:</strong> {{workshopLocation}}</p>
    </div>

    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 18px;">📬 Co dál?</h3>
      <ul style="color: #4b5563; line-height: 1.8; margin: 0; padding-left: 20px;">
        <li>Týden před workshopem ti pošleme detailní informace</li>
        <li>Přesnou adresu a program</li>
        <li>Kontakt na organizátora pro případ dotazů</li>
        <li>Informace o parkování a dopravě</li>
      </ul>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      Těšíme se na viděnou!
    </p>

    <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      S úctou,<br>
      <strong>Martin Fuks</strong><br>
      Lektor workshopu Pět dohod<br>
      📧 kouc@martinfuks.cz
    </p>
  </div>
</div>',
          '{"firstName": "text", "workshopDate": "text", "workshopLocation": "text"}'
        )
      `

      // Šablona 3: Připomínka před workshopem (pro budoucí použití)
      await sql`
        INSERT INTO email_templates (template_key, name, subject, html_body, variables)
        VALUES (
          'workshop_reminder',
          'Připomínka před workshopem',
          'Za týden se vidíme! - Workshop {{workshopDate}}',
          '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background-color: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #f49d15; font-size: 28px; margin-bottom: 24px; font-family: Georgia, serif;">
      Za týden se vidíme! 🎉
    </h2>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
      Ahoj <strong>{{firstName}}</strong>,
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
      Za týden se setkáme na workshopu <strong>Pět dohod</strong>. Posíláme ti všechny důležité informace!
    </p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #92400e; margin: 0 0 12px 0; font-size: 18px;">📅 Kdy a kde</h3>
      <p style="color: #78350f; margin: 8px 0;"><strong>Termín:</strong> {{workshopDate}}</p>
      <p style="color: #78350f; margin: 8px 0;"><strong>Místo:</strong> {{workshopLocation}}</p>
      {{#if address}}
      <p style="color: #78350f; margin: 8px 0;"><strong>Adresa:</strong> {{address}}</p>
      {{/if}}
    </div>

    {{#if program}}
    <div style="background-color: #e0e7ff; border-left: 4px solid #6366f1; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #3730a3; margin: 0 0 12px 0; font-size: 18px;">📋 Program</h3>
      <div style="color: #4338ca; white-space: pre-line;">{{program}}</div>
    </div>
    {{/if}}

    {{#if whatToBring}}
    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="color: #374151; margin: 0 0 12px 0; font-size: 18px;">🎒 Co si vzít s sebou</h3>
      <div style="color: #4b5563; white-space: pre-line;">{{whatToBring}}</div>
    </div>
    {{/if}}

    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">
      Těšíme se na tebe!
    </p>

    <p style="color: #6b7280; font-size: 14px; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
      S úctou,<br>
      <strong>Martin Fuks</strong><br>
      Lektor workshopu Pět dohod<br>
      📧 kouc@martinfuks.cz
    </p>
  </div>
</div>',
          '{"firstName": "text", "workshopDate": "text", "workshopLocation": "text", "address": "text", "program": "textarea", "whatToBring": "textarea"}'
        )
      `
    }

    return NextResponse.json({
      success: true,
      message: 'Email templates table migrated successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
