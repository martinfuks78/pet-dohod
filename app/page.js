'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Calendar, Users, Building2, CheckCircle2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Navigation from '../components/Navigation'
import RegistrationModal from '../components/RegistrationModal'
import ContactForm from '../components/ContactForm'
import StructuredData from '../components/StructuredData'

export default function Home() {
  const [selectedWorkshop, setSelectedWorkshop] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)

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

  // Load workshops from API
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        const response = await fetch('/api/workshops')
        const data = await response.json()

        if (data.success && data.workshops) {
          // Transform API data to match component format
          const formattedWorkshops = data.workshops.map(w => ({
            id: w.id,
            name: w.name,
            date: w.date,
            location: w.location,
            spots: w.capacity ? (w.capacity - (w.registrationCount || 0)) : null,
            capacity: w.capacity,
            registrationCount: w.registrationCount || 0,
            price: `${w.price_single.toLocaleString('cs-CZ')} Kč`,
            priceSingle: w.price_single,
            // Detail fields
            program: w.program,
            address: w.address,
            whatToBring: w.what_to_bring,
            instructorInfo: w.instructor_info
          }))
          console.log('🔍 Formatted workshops:', formattedWorkshops.map(w => ({ id: w.id, name: w.name, date: w.date })))
          setWorkshops(formattedWorkshops)
        }
      } catch (error) {
        console.error('Error loading workshops:', error)
      } finally {
        setLoading(false)
      }
    }

    loadWorkshops()
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
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-50 via-white to-sage-50 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/subtle-grid.svg')] opacity-5"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex items-center justify-center gap-8 lg:gap-16">
            {/* Levá kniha - Čtyři dohody */}
            <motion.div
              initial={{ opacity: 0, x: -50, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: -8 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden lg:block relative"
              style={{ transformOrigin: 'center right' }}
            >
              <div className="relative w-48 xl:w-56 transform hover:scale-105 transition-transform duration-300">
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 bg-primary-100 rounded-full text-primary-800 text-sm font-medium mb-8"
              >
                Workshop pro osobní svobodu
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                Pět dohod
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto">
                Nauč se žít bez zbytečných strachů a utrpení.
              </p>

              <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto">
                Workshopy založené na moudrosti knih Čtyři dohody a Pátá dohoda.
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
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200"
                >
                  Co jsou dohody?
                </Link>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-16 flex items-center justify-center gap-8 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>2 dny</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Malé skupiny</span>
                </div>
                <div className="flex items-center gap-2">
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
              className="hidden lg:block relative"
              style={{ transformOrigin: 'center left' }}
            >
              <div className="relative w-48 xl:w-56 transform hover:scale-105 transition-transform duration-300">
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
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
          </div>
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Co je Pět dohod?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Pět jednoduchých principů, které mění život.<br />
              Nejde o teorii - jde o to se naučit dohody žít a přestat zbytečně trpět.
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
              Přesně to dostaneš na workshopu.
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
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
                    <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Nadcházející termíny
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vyber si termín, který ti vyhovuje. Každý workshop je dvoudenní a probíhá v malých skupinách.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {loading ? (
              // Loading skeleton
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse"></div>
                ))}
              </>
            ) : workshops.length === 0 ? (
              // No workshops message
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-600">Momentálně nejsou k dispozici žádné termíny.</p>
                <p className="text-gray-500 mt-2">Sleduj tuto stránku nebo nás kontaktuj pro více informací.</p>
              </div>
            ) : (
              // Workshops list
              workshops.map((workshop, index) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  index={index}
                  onRegister={openRegistration}
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Firemní workshop nebo teambuilding
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Pět dohod pro zdravější a produktivnější pracovní prostředí? Vyzkoušejte netradiční teambuilding, kde se lidé baví osobním rozvojem.
            </p>
          </motion.div>

          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">
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
                <h3 className="text-2xl font-serif font-semibold text-gray-900 mb-6">
                  Jak to funguje
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                      <h4 className="font-semibold text-gray-900">Úvodní konzultace</h4>
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
                      <h4 className="font-semibold text-gray-900">Workshop nebo teambuilding</h4>
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
                      <h4 className="font-semibold text-gray-900">Follow-up</h4>
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
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
                    priority
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
              Co říkají účastníci
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Reálné příběhy lidí, kteří prošli workshopem Pět dohod
            </p>
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
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
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
              />
            </motion.div>
          </div>
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
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
            <h4 className="text-white font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm">
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
      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {index + 1}
        </div>
        <div>
          <h3 className="text-xl font-serif font-semibold text-gray-900">
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
    description: 'Slova mají sílu. Mohou tvořit nebo škodit. Naučte se vyjadřovat správně a přesně.'
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
    description: 'Nevěřte všemu, co slyšíte. Ani tomu, co říkáte sami sobě. Začněte naslouchat.'
  },
]

