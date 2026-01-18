'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function SentryTestPage() {
  const [status, setStatus] = useState('')

  const handleClientError = () => {
    setStatus('Odesílám client-side error do Sentry...')
    try {
      // Vyvolat chybu
      throw new Error('🧪 Sentry Client Test Error - Testovací chyba z klienta!')
    } catch (error) {
      Sentry.captureException(error)
      setStatus('✅ Client-side error odeslán! Zkontroluj Sentry dashboard.')
    }
  }

  const handleServerError = async () => {
    setStatus('Odesílám server-side error do Sentry...')
    try {
      const response = await fetch('/api/sentry-test-error')
      const data = await response.json()
      setStatus(data.message || '✅ Server-side error odeslán! Zkontroluj Sentry dashboard.')
    } catch (error) {
      setStatus('❌ Chyba při volání API: ' + error.message)
    }
  }

  const handleUndefinedFunction = () => {
    setStatus('Volám neexistující funkci...')
    // @ts-ignore - záměrně vyvolat chybu
    myUndefinedFunction()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Sentry Test Page
          </h1>
          <p className="text-gray-600">
            Testování Sentry error trackingu pro projekt pet-dohod
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <button
            onClick={handleClientError}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Test Client-Side Error
          </button>

          <button
            onClick={handleServerError}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Test Server-Side Error
          </button>

          <button
            onClick={handleUndefinedFunction}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Test Undefined Function
          </button>
        </div>

        {status && (
          <div className={`p-4 rounded-lg ${
            status.startsWith('✅') ? 'bg-green-100 text-green-800' :
            status.startsWith('❌') ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <p className="font-medium">{status}</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-semibold text-gray-900 mb-2">📋 Instrukce:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Klikni na jedno z tlačítek výše</li>
            <li>Otevři Sentry dashboard: <a href="https://sentry.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">sentry.io</a></li>
            <li>Jdi do sekce "Issues"</li>
            <li>Do 30 sekund by se měla objevit nová chyba</li>
            <li>Pokud vidíš chybu v Sentry, integrace funguje! ✅</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/admin"
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Zpět do Adminu
          </a>
        </div>
      </div>
    </div>
  )
}
