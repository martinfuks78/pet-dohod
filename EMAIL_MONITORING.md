# Email Delivery Monitoring

Tento projekt implementuje monitoring doručování emailů s retry logikou a integra cí se Sentry.

## Funkce

✅ **Retry logika** - Automaticky opakuje neúspěšné pokusy o odeslání
✅ **Email validace** - Kontrola formátu a disposable domén
✅ **Bulk email queue** - Paralelní odesílání emailů s rate limitem
✅ **Sentry integrace** - Logování všech email eventů
✅ **Webhook support** - Připraveno pro Resend webhooky

## Použití

### Základní odeslání s retry

```javascript
import { sendEmailWithRetry } from '../../../lib/email-monitor'
import { sendRegistrationConfirmation } from '../../../lib/email'

export async function POST(request) {
  const data = await request.json()

  // Odeslat email s automatickým retry
  const result = await sendEmailWithRetry(
    sendRegistrationConfirmation,
    {
      to: data.email,
      subject: 'Potvrzení registrace',
      type: 'registration',
      ...data
    }
  )

  if (!result.success) {
    return NextResponse.json(
      { error: 'Email se nepodařilo odeslat' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
```

### Email validace

```javascript
import { isValidEmail, sanitizeEmail, isDisposableEmail } from '../../../lib/email-monitor'

// Kontrola formátu
if (!isValidEmail(email)) {
  return { error: 'Neplatný email formát' }
}

// Sanitizace (odstranění mezer, lowercase)
const cleanEmail = sanitizeEmail('  Test@Gmail.COM  ')
// → 'test@gmail.com'

// Detekce disposable emailů
if (isDisposableEmail('user@tempmail.com')) {
  return { error: 'Disposable emaily nejsou povoleny' }
}
```

### Bulk emaily s queue

```javascript
import { EmailQueue, logEmailStats } from '../../../lib/email-monitor'

async function sendBulkEmails(registrations) {
  const queue = new EmailQueue(3) // Max 3 paralelně
  const stats = { total: 0, successful: 0, failed: 0, failedEmails: [] }

  for (const registration of registrations) {
    stats.total++

    const result = await queue.add(
      sendRegistrationConfirmation,
      { ...registration, type: 'bulk' }
    )

    if (result.success) {
      stats.successful++
    } else {
      stats.failed++
      stats.failedEmails.push(registration.email)
    }
  }

  await queue.waitAll()

  logEmailStats(stats)

  return stats
}
```

## Retry konfigurace

```javascript
const RETRY_CONFIG = {
  maxRetries: 3,                      // Maximální počet pokusů
  retryDelays: [5000, 30000, 300000], // Prodlevy: 5s, 30s, 5min
}
```

**Timeouts:**
- 1. pokus: okamžitě
- 2. pokus: po 5 sekundách
- 3. pokus: po 30 sekundách
- 4. pokus: po 5 minutách

## Email stavy

```javascript
export const EMAIL_STATUS = {
  PENDING: 'pending',       // Čeká na odeslání
  SENT: 'sent',            // Odeslán (možná nedoručen)
  DELIVERED: 'delivered',  // Potvrzeno doručení (webhook)
  FAILED: 'failed',        // Selhalo odeslání
  BOUNCED: 'bounced',      // Email se vrátil (neexistující adresa)
}
```

## Sentry integrace

Všechny email eventy se logují do Sentry:

```javascript
// Úspěšné odeslání
Sentry.addBreadcrumb({
  category: 'email',
  message: 'Email sent successfully',
  data: { to, subject, type }
})

// Selhání odeslání
Sentry.captureException(error, {
  tags: { type: 'email_delivery' },
  extra: { emailData }
})
```

**Monitoring v Sentry:**
1. Jdi do Sentry dashboard
2. Vyhledej `email_delivery` v Issues
3. Filtruj podle `category:email`

## Resend Webhooky (Volitelné)

Resend může posílat webhooky o stavu emailů:

### 1. Vytvoření webhook endpointu

Vytvořit `app/api/webhooks/resend/route.js`:

```javascript
import { NextResponse } from 'next/server'
import { handleResendWebhook } from '../../../../lib/email-monitor'

export async function POST(request) {
  const event = await request.json()

  // Ověřit webhook signature (doporučeno v produkci)
  // const signature = request.headers.get('resend-signature')
  // if (!verifySignature(signature, event)) {
  //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  // }

  const result = handleResendWebhook(event)

  return NextResponse.json(result)
}
```

