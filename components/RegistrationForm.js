'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function RegistrationForm({ workshop }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    registrationType: 'single',
    partnerFirstName: '',
    partnerLastName: '',
    partnerEmail: '',
    notes: '',
    website: '', // Honeypot pole (skryté pro uživatele, viditelné pro boty)
  })

  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('')
  const [paymentData, setPaymentData] = useState(null)
  const [isWaitlist, setIsWaitlist] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')

    // Vypočítat cenu podle typu registrace
    const price = formData.registrationType === 'pair' ? workshop.priceCouple : workshop.priceSingle

    const payload = {
      ...formData,
      workshopId: workshop.id,
      workshopDate: workshop.date,
      workshopLocation: workshop.location,
      price: price,
    }

    console.log('📤 Sending registration payload:', payload)

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Něco se pokazilo')
      }

      // Uložit platební údaje pro zobrazení
      setPaymentData(data.paymentDetails)
      setIsWaitlist(data.isWaitlist || false)
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error.message)
    }
  }

  if (status === 'success') {
    if (isWaitlist) {
      // Waitlist success message
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8"
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 rounded-full">
            <span className="text-4xl">⏳</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 text-center">
            Jste na náhradnické listině!
          </h3>
          <p className="text-gray-700 mb-4 text-center">
            Workshop je momentálně plný, ale zaregistrovali jsme Vás jako náhradníka.
          </p>
          <p className="text-gray-700 mb-6 text-center">
            Na email <strong>{formData.email}</strong> jsme odeslali potvrzení. Pokud se uvolní místo, ozveme se Vám s platebními údaji.
          </p>
          <p className="text-gray-600 text-sm text-center">
            Děkujeme za Váš zájem a držíme palce! 🤞
          </p>
        </motion.div>
      )
    }

    // Regular success message
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 border-2 border-green-200 rounded-xl p-8"
      >
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3 text-center">
          Registrace proběhla úspěšně!
        </h3>
        <p className="text-gray-700 mb-6 text-center">
          Na email <strong>{formData.email}</strong> jsme odeslali potvrzení.
        </p>

        {paymentData && (
          <div className="bg-white rounded-lg p-6 mb-6 border-2 border-green-300">
            <h4 className="font-semibold text-gray-900 mb-4 text-lg">💳 Detaily k platbě</h4>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Číslo účtu:</span>
                <strong className="text-gray-900">{paymentData.bankAccount}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Variabilní symbol:</span>
                <strong className="text-gray-900 text-xl">{paymentData.variableSymbol}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Částka:</span>
                <strong className="text-gray-900 text-xl">{paymentData.amount} Kč</strong>
              </div>
            </div>

            {paymentData.qrCodeUrl && (
              <div className="text-center border-t pt-4">
                <p className="text-sm text-gray-600 mb-3">Naskenuj QR kód k platbě:</p>
                <img
                  src={paymentData.qrCodeUrl}
                  alt="QR kód pro platbu"
                  className="mx-auto rounded-lg border-2 border-gray-200 w-full max-w-xs"
                />
              </div>
            )}
          </div>
        )}

        <p className="text-gray-600 text-sm text-center">
          Platba je splatná do 7 dnů. Těšíme se na Vás!
        </p>
      </motion.div>
    )
  }

  // Vypočítat zobrazenou cenu
  const displayPrice = formData.registrationType === 'pair'
    ? `${workshop.priceCouple?.toLocaleString('cs-CZ')} Kč`
    : workshop.price

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Typ registrace - zobrazit jen když je k dispozici cena pro páry */}
      {workshop.priceCouple && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Počet účastníků *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`
              relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
              ${formData.registrationType === 'single'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-white hover:border-gray-400'}
            `}>
              <input
                type="radio"
                name="registrationType"
                value="single"
                checked={formData.registrationType === 'single'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <div className="font-semibold text-gray-900">1 osoba</div>
                <div className="text-sm text-gray-600 mt-1">{workshop.price}</div>
              </div>
            </label>

            <label className={`
              relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all
              ${formData.registrationType === 'pair'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-white hover:border-gray-400'}
            `}>
              <input
                type="radio"
                name="registrationType"
                value="pair"
                checked={formData.registrationType === 'pair'}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-center">
                <div className="font-semibold text-gray-900">Pár (2 osoby)</div>
                <div className="text-sm text-gray-600 mt-1">
                  {workshop.priceCouple.toLocaleString('cs-CZ')} Kč
                </div>
                {workshop.priceSingle && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Úspora {((workshop.priceSingle * 2) - workshop.priceCouple).toLocaleString('cs-CZ')} Kč
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Cena celkem - zobrazit jen když je možnost výběru */}
      {workshop.priceCouple && (
        <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 text-center">
          <div className="text-sm text-gray-600 mb-1">Cena celkem</div>
          <div className="text-3xl font-bold text-primary-700">{displayPrice}</div>
          <div className="text-sm text-gray-600 mt-2">
            {formData.registrationType === 'pair' ? 'za pár' : 'na osobu'}
          </div>
        </div>
      )}

      {/* Hlavní účastník */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          {formData.registrationType === 'pair' ? 'První účastník' : 'Vaše údaje'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Jméno *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Příjmení *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Telefon *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            autoComplete="tel"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Adresa *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            autoComplete="street-address"
            required
            value={formData.address}
            onChange={handleChange}
            placeholder="Ulice a číslo popisné"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
              Město *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              autoComplete="address-level2"
              required
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
              PSČ *
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              autoComplete="postal-code"
              required
              value={formData.zip}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Partner údaje (jen pro páry) */}
      {formData.registrationType === 'pair' && (
        <div className="space-y-4 bg-blue-50 p-4 sm:p-6 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold text-gray-900">Druhý účastník (partner)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="partnerFirstName" className="block text-sm font-medium text-gray-700 mb-1">
                Jméno *
              </label>
              <input
                type="text"
                id="partnerFirstName"
                name="partnerFirstName"
                required
                value={formData.partnerFirstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="partnerLastName" className="block text-sm font-medium text-gray-700 mb-1">
                Příjmení *
              </label>
              <input
                type="text"
                id="partnerLastName"
                name="partnerLastName"
                required
                value={formData.partnerLastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="partnerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="partnerEmail"
              name="partnerEmail"
              value={formData.partnerEmail}
              onChange={handleChange}
              placeholder="email@example.com (nepovinné)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Pokud vyplníte, partner dostane také potvrzovací email
            </p>
          </div>
        </div>
      )}

      {/* Poznámka */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Poznámka (nepovinné)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Máte nějaké speciální požadavky nebo otázky?"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none resize-none"
        />
      </div>

      {/* Honeypot pole - skryté pro uživatele, viditelné pro boty */}
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={handleChange}
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

      {/* Error message */}
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            {errorMessage}
          </div>
        </div>
      )}

      {/* GDPR info */}
      <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
        <p className="mb-2">
          <strong>Ochrana osobních údajů:</strong> Odesláním formuláře souhlasíte se zpracováním osobních údajů
          pro účely registrace na workshop a komunikace s Vámi. Vaše údaje budou zpracovány v souladu s GDPR
          a využity pouze pro účely související s workshopem.
        </p>
        <p className="text-xs">
          Provozovatel: Martin Fuks, IČ: 19755015 •
          Více informací o zpracování osobních údajů najdete v{' '}
          <a href="/ochrana-osobnich-udaju" className="text-primary-600 hover:underline">
            dokumentu o ochraně osobních údajů
          </a>.
        </p>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Odesílám...
          </>
        ) : (
          'Dokončit registraci'
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Po odeslání ti přijde email s platebními údaji. Platba je splatná do 7 dnů.
        <br />
        Přečti si{' '}
        <a href="/stornovaci-podminky" target="_blank" className="text-primary-600 hover:underline">
          stornovací podmínky
        </a>.
      </p>
    </form>
  )
}
