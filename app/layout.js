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
    index: false,
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
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="cs" className={`${inter.variable} ${lora.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