### 2. Konfigurace na Resend

1. Jdi do [Resend Dashboard](https://resend.com/webhooks)
2. Vytvoř nový webhook
3. URL: `https://petdohod.cz/api/webhooks/resend`
4. Events: `email.sent`, `email.delivered`, `email.bounced`, `email.complained`
5. Zkopíruj Webhook Secret

### 3. Přidání do .env

```bash
RESEND_WEBHOOK_SECRET=whsec_...
```

## Disposable Email Protection

Blokovány jsou tyto disposable email domény:

- tempmail.com
- 10minutemail.com
- guerrillamail.com
- mailinator.com
- trashmail.com

**Přidat další domény:**

Upravit `DISPOSABLE_DOMAINS` v `lib/email-monitor.js`:

```javascript
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  // ... existing
  'nová-disposable-doména.com', // ← Přidat sem
]
```

## Troubleshooting

### Emaily se neodesílají

1. **Zkontrolovat Resend API key:**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Zkontrolovat logy:**
   ```bash
   vercel logs --prod
   ```

3. **Zkontrolovat Sentry:**
   - Vyhledej `email_delivery` v Issues
   - Kontroluj error messages

### Retry loop (nekonečné opakování)

- **Důvod:** Chyba v retry logice
- **Řešení:** Zkontroluj `maxRetries` v `RETRY_CONFIG`

### Webhooky nefungují

1. **Zkontrolovat endpoint:**
   ```bash
   curl -X POST https://petdohod.cz/api/webhooks/resend \
     -H "Content-Type: application/json" \
     -d '{"type":"email.sent","data":{"to":"test@example.com"}}'
   ```

2. **Zkontrolovat Resend dashboard:**
   - Webhooks → Event log
   - Zkontroluj delivery status

## Best Practices

### ✅ Doporučeno

- Vždy používat `sendEmailWithRetry()` místo přímého volání email funkce
- Validovat email před odesláním: `isValidEmail()`, `isDisposableEmail()`
- Pro bulk emaily používat `EmailQueue` s max 3-5 paralelními požadavky
- Logovat statistiky pomocí `logEmailStats()` po bulk odeslání
- Monitorovat Sentry pro failed emails

### ❌ Nedoporučeno

- Nepoužívat přímo email funkce bez retry
- Neignorovat failed emails (vždy logovat)
- Neodesílat bulk emaily bez queue (risk rate limit)
- Nepřidávat sleep/delay do retry logiky (už je implementováno)

## Příklad: Kompletní workflow

```javascript
import {
  sendEmailWithRetry,
  isValidEmail,
  sanitizeEmail,
  isDisposableEmail,
  EmailQueue,
  logEmailStats
} from '../../../lib/email-monitor'
import { sendRegistrationConfirmation } from '../../../lib/email'

export async function POST(request) {
  const { registrations } = await request.json()

  // Validace
  const validRegistrations = registrations.filter(reg => {
    const email = sanitizeEmail(reg.email)

    if (!isValidEmail(email)) {
      console.warn(`Invalid email: ${email}`)
      return false
    }

    if (isDisposableEmail(email)) {
      console.warn(`Disposable email: ${email}`)
      return false
    }

    return true
  })

  // Bulk odeslání s queue
  const queue = new EmailQueue(3)
  const stats = { total: 0, successful: 0, failed: 0, failedEmails: [] }

  for (const registration of validRegistrations) {
    stats.total++

    const result = await queue.add(
      sendRegistrationConfirmation,
      { ...registration, type: 'bulk_confirmation' }
    )

    if (result.success) {
      stats.successful++
    } else {
      stats.failed++
      stats.failedEmails.push(registration.email)
    }
  }

  await queue.waitAll()

  // Log statistiky
  logEmailStats(stats)

  return NextResponse.json({
    success: true,
    stats
  })
}
```

## Production Checklist

- [ ] Otestovat retry logiku lokálně (odpojit internet)
- [ ] Zkontrolovat Resend API limit (3000 emailů/měsíc na free tier)
- [ ] Nastavit Resend webhooky (volitelné)
- [ ] Přidat disposable email filter do registračního formuláře
- [ ] Monitorovat Sentry pro email errors
- [ ] Dokumentovat failed email workflow pro Martina
