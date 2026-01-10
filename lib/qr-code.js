/**
 * Generuje URL pro QR kód podle českého standardu pro platbu
 * Formát: SPD*1.0*ACC:{IBAN}*AM:{AMOUNT}*CC:CZK*MSG:{MESSAGE}*X-VS:{VS}
 */
export function generatePaymentQRCode({
  bankAccount, // např. "123456789/0100"
  amount, // částka v Kč
  variableSymbol,
  message = '',
  size = '300x300'
}) {
  // Převod českého čísla účtu na IBAN (zjednodušený příklad)
  // Pro produkci je lepší použít validní IBAN konverzi
  const iban = convertToIBAN(bankAccount)

  // Formát částky - desetinná tečka, max 2 desetinná místa
  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount)) {
    throw new Error(`Invalid amount for QR code: ${amount}`)
  }
  const formattedAmount = parsedAmount.toFixed(2)

  // Sestavení platebního řetězce
  const paymentData = [
    'SPD*1.0',
    `ACC:${iban}`,
    `AM:${formattedAmount}`,
    'CC:CZK',
    message ? `MSG:${message}` : null,
    variableSymbol ? `X-VS:${variableSymbol}` : null,
  ]
    .filter(Boolean)
    .join('*')

  // Encode pro URL
  const encodedData = encodeURIComponent(paymentData)

  // Vrátí URL pro QR server
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodedData}`
}

/**
 * Zjednodušená konverze českého čísla účtu na IBAN
 * Pro produkční použití doporučuji použít validní IBAN knihovnu
 */
function convertToIBAN(accountNumber) {
  if (!accountNumber) return ''

  // Pokud už je to IBAN, vrátíme to
  if (accountNumber.startsWith('CZ')) {
    return accountNumber
  }

  // Parsování českého formátu (předčíslí-číslo účtu/kód banky)
  const parts = accountNumber.split('/')
  if (parts.length !== 2) {
    // Neplatný formát, vrátíme jak je
    return accountNumber
  }

  const [accountPart, bankCode] = parts
  const accountParts = accountPart.split('-')

  let prefix = '000000'
  let accountNum = accountPart

  if (accountParts.length === 2) {
    prefix = accountParts[0].padStart(6, '0')
    accountNum = accountParts[1]
  }

  // Doplnění čísla účtu na 10 číslic
  const fullAccount = accountNum.padStart(10, '0')

  // Sestavení IBAN (zjednodušené, kontrolní číslo je placeholder)
  // Pro produkci je nutné správně vypočítat kontrolní součet
  const baseIBAN = `CZ00${bankCode}${prefix}${fullAccount}`

  return baseIBAN
}

/**
 * Generuje textovou reprezentaci platebních údajů
 */
export function formatPaymentDetails({
  bankAccount,
  amount,
  variableSymbol,
  message = ''
}) {
  return {
    accountNumber: bankAccount,
    amount: `${amount.toLocaleString('cs-CZ')} Kč`,
    variableSymbol: variableSymbol || '-',
    message: message || '-',
  }
}
