import { Inter, Lora } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
})

export const metadata = {
  title: 'Pět dohod - Workshop pro osobní svobodu',
  description: 'Dvoudenní workshop založený na moudrosti Čtyř dohod a Páté dohody. Nauč se žít v osobní svobodě, bez zbytečného utrpení a s jasnou myslí.',
  keywords: 'pět dohod, čtyři dohody, workshop, osobní růst, Don Miguel Ruiz, Martin Fuks',
  authors: [{ name: 'Martin Fuks' }],
  robots: {
    index: false, // ⚠️ ZMĚNIT na true při přesunu na www.petdohod.cz
    follow: true,
    nocache: true,
  },
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Pět dohod - Workshop pro osobní svobodu',
    description: 'Dvoudenní workshop založený na moudrosti Čtyř dohod a Páté dohody.',
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://www.petdohod.cz', // Ready pro produkci
    siteName: 'Pět dohod',
  },
  alternates: {
    canonical: 'https://www.petdohod.cz', // Ready pro produkci
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pět dohod - Workshop pro osobní svobodu',
    description: 'Dvoudenní workshop založený na moudrosti Čtyř dohod a Páté dohody.',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${inter.variable} ${lora.variable}`}>
      <body className="antialiased">
        <noscript>
          <style>{`
            /* Statický obsah bez animací pro boty a uživatele bez JS */
            [data-animate] {
              opacity: 1 !important;
              transform: none !important;
            }
            /* Framer Motion elementy by default viditelné */
            * {
              animation: none !important;
              transition: none !important;
            }
          `}</style>
        </noscript>
        {children}
      </body>
    </html>
  )
}