const reasons = [
  {
    title: 'Naučíš se žít svobodněji',
    description: 'Přestaneš se trápit tím, co si myslí druzí. Přestaneš se hrabat v minulosti nebo stresovat budoucností. Prostě začneš žít tady a teď.'
  },
  {
    title: 'Dostaneš konkrétní kroky',
    description: 'Žádná teorie naoko. Každá dohoda dostane jasný postup - co s ní dělat hned druhý den po workshopu. Pracujeme s reálnými příklady z tvého života.'
  },
  {
    title: 'Změníš vztahy',
    description: 'S partnerem, dětmi, rodiči, kolegy. Když změníš sebe, změní se i to, jak komunikuješ. A tím se změní všechno okolo.'
  },
  {
    title: 'Zažiješ AHA momenty',
    description: 'Ty momenty, kdy ti dojde, proč děláš to, co děláš. A jak to změnit. Aby ses konečně posunul dál.'
  },
]

// Workshops are now loaded dynamically from the database via API

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
    answer: 'Ne. Workshop je postavený tak, aby ses s dohody seznámil úplně od začátku. Pokud knihy znáš, o to lepší - půjdeme víc do hloubky.'
  },
  {
    question: 'Jak vypadá typický den na workshopu?',
    answer: 'Pracujeme od 9 do 17 hodin s přestávkami. Každá dohoda dostane prostor - vysvětlím ji, probereme konkrétní příklady a pak prakticky cvičíme. Žádné PowerPointy nebo frontální výuka.'
  },
  {
    question: 'Co mám vzít s sebou?',
    answer: 'Sebe. Otevřenou mysl. Poznámkový blok, pokud si rád píšeš poznámky. Občerstvení zajistíme.'
  },
  {
    question: 'Můžu přijít sám nebo je lepší v páru?',
    answer: 'Obojí funguje skvěle. Sám se víc soustředíš na sebe. V páru (partner, kamarád) můžete pak dohody cvičit spolu.'
  },
  {
    question: 'Co když mi termín nevyhovuje?',
    answer: 'Napiš mi a domluvíme individuální termín nebo tě zařadím do dalšího kola.'
  },
  {
    question: 'Nabízíš online verzi?',
    answer: 'Ne. Workshop je postavený na osobním kontaktu a energii skupiny. Online to prostě není ono.'
  },
  {
    question: 'Jak probíhá platba?',
    answer: 'Po registraci ti přijde email s pokyny k platbě bankovním převodem. Platba je splatná do 7 dnů.'
  },
]

// Workshop Card Component
function WorkshopCard({ workshop, index, onRegister }) {
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
          <div className="text-2xl font-serif font-bold text-gray-900 mb-2">
            {workshop.date}
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Zbývá míst:</span>
          <div className={`text-3xl font-bold ${spotsColor}`}>
            {isFull ? 'Naplněno' : workshop.spots}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Cena:</span>
          <span className="text-xl font-bold text-gray-900">{workshop.price}</span>
        </div>
      </div>

      {hasDetails && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full px-4 py-2 mb-4 text-primary-600 hover:text-primary-700 transition-colors border border-primary-200 rounded-lg hover:bg-primary-50"
        >
          <span className="font-semibold">Více informací</span>
          <ChevronDown
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            <div className="space-y-4 pt-2 pb-4 border-t border-gray-200">
              {workshop.program && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Program</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{workshop.program}</p>
                </div>
              )}
              {workshop.address && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Adresa</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">
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
                  <h4 className="font-semibold text-gray-900 mb-2">Co si vzít s sebou</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{workshop.whatToBring}</p>
                </div>
              )}
              {workshop.instructorInfo && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Lektor</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line">{workshop.instructorInfo}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => onRegister(workshop)}
        disabled={isFull}
        className={`block w-full px-6 py-3 rounded-lg font-semibold text-center transition-colors ${
          isFull
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary-500 text-white hover:bg-primary-600'
        }`}
      >
        {isFull ? 'Obsazeno' : 'Registrovat se'}
      </button>
    </motion.div>
  )
}
