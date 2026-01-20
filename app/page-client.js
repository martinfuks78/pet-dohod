'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Calendar, Users, Building2, CheckCircle2, ChevronDown, Volume2, VolumeX } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '../components/Navigation'
import RegistrationModal from '../components/RegistrationModal'
import ContactForm from '../components/ContactForm'
import StructuredData from '../components/StructuredData'
import NewsletterForm from '../components/NewsletterForm'

export default function HomeClient({ workshops }) {
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState(null) // 'success', 'error', or null
  const [registrationMessage, setRegistrationMessage] = useState('')
  const [registrationData, setRegistrationData] = useState(null) // VS, price, account
  const [registrationWorkshopId, setRegistrationWorkshopId] = useState(null) // ID workshopu pro zobrazení hlášky

  // Check URL for registration success/error status (for no-JS fallback)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const status = params.get('registration')

      if (status === 'success') {
        setRegistrationStatus('success')
        setRegistrationWorkshopId(params.get('workshop'))
        const isWaitlist = params.get('waitlist') === 'true'
        if (isWaitlist) {
          setRegistrationMessage('Jste na náhradnické listině! Pokud se uvolní místo, ozveme se vám.')
        } else {
          const vs = params.get('vs')
          const price = params.get('price')
          const account = params.get('account')
          setRegistrationData({ vs, price, account })
          setRegistrationMessage('Registrace proběhla úspěšně! Níže najdete platební údaje.')
        }
      } else if (status === 'error') {
        setRegistrationStatus('error')
        setRegistrationWorkshopId(params.get('workshop'))
        const message = params.get('message')
        setRegistrationMessage(message || 'Něco se pokazilo. Zkuste to prosím znovu.')
      }
    }
  }, [])

  // Scroll position restoration (preserve scroll on refresh)
  useEffect(() => {
    // Check if this is a page refresh (has saved scroll position)
    const savedScrollPosition = sessionStorage.getItem('scrollPosition')

    if (savedScrollPosition) {
      // Restore scroll position after a small delay to ensure content is rendered
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10))
      }, 100)
    } else {
      // New page load - scroll to top
      window.scrollTo(0, 0)
    }

    // Save scroll position on scroll events
    const handleScroll = () => {
      sessionStorage.setItem('scrollPosition', window.scrollY.toString())
    }

    window.addEventListener('scroll', handleScroll)

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const openRegistration = (workshop) => {
    console.log('🎯 Opening registration for workshop:', { id: workshop.id, name: workshop.name, date: workshop.date })
    setSelectedWorkshop(workshop)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedWorkshop(null), 300)
  }

  return (
    <>
      <StructuredData workshops={workshops} />
      <Navigation />
      <RegistrationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        workshop={selectedWorkshop || workshops[0]}
      />
      <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-50 via-white to-sage-50 px-4 py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/subtle-grid.svg')] opacity-5"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex items-center justify-center gap-8 lg:gap-16">
            {/* Levá kniha - Čtyři dohody */}
            <motion.div
              initial={{ opacity: 0, x: -50, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: -8 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block relative translate-y-16"
              style={{ transformOrigin: 'center right' }}
            >
              <div className="relative w-44 xl:w-[13.2rem] transform hover:scale-105 transition-transform duration-300">
                <div className="relative aspect-[2/3] rounded-lg shadow-xl overflow-hidden">
                  <Image
                    src="/ctyri-dohody.jpg"
                    alt="Čtyři dohody - Don Miguel Ruiz"
                    fill
                    className="object-cover grayscale opacity-20 brightness-125 hover:grayscale-0 hover:opacity-100 hover:brightness-100 transition-all duration-500"
                    priority
                  />
                </div>
                {/* 3D depth shadow */}
                <div className="absolute -right-2 top-2 w-full h-full bg-black/10 rounded-lg -z-10 blur-sm"></div>
              </div>
            </motion.div>

            {/* Střed - Hlavní obsah */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl mx-auto text-center"
            >
              {/* Grafické logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <Image
                  src="/logo.png"
                  alt="Logo Pět dohod - workshopy podle knih Čtyři dohody a Pátá dohoda"
                  width={800}
                  height={600}
                  priority
                  className="w-full max-w-[290px] sm:max-w-[290px] md:max-w-[339px] lg:max-w-[387px] mx-auto h-auto"
                />
              </motion.div>

              {/* Neviditelný H1 pro SEO */}
              <h1 className="sr-only">
                Pět dohod - Čtyři dohody a Pátá dohoda - Workshopy pro osobní svobodu
              </h1>

              <p className="text-lg sm:text-lg md:text-xl lg:text-2xl text-gray-700 font-semibold mb-3 max-w-3xl mx-auto leading-relaxed">
                Praktické workshopy podle knih Čtyři dohody a Pátá dohoda.
              </p>

              <p className="text-lg sm:text-base md:text-lg lg:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Přestaňte zbytečně trpět a začněte naplno žít.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="#terminy"
                  className="group px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Zobrazit termíny
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#dohody"
                  className="px-8 py-4 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200"
                >
                  Co jsou dohody?
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-16 md:mt-14 flex items-center justify-center gap-8 text-sm text-gray-500"
              >
                <div className="hidden md:flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>1 - 5 dní</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Malé skupiny</span>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Praxe, ne teorie</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Pravá kniha - Pátá dohoda */}
            <motion.div
              initial={{ opacity: 0, x: 50, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: 8 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block relative translate-y-16"
              style={{ transformOrigin: 'center left' }}
            >
              <div className="relative w-44 xl:w-[13.2rem] transform hover:scale-105 transition-transform duration-300">
                <div className="relative aspect-[2/3] rounded-lg shadow-xl overflow-hidden">
                  <Image
                    src="/pata-dohoda.jpg"
                    alt="Pátá dohoda - Don Miguel Ruiz"
                    fill
                    className="object-cover grayscale opacity-20 brightness-125 hover:grayscale-0 hover:opacity-100 hover:brightness-100 transition-all duration-500"
                    priority
                  />
                </div>
                {/* 3D depth shadow */}
                <div className="absolute -left-2 top-2 w-full h-full bg-black/10 rounded-lg -z-10 blur-sm"></div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <Link
            href="#dohody"
            className="block cursor-pointer hover:scale-110 transition-transform"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById('dohody')?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Dohody Section */}
      <section id="dohody" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Co je PĚT DOHOD?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Pět jednoduchých principů, které mění život.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agreements.map((agreement, index) => (
              <AgreementCard key={index} agreement={agreement} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Každá dohoda je jednoduchá. Ale dát ji do praxe? To chce trénink a zkušenost.<br />
              Přesně to získáte na našich workshopech.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Proc section */}
      <section className="py-24 px-4 bg-gradient-to-br from-sage-50 to-earth-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Proč se zúčastnit?
            </h2>
          </motion.div>

          <div className="space-y-8">
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-gray-700 mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Terminy Section */}
      <section id="terminy" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Nadcházející termíny
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vyberte si termín, který Vám vyhovuje. Každý workshop je dvoudenní a probíhá v malých skupinách.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {workshops.length === 0 ? (
              // No workshops message
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-600">Momentálně nejsou k dispozici žádné termíny.</p>
                <p className="text-gray-500 mt-2">Sledujte tuto stránku nebo nás kontaktujte pro více informací.</p>
              </div>
            ) : (
              // Workshops list
              workshops.map((workshop, index) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  index={index}
                  onRegister={openRegistration}
                  registrationStatus={registrationWorkshopId === String(workshop.id) ? registrationStatus : null}
                  registrationMessage={registrationWorkshopId === String(workshop.id) ? registrationMessage : ''}
                  registrationData={registrationWorkshopId === String(workshop.id) ? registrationData : null}
                />
              ))
            )}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-4">
              Žádný termín ti nevyhovuje? Ozvěte se a domluvíme individuální termín.
            </p>
            <a
              href="#kontakt"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-block px-6 py-3 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold cursor-pointer"
            >
              Napište mi
            </a>
          </motion.div>
        </div>
      </section>

      {/* Pro firmy Section */}
      <section id="firmy" className="py-24 px-4 bg-gradient-to-br from-earth-50 to-sage-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Firemní workshop nebo teambuilding
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pět dohod pro zdravější a produktivnější pracovní prostředí? Vyzkoušejte netradiční teambuilding, kde se lidé baví osobním rozvojem.
            </p>
          </motion.div>

          {/* Video Case Study */}
          <VideoPlayer />

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-serif font-semibold text-gray-700 mb-6">
                  Co získáte
                </h3>
                <ul className="space-y-4">
                  {companyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-serif font-semibold text-gray-700 mb-6">
                  Jak to funguje
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <h4 className="font-semibold text-gray-700">Úvodní konzultace</h4>
                    </div>
                    <p className="text-gray-600 ml-11">
                      Probereme, co potřebuje váš tým a upravíme workshop přesně na míru.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                      <h4 className="font-semibold text-gray-700">Workshop nebo teambuilding</h4>
                    </div>
                    <p className="text-gray-600 ml-11">
                      Akce Pět dohod plných intenzivní práce, praktických cvičení a AHA momentů.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                      <h4 className="font-semibold text-gray-700">Follow-up</h4>
                    </div>
                    <p className="text-gray-600 ml-11">
                      Následná podpora, aby se změny skutečně propsaly do praxe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 text-center">
              <a
                href="#kontakt"
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="inline-block px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-lg cursor-pointer"
              >
                Domluvit firemní workshop
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* O mně Section */}
      <section id="o-mne" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Kdo stojí za workshopem
            </h2>
          </motion.div>

          <div className="bg-gradient-to-br from-earth-50 to-white rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src="/martin-fuks-profile.jpg"
                    alt="Martin Fuks"
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    quality={80}
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Jsem <strong>Martin Fuks</strong> a práci s lidmi se věnuju přes 22 let. Začínal jsem jako manažer, prošel jsem hlubokou osobní krizí a změnil kompletně svůj život.
                </p>
                <p>
                  Dnes se věnuju koučinku, mentoringui a vedení firemních akcí. Baví mě to. Pracuji se spoustou konkrétních příkladů z vlastní praxe - žádná omáčka, trapné scénky nebo suchá teorie.
                </p>
                <p>
                  S Pěti dohody pracuji, protože fungují. Nejde o ezoteriku nebo nějakou nafouknutou filozofii. Jsou to jednoduché principy, které když začneš používat, změní ti život.
                </p>
                <p>
                  Mým cílem je, aby při každé schůzce vznikly AHA momenty - ty okamžiky, kdy ti dojde, proč děláš to, co děláš. A jak to změnit.
                </p>
                <div className="pt-4">
                  <Link
                    href="https://www.martinfuks.cz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 font-semibold underline"
                  >
                    Více o mně →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 px-4 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Co říkají účastníci
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Reálné příběhy lidí, kteří prošli workshopem Pět dohod
            </p>
            {/* Social Proof Statistics */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600 mt-1">spokojených účastníků</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-gray-600 mt-1">doporučuje workshopy</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary-600">22 let</div>
                <div className="text-sm text-gray-600 mt-1">zkušeností s lidmi</div>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
              </motion.div>
            ))}
          </div>

          {/* Workshop fotky */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="/workshop-team-1.jpg"
                alt="Workshop Pět dohod - týmová akce"
                width={400}
                height={300}
                className="object-cover w-full h-64"
                quality={75}
                loading="lazy"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="/workshop-team-2.jpg"
                alt="Workshop Pět dohod - skupina účastníků"
                width={400}
                height={300}
                className="object-cover w-full h-64"
                quality={75}
                loading="lazy"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src="/workshop-team-3.jpg"
                alt="Workshop Pět dohod - workshop v akci"
                width={400}
                height={300}
                className="object-cover w-full h-64"
                quality={75}
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-50 to-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border-2 border-primary-200"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-full mb-6">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-serif font-bold text-gray-700 mb-4">
                100% Garance spokojenosti
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Pokud z jakéhokoliv důvodu nebudete s workshopem spokojeni, stačí mi to říct během prvního dne a vrátím vám celou částku. Bez otázek, bez problémů.
              </p>
              <p className="text-sm text-gray-500 mt-4">
                Jsem si jistý, že workshop přinese hodnotu. Proto nabízím tuto záruku.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-gradient-to-br from-sage-50 to-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Časté otázky
            </h2>
          </motion.div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-600 mb-4">
              Něco dalšího tě zajímá?
            </p>
            <a
              href="#kontakt"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('kontakt')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold cursor-pointer"
            >
              Zeptej se
            </a>
          </motion.div>
        </div>
      </section>

      {/* Kontakt Section */}
      <section id="kontakt" className="py-24 px-4 bg-gradient-to-br from-primary-50 to-earth-50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-700 mb-6">
              Máš otázku?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Napiš mi a já ti odpovím co nejdříve.
            </p>
          </motion.div>

          <ContactForm />
        </div>
      </section>
    </main>

    {/* Footer */}
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-white font-serif text-xl font-bold mb-4">Pět dohod</h3>
            <p className="text-sm leading-relaxed">
              Workshop pro osobní svobodu založený na moudrosti Čtyř dohod a Páté dohody.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Navigace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#dohody" className="hover:text-primary-400 transition-colors">Dohody</Link></li>
              <li><Link href="#terminy" className="hover:text-primary-400 transition-colors">Termíny</Link></li>
              <li><Link href="#firmy" className="hover:text-primary-400 transition-colors">Pro firmy</Link></li>
              <li><Link href="#o-mne" className="hover:text-primary-400 transition-colors">O mně</Link></li>
              <li><Link href="#faq" className="hover:text-primary-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">
              Přihlaste se k odběru novinek o nadcházejících workshopech.
            </p>
            <NewsletterForm />
            <div className="mt-6">
              <h5 className="text-white text-sm font-semibold mb-2">Kontakt</h5>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="mailto:kouc@martinfuks.cz" className="hover:text-primary-400 transition-colors">
                    kouc@martinfuks.cz
                  </a>
                </li>
                <li>
                  <a href="https://www.martinfuks.cz" target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition-colors">
                    martinfuks.cz
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Martin Fuks. Všechna práva vyhrazena.</p>
        </div>
      </div>
    </footer>
    </>
  )
}

// Agreement Card Component
function AgreementCard({ agreement, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
          {index + 1}
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-serif font-semibold text-gray-700">
            {agreement.title}
          </h3>
          {agreement.subtitle && (
            <p className="text-sm text-primary-600 font-medium mt-1">
              {agreement.subtitle}
            </p>
          )}
        </div>
      </div>
      <p className="text-gray-600 leading-relaxed">
        {agreement.description}
      </p>
    </motion.div>
  )
}

// Data
const agreements = [
  {
    title: 'Nehřešte slovem',
    subtitle: 'Miřte slovy přesně',
    description: 'Slova mají sílu. Mohou tvořit nebo bořit. Naučte se vyjadřovat, abyste nezraňovali sebe ani druhé.'
  },
  {
    title: 'Neberte si nic osobně',
    description: 'Co dělají a říkají druzí, není o vás. Je to o nich. Přestaňte se ubíjet cizími názory.'
  },
  {
    title: 'Nevytvářejte si žádné domněnky',
    description: 'Příběhy, které si tvoříte v hlavě, často nejsou pravdivé. Skončete s nimi.'
  },
  {
    title: 'Dělejte vše, jak nejlépe dovedete',
    description: 'Každý den je jiný. Vaše maximum taky. Dělejte vždy nejlépe - ale ne lépe.'
  },
  {
    title: 'Buďte skeptičtí, ale naslouchejte',
    description: 'Nevěřte všemu, co slyšíte. Ani tomu, co říkáte sami sobě. Učte se naslouchat.'
  },
]

const reasons = [
  {
    title: 'Naučíte se žít svobodněji',
    description: 'Přestanete se trápit tím, co si myslí druzí. Přestanete se hrabat v minulosti nebo stresovat budoucností. Prostě začnete žít tady a teď.'
  },
  {
    title: 'Dostanete konkrétní kroky',
    description: 'Žádná teorie o ideálních situacích. Získáte jasný postup a co dělat hned druhý den po workshopu. Pracujeme s reálnými příklady z Vašeho života.'
  },
  {
    title: 'Změníte vztahy',
    description: 'S partnerem, dětmi, rodiči nebo kolegy. Přestanete narážet na stejné konflikty pořád dokola. Když změníte to, jak komunikujete, změní se všechno ostatní.'
  },
  {
    title: 'Zažijete hluboké AHA momenty',
    description: 'Momenty, kdy Vám dojde, proč děláte to, co děláte. A pochopíte, jak to změnit. Abyste se konečně posunuli dál.'
  },
]

const companyBenefits = [
  'Lepší komunikaci v týmu bez konfliktů a nedorozumění',
  'Zdravější firemní kulturu postavenou na důvěře',
  'Zvýšenou produktivitu, snížení stresu a vyhoření',
  'Silnější týmová soudržnost a spolupráce',
]

const testimonials = [
  {
    name: 'Petra K.',
    role: 'Manažerka IT týmu',
    text: 'Workshop mi otevřel oči. Přestala jsem brát všechno osobně a náš tým začal fungovat úplně jinak. Konečně mám klid v hlavě.'
  },
  {
    name: 'Jan M.',
    role: 'Podnikatel',
    text: 'Čtyři dohody znám z knihy, ale teprve workshop mi ukázal, jak je aplikovat v praxi. Martin má skvělý způsob, jak věci vysvětlit bez zbytečné teorie.'
  },
  {
    name: 'Lucie S.',
    role: 'HR specialistka',
    text: 'Přišla jsem s partnerem a bylo to nejlepší rozhodnutí. Naše vztahy se posunuly na úplně jinou úroveň. Jsme za to moc vděční.'
  },
]

const faqs = [
  {
    question: 'Musím znát knihy Čtyři/Pátá dohoda, abych se mohl zúčastnit?',
    answer: 'Ne. Workshop je postavený tak, abyste se s dohody seznámili úplně od začátku. Pokud knihy znáte, o to lepší - půjdeme víc do hloubky.'
  },
  {
    question: 'Jak vypadá typický den na workshopu?',
    answer: 'Pracujeme od 9 do 17 hodin s přestávkami. Každá dohoda dostane prostor - vysvětlím ji, probereme konkrétní příklady a pak prakticky cvičíme. Žádné PowerPointy nebo frontální výuka.'
  },
  {
    question: 'Co mám vzít s sebou?',
    answer: 'Sebe. Otevřenou mysl. Poznámkový blok, pokud si rádi píšete poznámky. Občerstvení zajistíme.'
  },
  {
    question: 'Můžu přijít sám nebo je lepší v páru?',
    answer: 'Obojí funguje skvěle. Sám se víc soustředíte na sebe. V páru (partner, kamarád) můžete pak dohody cvičit spolu.'
  },
  {
    question: 'Co když mi termín nevyhovuje?',
    answer: 'Napište mi a domluvíme individuální termín nebo Vás zařadím do dalšího kola.'
  },
  {
    question: 'Nabízíte online verzi?',
    answer: 'Ne. Workshop je postavený na osobním kontaktu a energii skupiny. Online to prostě není ono.'
  },
  {
    question: 'Jak probíhá platba?',
    answer: 'Po registraci Vám přijde email s pokyny k platbě bankovním převodem. Platba je splatná do 7 dnů.'
  },
]

// Workshop Card Component
function WorkshopCard({ workshop, index, onRegister, registrationStatus, registrationMessage, registrationData }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate capacity color
  const fillPercentage = workshop.capacity ? (workshop.registrationCount / workshop.capacity) * 100 : 0
  const isFull = fillPercentage >= 100
  const spotsColor = isFull ? 'text-red-600' : fillPercentage > 50 ? 'text-yellow-600' : 'text-green-600'

  // Check if there are any detail fields to show
  const hasDetails = workshop.program || workshop.address || workshop.whatToBring || workshop.instructorInfo

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-8 shadow-lg border-2 border-gray-100 hover:border-primary-300 transition-all"
    >
      {/* Registration Success/Error Messages (no-JS fallback) */}
      {registrationStatus === 'success' && (
        <>
          {/* S JS: motion.div */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="js:flex hidden items-start gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-lg mb-6"
          >
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-green-900 mb-1">
                {registrationData ? '✅ Registrace proběhla úspěšně!' : '⏳ Jste na náhradnické listině!'}
              </p>
              <p className="text-green-800 mb-2">{registrationMessage}</p>
              {registrationData && (
                <div className="bg-white rounded p-3 border border-green-300 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Účet:</span>
                    <strong>{registrationData.account}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">VS:</span>
                    <strong className="text-base">{registrationData.vs}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Částka:</span>
                    <strong className="text-base">{parseInt(registrationData.price).toLocaleString('cs-CZ')} Kč</strong>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Platba splatná do 7 dnů</p>
                </div>
              )}
            </div>
          </motion.div>
          {/* Bez JS: normal div */}
          <div className="no-js:flex js:hidden items-start gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-lg mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-green-900 mb-1">
                {registrationData ? '✅ Registrace proběhla úspěšně!' : '⏳ Jste na náhradnické listině!'}
              </p>
              <p className="text-green-800 mb-2">{registrationMessage}</p>
              {registrationData && (
                <div className="bg-white rounded p-3 border border-green-300 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Účet:</span>
                    <strong>{registrationData.account}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">VS:</span>
                    <strong className="text-base">{registrationData.vs}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Částka:</span>
                    <strong className="text-base">{parseInt(registrationData.price).toLocaleString('cs-CZ')} Kč</strong>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Platba splatná do 7 dnů</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {registrationStatus === 'error' && (
        <>
          {/* S JS: motion.div */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="js:flex hidden items-start gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-6"
          >
            <div className="text-2xl mt-0.5">⚠️</div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-red-900 mb-1">Chyba při registraci</p>
              <p className="text-red-800">{registrationMessage}</p>
            </div>
          </motion.div>
          {/* Bez JS: normal div */}
          <div className="no-js:flex js:hidden items-start gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-6">
            <div className="text-2xl mt-0.5">⚠️</div>
            <div className="flex-1 text-sm">
              <p className="font-semibold text-red-900 mb-1">Chyba při registraci</p>
              <p className="text-red-800">{registrationMessage}</p>
            </div>
          </div>
        </>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          {workshop.name && (
            <h3 className="text-xl font-serif font-bold text-primary-700 mb-2">
              {workshop.name}
            </h3>
          )}
          <div className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-3">
            {workshop.location}
          </div>
          <div className="text-2xl font-serif font-bold text-gray-700 mb-2">
            {workshop.date}
          </div>
        </div>
        {workshop.spots !== null && (
          <div className="text-right">
            <span className="text-sm text-gray-500">Zbývá míst:</span>
            <div className={`text-3xl font-bold ${spotsColor}`}>
              {isFull ? 'Naplněno' : workshop.spots}
            </div>
            {/* Urgency badge */}
            {!isFull && workshop.spots <= 3 && workshop.spots > 0 && (
              <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full inline-block animate-pulse">
                Téměř plno!
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Cena:</span>
          <span className="text-xl font-bold text-gray-700">{workshop.price}</span>
        </div>
      </div>

      {hasDetails && (
        <>
          {/* S JS: button + AnimatePresence */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="js:flex hidden items-center justify-between w-full px-4 py-3 mb-4 text-primary-600 hover:text-primary-700 transition-colors border border-primary-200 rounded-lg hover:bg-primary-50"
          >
            <span className="font-semibold">Více informací</span>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Bez JS: details element */}
          <details className="no-js:block js:hidden mb-4 border border-primary-200 rounded-lg">
            <summary className="flex items-center justify-between w-full px-4 py-3 text-primary-600 hover:text-primary-700 cursor-pointer hover:bg-primary-50 rounded-lg">
              <span className="font-semibold">Více informací</span>
              <ChevronDown className="w-5 h-5" />
            </summary>
            <div className="space-y-4 px-4 pt-2 pb-4 border-t border-gray-200">
              {workshop.program && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Program</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line break-words">{workshop.program}</p>
                </div>
              )}
              {workshop.address && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Adresa</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line break-words">
                    {workshop.address.split('\n').map((line, i) => {
                      // Detekce URL v textu
                      const urlRegex = /(https?:\/\/[^\s]+)/g
                      const parts = line.split(urlRegex)

                      return (
                        <span key={i}>
                          {parts.map((part, j) => {
                            if (part.match(urlRegex)) {
                              return (
                                <a
                                  key={j}
                                  href={part}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700 underline"
                                >
                                  {part}
                                </a>
                              )
                            }
                            return <span key={j}>{part}</span>
                          })}
                          {i < workshop.address.split('\n').length - 1 && <br />}
                        </span>
                      )
                    })}
                  </p>
                </div>
              )}
              {workshop.whatToBring && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Co si vzít s sebou</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line break-words">{workshop.whatToBring}</p>
                </div>
              )}
              {workshop.instructorInfo && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Lektor</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line break-words">{workshop.instructorInfo}</p>
                </div>
              )}
            </div>
          </details>

          {/* S JS: AnimatePresence s motion.div */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mb-6 js:block hidden"
              >
                <div className="space-y-4 pt-2 pb-4 border-t border-gray-200">
                  {workshop.program && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Program</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-line break-words">{workshop.program}</p>
                    </div>
                  )}
                  {workshop.address && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Adresa</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-line break-words">
                        {workshop.address.split('\n').map((line, i) => {
                          const urlRegex = /(https?:\/\/[^\s]+)/g
                          const parts = line.split(urlRegex)
                          return (
                            <span key={i}>
                              {parts.map((part, j) => {
                                if (part.match(urlRegex)) {
                                  return (
                                    <a
                                      key={j}
                                      href={part}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-600 hover:text-primary-700 underline"
                                    >
                                      {part}
                                    </a>
                                  )
                                }
                                return <span key={j}>{part}</span>
                              })}
                              {i < workshop.address.split('\n').length - 1 && <br />}
                            </span>
                          )
                        })}
                      </p>
                    </div>
                  )}
                  {workshop.whatToBring && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Co si vzít s sebou</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-line break-words">{workshop.whatToBring}</p>
                    </div>
                  )}
                  {workshop.instructorInfo && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Lektor</h4>
                      <p className="text-gray-600 text-sm whitespace-pre-line break-words">{workshop.instructorInfo}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* S JS: button s modal */}
      <button
        onClick={() => onRegister(workshop)}
        disabled={isFull}
        className={`js:block hidden w-full px-6 py-3 rounded-lg font-semibold text-center transition-colors ${
          isFull
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {isFull ? 'Obsazeno' : 'Registrovat se'}
      </button>

      {/* Bez JS: inline registrační formulář */}
      <details className="no-js:block js:hidden border border-primary-300 rounded-lg">
        <summary className={`flex items-center justify-between w-full px-6 py-3 rounded-lg font-semibold text-center cursor-pointer ${
          isFull
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}>
          {isFull ? 'Obsazeno' : 'Registrovat se'}
        </summary>

        {!isFull && (
          <div className="p-6 bg-gray-50">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
              Registrace na workshop
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {workshop.date} • {workshop.location}
            </p>

            <form action="/api/register" method="POST" className="space-y-4">
              {/* Hidden fields */}
              <input type="hidden" name="workshopId" value={workshop.id} />
              <input type="hidden" name="workshopDate" value={workshop.date} />
              <input type="hidden" name="workshopLocation" value={workshop.location} />
              <input type="hidden" name="price" value={workshop.priceSingle} />

              {/* Typ registrace */}
              {workshop.priceCouple && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Počet účastníků *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500">
                      <input
                        type="radio"
                        name="registrationType"
                        value="single"
                        defaultChecked
                        className="mr-3"
                      />
                      <span className="flex-1">
                        <span className="font-semibold">1 osoba</span>
                        <span className="text-sm text-gray-600 ml-2">{workshop.price}</span>
                      </span>
                    </label>
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500">
                      <input
                        type="radio"
                        name="registrationType"
                        value="pair"
                        className="mr-3"
                      />
                      <span className="flex-1">
                        <span className="font-semibold">Pár (2 osoby)</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {workshop.priceCouple?.toLocaleString('cs-CZ')} Kč
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Hlavní účastník */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`firstName-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Jméno *
                  </label>
                  <input
                    type="text"
                    id={`firstName-${workshop.id}`}
                    name="firstName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor={`lastName-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Příjmení *
                  </label>
                  <input
                    type="text"
                    id={`lastName-${workshop.id}`}
                    name="lastName"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`email-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id={`email-${workshop.id}`}
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor={`phone-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon *
                </label>
                <input
                  type="tel"
                  id={`phone-${workshop.id}`}
                  name="phone"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor={`address-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Adresa *
                </label>
                <input
                  type="text"
                  id={`address-${workshop.id}`}
                  name="address"
                  required
                  placeholder="Ulice a číslo popisné"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`city-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    Město *
                  </label>
                  <input
                    type="text"
                    id={`city-${workshop.id}`}
                    name="city"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor={`zip-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                    PSČ *
                  </label>
                  <input
                    type="text"
                    id={`zip-${workshop.id}`}
                    name="zip"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`notes-${workshop.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Poznámka (nepovinné)
                </label>
                <textarea
                  id={`notes-${workshop.id}`}
                  name="notes"
                  rows={2}
                  placeholder="Máte nějaké speciální požadavky nebo otázky?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Honeypot */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  opacity: 0,
                }}
                aria-hidden="true"
              />

              <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                <p className="mb-1">
                  <strong>Ochrana osobních údajů:</strong> Odesláním formuláře souhlasíte se zpracováním osobních údajů pro účely registrace na workshop.
                </p>
                <p>
                  Provozovatel: Martin Fuks, IČ: 19755015
                </p>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-semibold"
              >
                Dokončit registraci
              </button>

              <p className="text-xs text-gray-500 text-center">
                Po odeslání ti přijde email s platebními údaji. Platba je splatná do 7 dnů.
              </p>
            </form>
          </div>
        )}
      </details>
    </motion.div>
  )
}

// Video Player Component with auto-play on scroll and YouTube-like controls
function VideoPlayer() {
  const videoRef = useRef(null)
  const progressBarRef = useRef(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Intersection Observer pro auto-play při scrollu
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch((error) => {
              console.log('Auto-play prevented:', error)
            })
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(video)

    // Event listeners pro video
    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100)
        setCurrentTime(video.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', updateProgress)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      observer.disconnect()
      video.removeEventListener('timeupdate', updateProgress)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  const togglePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const handleProgressBarClick = (e) => {
    const video = videoRef.current
    const progressBar = progressBarRef.current
    if (!video || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    video.currentTime = percentage * video.duration
  }

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-12"
    >
      <div
        className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 shadow-xl group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
          {/* S JS: custom video bez controls */}
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            className="js:block hidden w-full h-full object-cover cursor-pointer"
            aria-label="Ukázka z firemního workshopu Čtyři dohody pro agenturu (ant)"
            onError={(e) => console.error('Video load error:', e)}
            onClick={togglePlayPause}
          >
            <source src="https://www.martinfuks.cz/wp-content/uploads/2025/11/mf-only-logo.mp4" type="video/mp4" />
            Váš prohlížeč nepodporuje přehrávání videa.
          </video>

          {/* Bez JS: nativní video s controls */}
          <video
            controls
            loop
            muted
            playsInline
            className="no-js:block js:hidden w-full h-full object-cover"
            aria-label="Ukázka z firemního workshopu Čtyři dohody pro agenturu (ant)"
          >
            <source src="https://www.martinfuks.cz/wp-content/uploads/2025/11/mf-only-logo.mp4" type="video/mp4" />
            Váš prohlížeč nepodporuje přehrávání videa.
          </video>

          {/* Custom Video Controls - YouTube style (jen s JS) */}
          <div
            className={`js:block hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 transition-all duration-300 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {/* Progress Bar */}
            <div
              ref={progressBarRef}
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group/progress hover:h-1.5 transition-all"
              onClick={handleProgressBarClick}
            >
              <div
                className="h-full bg-primary-500 rounded-full relative transition-all"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between gap-4">
              {/* Left controls */}
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                  aria-label={isPlaying ? 'Pozastavit' : 'Přehrát'}
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                  aria-label={isMuted ? 'Zapnout zvuk' : 'Vypnout zvuk'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Time */}
                <div className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
                  aria-label="Celá obrazovka"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Center Play Button (when paused) */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
              onClick={togglePlayPause}
            >
              <div className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all transform hover:scale-110">
                <svg className="w-10 h-10 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
      </div>
    </motion.div>
  )
}
