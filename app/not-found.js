'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-earth-50 via-white to-sage-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Number */}
          <h1 className="text-9xl font-serif font-bold text-primary-500 mb-4">
            404
          </h1>

          {/* Main message */}
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Stránka nenalezena
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Omlouváme se, ale stránku, kterou hledáš, jsme nenašli.
            Možná byla přesunuta nebo už neexistuje.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
            >
              <Home className="w-5 h-5" />
              Zpět na hlavní stránku
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold border-2 border-gray-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Zpět
            </button>
          </div>

          {/* Helpful links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">Možná hledáš:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/#terminy"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Termíny workshopů
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/#dohody"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Co jsou dohody
              </Link>
              <span className="text-gray-300">•</span>
              <Link
                href="/#kontakt"
                className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
              >
                Kontakt
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
