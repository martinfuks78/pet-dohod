'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, Mail, Users, Calendar, MapPin, DollarSign, Loader2, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react'

export default function WorkshopDetail() {
  const params = useParams()
  const router = useRouter()
  const [workshop, setWorkshop] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [authToken, setAuthToken] = useState('')

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  })

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    const savedAuth = localStorage.getItem('admin_auth')

    if (savedAuth === 'true' && savedToken) {
      setAuthToken(savedToken)
    } else {
      router.push('/admin')
    }
  }, [router])

  useEffect(() => {
    if (authToken && params.id) {
      loadWorkshopDetail()
    }
  }, [authToken, params.id])

  const loadWorkshopDetail = async () => {
    try {
      // Load workshop
      const workshopRes = await fetch('/api/workshops')
      const workshopData = await workshopRes.json()
      const currentWorkshop = workshopData.workshops?.find(w => w.id === parseInt(params.id))

      if (!currentWorkshop) {
        router.push('/admin')
        return
      }

      setWorkshop(currentWorkshop)

      // Load registrations for this workshop
      const regRes = await fetch('/api/register', {
        headers: getAuthHeaders()
      })
      const regData = await regRes.json()
      const workshopRegs = regData.registrations?.filter(r =>
        r.workshop_date === currentWorkshop.date &&
        r.workshop_location === currentWorkshop.location
      ) || []

      setRegistrations(workshopRegs)
    } catch (error) {
      console.error('Error loading workshop detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (registrations.length === 0) return

    const csvData = registrations.map(reg => ({
      'Jméno': reg.first_name,
      'Příjmení': reg.last_name,
      'Email': reg.email,
      'Telefon': reg.phone,
      'Adresa': reg.address || '',
      'Město': reg.city || '',
      'PSČ': reg.zip || '',
      'Typ': reg.registration_type === 'pair' ? 'Pár' : '1 osoba',
      'Partner': reg.partner_first_name ? `${reg.partner_first_name} ${reg.partner_last_name}` : '',
      'Partner Email': reg.partner_email || '',
      'Cena': reg.price,
      'VS': reg.variable_symbol || reg.id,
      'Status': reg.status,
      'Poznámka': reg.notes || '',
      'Datum registrace': new Date(reg.created_at).toLocaleString('cs-CZ'),
    }))

    const headers = Object.keys(csvData[0]).join(',')
    const rows = csvData.map(row =>
      Object.values(row).map(val =>
        `"${String(val).replace(/"/g, '""')}"`
      ).join(',')
    )
    const csv = [headers, ...rows].join('\n')

    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `workshop-${workshop?.date}-${workshop?.location}.csv`
    link.click()
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'waitlist':
        return <AlertCircle className="w-4 h-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      waitlist: 'bg-orange-100 text-orange-800',
    }
    const labels = {
      pending: 'Čeká na platbu',
      confirmed: 'Potvrzeno',
      cancelled: 'Zrušeno',
      waitlist: 'Náhradník',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    )
  }

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    waitlist: registrations.filter(r => r.status === 'waitlist').length,
    revenue: registrations
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => {
        const price = parseInt(r.price.replace(/[^\d]/g, '')) || 0
        return sum + price
      }, 0),
    pendingRevenue: registrations
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => {
        const price = parseInt(r.price.replace(/[^\d]/g, '')) || 0
        return sum + price
      }, 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!workshop) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na admin
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                {workshop.name || 'Workshop'}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {workshop.date}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {workshop.location}
                </div>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={registrations.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Celkem registrací</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.confirmed}</div>
                <div className="text-sm text-gray-600">Potvrzených</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-sm text-gray-600">Čekajících</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.revenue.toLocaleString('cs-CZ')} Kč
                </div>
                <div className="text-sm text-gray-600">
                  Příjem (+{stats.pendingRevenue.toLocaleString('cs-CZ')} čeká)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registrations List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif font-bold text-gray-900">
              Registrace ({registrations.length})
            </h2>
          </div>

          {registrations.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Zatím žádné registrace
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Účastník
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontakt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cena
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      VS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reg.first_name} {reg.last_name}
                        </div>
                        {reg.partner_first_name && (
                          <div className="text-sm text-gray-500">
                            + {reg.partner_first_name} {reg.partner_last_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reg.email}</div>
                        <div className="text-sm text-gray-500">{reg.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.registration_type === 'pair' ? 'Pár' : '1 osoba'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reg.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reg.variable_symbol || reg.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(reg.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
