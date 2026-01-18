/**
 * Email Delivery Monitoring
 *
 * Pomocné funkce pro sledování doručování emailů a retry logiku.
 */

import * as Sentry from '@sentry/nextjs'

/**
 * Email delivery status
 */
export const EMAIL_STATUS = {
  PENDING: 'pending',       // Čeká na odeslání
  SENT: 'sent',            // Odeslán (ale možná nedoručen)
  DELIVERED: 'delivered',  // Potvrzeno doručení
  FAILED: 'failed',        // Selhalo odeslání
  BOUNCED: 'bounced',      // Email se vrátil (neexistující adresa)
}

/**
 * Retry konfigurace
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelays: [5000, 30000, 300000], // 5s, 30s, 5min
}

/**
 * Odeslat email s retry logikou
 */
export async function sendEmailWithRetry(emailFunction, emailData, retryCount = 0) {
  try {
    const result = await emailFunction(emailData)

    // Log úspěšného odeslání
    console.log(`✅ Email sent successfully:`, {
      to: emailData.to || emailData.email,
      subject: emailData.subject,
      type: emailData.type,
    })

    // Logovat do Sentry pro monitoring
    Sentry.addBreadcrumb({
      category: 'email',
      message: 'Email sent successfully',
      level: 'info',
      data: {
        to: emailData.to || emailData.email,
        subject: emailData.subject,
        type: emailData.type,
      },
    })

    return {
      success: true,
      status: EMAIL_STATUS.SENT,
      result,
    }
  } catch (error) {
    console.error(`❌ Email send failed (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries}):`, error)

    // Log chyby do Sentry
    Sentry.captureException(error, {
      tags: {
        type: 'email_delivery',
        retry_count: retryCount,
      },
      extra: {
        emailData: {
          to: emailData.to || emailData.email,
          subject: emailData.subject,
          type: emailData.type,
        },
      },
    })

    // Retry pokud ještě jsou pokusy
    if (retryCount < RETRY_CONFIG.maxRetries - 1) {
      const delay = RETRY_CONFIG.retryDelays[retryCount]
      console.log(`⏳ Retrying in ${delay}ms...`)

      await new Promise(resolve => setTimeout(resolve, delay))
      return sendEmailWithRetry(emailFunction, emailData, retryCount + 1)
    }

    // Vyčerpány všechny pokusy
    return {
      success: false,
      status: EMAIL_STATUS.FAILED,
      error: error.message,
      retryCount: retryCount + 1,
    }
  }
}

/**
 * Kontrola validity email adresy
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Sanitizace email adresy (odstranění white spaces)
 */
export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') {
    return ''
  }

  return email.trim().toLowerCase()
}

/**
 * Detekce disposable email domén
 */
const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'trashmail.com',
]

export function isDisposableEmail(email) {
  if (!email) return false

  const domain = email.split('@')[1]?.toLowerCase()
  return DISPOSABLE_DOMAINS.includes(domain)
}

/**
 * Email queue helper pro bulk emaily
 */
export class EmailQueue {
  constructor(maxConcurrent = 3) {
    this.queue = []
    this.processing = []
    this.maxConcurrent = maxConcurrent
  }

  async add(emailFunction, emailData) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        emailFunction,
        emailData,
        resolve,
        reject,
      })

      this.process()
    })
  }

  async process() {
    if (this.processing.length >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    this.processing.push(item)

    try {
      const result = await sendEmailWithRetry(item.emailFunction, item.emailData)
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    } finally {
      this.processing = this.processing.filter(i => i !== item)
      this.process() // Zpracovat další z fronty
    }
  }

  async waitAll() {
    while (this.queue.length > 0 || this.processing.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
}

/**
 * Helper pro logování email statistik
 */
export function logEmailStats(stats) {
  console.log('\n📊 Email Delivery Stats:')
  console.log(`  Total sent: ${stats.total}`)
  console.log(`  Successful: ${stats.successful} (${Math.round(stats.successful / stats.total * 100)}%)`)
  console.log(`  Failed: ${stats.failed} (${Math.round(stats.failed / stats.total * 100)}%)`)

  if (stats.failed > 0) {
    console.log(`  Failed emails:`, stats.failedEmails)
  }

  // Logovat do Sentry
  Sentry.addBreadcrumb({
    category: 'email_stats',
    message: 'Email delivery statistics',
    level: 'info',
    data: stats,
  })
}

/**
 * Webhook handler pro Resend delivery events
 *
 * Resend může posílat webhooky o stavu emailů:
 * - email.sent
 * - email.delivered
 * - email.bounced
 * - email.complained (spam report)
 */
export function handleResendWebhook(event) {
  const { type, data } = event

  switch (type) {
    case 'email.delivered':
      console.log(`✅ Email delivered: ${data.to}`)
      Sentry.addBreadcrumb({
        category: 'email',
        message: 'Email delivered',
        level: 'info',
        data: { to: data.to, messageId: data.message_id },
      })
      break

    case 'email.bounced':
      console.error(`❌ Email bounced: ${data.to}`)
      Sentry.captureMessage(`Email bounced: ${data.to}`, {
        level: 'warning',
        tags: { type: 'email_bounced' },
        extra: data,
      })
      break

    case 'email.complained':
      console.error(`⚠️ Spam complaint: ${data.to}`)
      Sentry.captureMessage(`Spam complaint: ${data.to}`, {
        level: 'warning',
        tags: { type: 'email_spam' },
        extra: data,
      })
      break

    case 'email.sent':
      console.log(`📤 Email sent: ${data.to}`)
      break

    default:
      console.log(`Unknown email event: ${type}`)
  }

  return { received: true, type }
}
