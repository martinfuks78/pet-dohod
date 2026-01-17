/**
 * Generuje iCalendar (.ics) soubor pro workshop
 * Formát podle RFC 5545
 */
export function generateWorkshopICS({
  workshopDate,
  workshopLocation,
  startDate,
  endDate,
  address,
  program,
  instructorInfo
}) {
  // Pomocná funkce pro formátování data do ICS formátu (YYYYMMDDTHHMMSS)
  const formatICSDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}${month}${day}T${hours}${minutes}${seconds}`
  }

  // Pokud nemáme přesný čas, použijeme celý den
  const dtstart = startDate ? formatICSDate(startDate) : ''
  const dtend = endDate ? formatICSDate(endDate) : ''

  // Fallback pokud nemáme startDate/endDate
  const useAllDay = !startDate || !endDate

  // Timestamp vytvoření
  const now = new Date()
  const dtstamp = formatICSDate(now)

  // Escape speciálních znaků v textu
  const escapeText = (text) => {
    if (!text) return ''
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  // Sestavení popisu
  let description = 'Dvoudenní workshop Pět dohod - praktické ověření moudrosti Čtyř dohod a Páté dohody.'
  if (program) {
    description += `\\n\\nProgram:\\n${escapeText(program)}`
  }
  if (instructorInfo) {
    description += `\\n\\nLektor:\\n${escapeText(instructorInfo)}`
  }
  description += '\\n\\nWeb: https://www.petdohod.cz'
  description += '\\nKontakt: kouc@martinfuks.cz, +420 603 551 119'

  // Location
  const location = address ? `${escapeText(address)}` : escapeText(workshopLocation)

  // UID - unikátní identifikátor
  const uid = `workshop-${workshopDate.replace(/[^0-9]/g, '')}-${Date.now()}@petdohod.cz`

  // ICS obsah
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Pět dohod//Workshop//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    useAllDay
      ? `DTSTART;VALUE=DATE:${workshopDate.replace(/[^0-9]/g, '').substring(0, 8)}`
      : `DTSTART:${dtstart}`,
    useAllDay
      ? `DTEND;VALUE=DATE:${workshopDate.replace(/[^0-9]/g, '').substring(0, 8)}`
      : `DTEND:${dtend}`,
    `SUMMARY:Workshop Pět dohod - ${escapeText(workshopLocation)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-P2D',
    'DESCRIPTION:Připomínka: Workshop Pět dohod za 2 dny',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')

  return icsContent
}

/**
 * Vrací base64 encoded ICS soubor pro email attachment
 */
export function getICSBase64({
  workshopDate,
  workshopLocation,
  startDate,
  endDate,
  address,
  program,
  instructorInfo
}) {
  const icsContent = generateWorkshopICS({
    workshopDate,
    workshopLocation,
    startDate,
    endDate,
    address,
    program,
    instructorInfo
  })

  // Konverze do base64
  const base64 = Buffer.from(icsContent, 'utf-8').toString('base64')

  return base64
}
