'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, CheckCircle2, Clock, XCircle, AlertCircle, Calendar, MapPin, Mail, Phone, User, Users } from 'lucide-react'
import Link from 'next/link'

export default function MyRegistration() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [vs, setVs] = useState(searchParams.get('vs') || '')
  const [registration, setRegistration] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  // Auto-search když jsou parametry v URL
  useEffect(() => {
    if (email && vs && !searched) {
      handleSearch()
    }
  }, [email, vs, searched])

  const handleSearch = async () => {
    if (!email || !vs) {
      setError('Vyplň prosím email a variabilní symbol')
      return
    }

    setLoading(true)
    setError('')
    setRegistration(null)
    setSearched(true)

    try {
      const response = await fetch(`/api/registration-lookup?email=${encodeURIComponent(email)}&vs=${encodeURIComponent(vs)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registrace nebyla nalezena')
      }

      setRegistration(data.registration)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch()
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Čeká na platbu',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          description: 'Vaše registrace byla přijata. Platbu prosím proveďte do 7 dnů.'
        }
      case 'confirmed':
        return {
          icon: CheckCircle2,
          label: 'Potvrzeno',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Platba byla přijata. Těšíme se na Vás!'
        }
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Zrušeno',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          description: 'Registrace byla zrušena.'
        }
      case 'waitlist':
        return {
          icon: AlertCircle,
          label: 'Náhradnická listina',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          description: 'Workshop je plný. Jakmile se uvolní místo, ozveme se Vám.'
        }
      default:
        return {
          icon: Clock,
          label: status,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          description: ''
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Moje registrace
          </h1>
          <p className="text-xl text-primary-50">
            Zkontrolujte stav své registrace na workshop
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">
            Vyhledat registraci
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vas@email.cz"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="vs" className="block text-sm font-medium text-gray-700 mb-2">
                  Variabilní symbol *
                </label>
                <input
                  type="text"
                  id="vs"
                  value={vs}
                  onChange={(e) => setVs(e.target.value)}
                  placeholder="Např. 202601001"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                />
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Variabilní symbol najdete v potvrzovacím emailu, který jste obdrželi po registraci.
            </p>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Vyhledávám...' : 'Vyhledat registraci'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Registrace nebyla nalezena</h3>
              <p className="text-red-700 text-sm">
                {error}
              </p>
              <p className="text-red-600 text-sm mt-2">
                Zkontrolujte prosím, zda jste zadali správný email a variabilní symbol z potvrzovacího emailu.
              </p>
            </div>
          </motion.div>
        )}

        {/* Registration Details */}
        {registration && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className={`${getStatusInfo(registration.status).bgColor} border-2 ${getStatusInfo(registration.status).borderColor} rounded-xl p-8`}>
              <div className="flex items-start gap-4">
                {(() => {
                  const StatusIcon = getStatusInfo(registration.status).icon
                  return <StatusIcon className={`w-12 h-12 ${getStatusInfo(registration.status).color} flex-shrink-0`} />
                })()}
                <div className="flex-1">
                  <h3 className={`text-2xl font-serif font-bold ${getStatusInfo(registration.status).color} mb-2`}>
                    {getStatusInfo(registration.status).label}
                  </h3>
                  <p className="text-gray-700">
                    {getStatusInfo(registration.status).description}
                  </p>
                </div>
              </div>
            </div>

            {/* Workshop Details */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b-2 border-primary-200 pb-3">
                Detail workshopu
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Termín</div>
                    <div className="font-semibold text-gray-900">{registration.workshop_date}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Místo</div>
                    <div className="font-semibold text-gray-900">{registration.workshop_location}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b-2 border-primary-200 pb-3">
                Vaše údaje
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Jméno</div>
                    <div className="font-semibold text-gray-900">{registration.first_name} {registration.last_name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="font-semibold text-gray-900">{registration.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Telefon</div>
                    <div className="font-semibold text-gray-900">{registration.phone}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Typ registrace</div>
                    <div className="font-semibold text-gray-900">
                      {registration.registration_type === 'pair' ? 'Pár (2 osoby)' : '1 osoba'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner Info */}
              {registration.partner_first_name && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Partner</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Jméno</div>
                        <div className="font-semibold text-gray-900">
                          {registration.partner_first_name} {registration.partner_last_name}
                        </div>
                      </div>
                    </div>
                    {registration.partner_email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Email</div>
                          <div className="font-semibold text-gray-900">{registration.partner_email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Details (pouze pro pending/confirmed) */}
            {(registration.status === 'pending' || registration.status === 'confirmed') && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 border-b-2 border-primary-200 pb-3">
                  Platební údaje
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Variabilní symbol</span>
                    <span className="font-semibold text-gray-900 text-lg">{registration.variable_symbol || registration.id}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Částka</span>
                    <span className="font-semibold text-gray-900 text-lg">{registration.price} Kč</span>
                  </div>
                  {registration.status === 'pending' && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Důležité:</strong> Platbu prosím proveďte do 7 dnů od registrace. Platební údaje najdete také v potvrzovacím emailu.
                      </p>
                    </div>
                  )}
                  {registration.status === 'confirmed' && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        Vaše platba byla přijata. Týden před workshopem Vám pošleme detailní informace (přesnou adresu, program, co si vzít s sebou).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8">
              <h3 className="text-xl font-serif font-bold text-gray-900 mb-4">
                Máte dotazy?
              </h3>
              <p className="text-gray-700 mb-4">
                Pokud máte jakékoliv dotazy ohledně své registrace, neváhejte nás kontaktovat.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="mailto:kouc@martinfuks.cz"
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center font-semibold"
                >
                  Napište nám email
                </a>
                <Link
                  href="/"
                  className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-center font-semibold"
                >
                  Zpět na hlavní stránku
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
