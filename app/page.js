// Server Component - No 'use client' directive
import { getAllWorkshops, getWorkshopRegistrationCount } from '../lib/db'
import HomeClient from './page-client'

export default async function Home() {
  // Server-side data fetching - bots can see this data!
  const workshops = await getAllWorkshops()

  // Calculate available spots for each workshop
  const workshopsWithCounts = await Promise.all(
    workshops.map(async (workshop) => {
      const registrationCount = await getWorkshopRegistrationCount(
        workshop.date,
        workshop.location
      )

      return {
        id: workshop.id,
        name: workshop.name,
        date: workshop.date,
        location: workshop.location,
        spots: workshop.capacity ? (workshop.capacity - registrationCount) : null,
        capacity: workshop.capacity,
        registrationCount: registrationCount,
        price: `${workshop.price_single.toLocaleString('cs-CZ')} Kč`,
        priceSingle: workshop.price_single,
        priceCouple: workshop.price_couple,
        program: workshop.program,
        address: workshop.address,
        whatToBring: workshop.what_to_bring,
        instructorInfo: workshop.instructor_info,
      }
    })
  )

  // Pass data to client component for hydration
  return <HomeClient workshops={workshopsWithCounts} />
}

// ISR - Incremental Static Regeneration
// Revalidate every 60 seconds for fresh workshop data
export const revalidate = 60

// Dynamic metadata for SEO
export async function generateMetadata() {
  const workshops = await getAllWorkshops()

  return {
    title: 'Pět dohod - Workshop pro osobní svobodu',
    description: `Praktické workshopy podle knih Čtyři dohody a Pátá dohoda. ${workshops.length} nadcházejících termínů.`,
    openGraph: {
      title: 'Pět dohod - Workshop pro osobní svobodu',
      description: `Praktické workshopy podle knih Čtyři dohody a Pátá dohoda. ${workshops.length} nadcházejících termínů.`,
      type: 'website',
    },
  }
}
