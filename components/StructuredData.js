/**
 * Structured Data (JSON-LD) pro SEO
 * Schema.org markup pro lepší indexaci Googlem
 */
export default function StructuredData({ workshops = [] }) {
  // Organization schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pět dohod',
    description: 'Workshopy osobního rozvoje založené na moudrosti Čtyř dohod a Páté dohody',
    url: 'https://www.petdohod.cz',
    logo: 'https://www.petdohod.cz/favicon.svg',
    founder: {
      '@type': 'Person',
      name: 'Martin Fuks',
      jobTitle: 'Lektor a kouč',
      email: 'kouc@martinfuks.cz',
      telephone: '+420603551119',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+420603551119',
      contactType: 'customer service',
      email: 'kouc@martinfuks.cz',
      availableLanguage: ['cs'],
    },
  }

  // Event schema pro každý workshop
  const eventSchemas = workshops.map(workshop => ({
    '@context': 'https://schema.org',
    '@type': 'EducationEvent',
    name: `Pět dohod - Workshop ${workshop.date}`,
    description: 'Dvoudenní workshop založený na moudrosti Čtyř dohod a Páté dohody. Nauč se žít v osobní svobodě, bez zbytečného utrpení a s jasnou myslí.',
    location: {
      '@type': 'Place',
      name: workshop.location,
      address: workshop.address || workshop.location,
    },
    startDate: workshop.startDate || workshop.date,
    endDate: workshop.endDate || workshop.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    organizer: {
      '@type': 'Person',
      name: 'Martin Fuks',
      email: 'kouc@martinfuks.cz',
    },
    offers: {
      '@type': 'Offer',
      price: workshop.priceSingle || 4800,
      priceCurrency: 'CZK',
      availability: workshop.spots > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: 'https://www.petdohod.cz#workshopy',
      validFrom: new Date().toISOString(),
    },
    performer: {
      '@type': 'Person',
      name: 'Martin Fuks',
    },
  }))

  // WebSite schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pět dohod',
    url: 'https://www.petdohod.cz',
    description: 'Workshopy osobního rozvoje založené na moudrosti Čtyř dohod a Páté dohody',
    inLanguage: 'cs',
  }

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Domů',
        item: 'https://www.petdohod.cz',
      },
    ],
  }

  return (
    <>
      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Website Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Event Schemas - pro každý workshop */}
      {eventSchemas.map((schema, index) => (
        <script
          key={`event-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
