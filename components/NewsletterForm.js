'use client'

import { useState } from 'react'
import { Mail, Check } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Něco se pokazilo')
      }

      setStatus('success')
      setMessage(data.message)
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900/20 border border-green-700 rounded-lg p-3">
        <Check className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Váš email"
            required
            disabled={status === 'loading'}
            className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none text-sm disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 sm:py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? 'Odesílám...' : 'Odebírat'}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-red-400 text-xs">{message}</p>
      )}
      <p className="text-xs text-gray-500">
        Odesláním souhlasíte se zpracováním osobních údajů.{' '}
        <a href="/ochrana-osobnich-udaju" className="text-primary-400 hover:underline">
          Více info
        </a>
      </p>
    </form>
  )
}
