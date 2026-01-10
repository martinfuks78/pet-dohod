'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, Mail, Phone, MapPin, Loader2, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Download } from 'lucide-react'

export default function AdminPage() {
  const [registrations, setRegistrations] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authToken, setAuthToken] = useState('') // Uložené heslo pro API requesty
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('registrations') // 'registrations' nebo 'workshops'
  const [editingWorkshop, setEditingWorkshop] = useState(null)
  const [isCreatingWorkshop, setIsCreatingWorkshop] = useState(false)

  // Nové stavy pro filtry a seskupení
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'confirmed', 'cancelled'
  const [expandedWorkshops, setExpandedWorkshops] = useState(new Set()) // Které workshopy jsou rozbalené

  // Helper funkce pro vytvoření auth headeru
  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  })

  // Pomocná funkce pro konverzi ISO timestamp na YYYY-MM-DD pro date picker
  const formatDateForInput = (isoDate) => {
    if (!isoDate) return ''
    try {
      const date = new Date(isoDate)
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }
  const [workshopForm, setWorkshopForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: '',
    priceSingle: '',
    type: 'public',
    // Detail fields
    program: '',
    address: '',
    whatToBring: '',
    instructorInfo: '',
    // Payment details
    bankAccount: '',
    variableSymbol: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()

    // Ověření hesla přes API endpoint
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (data.success) {
        setIsAuthenticated(true)
        setAuthToken(password) // Uložit heslo pro budoucí API requesty
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_token', password) // Uložit i do localStorage
        loadRegistrations()
        loadWorkshops()
      } else {
        alert('Špatné heslo')
      }
    } catch (error) {
      alert('Chyba při přihlašování')
    }
  }

  const loadRegistrations = async () => {
    try {
      const response = await fetch('/api/register', {
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        // API endpoint chybí nebo vrací chybu - tiše ignorujeme
        setRegistrations([])
        return
      }
      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (error) {
      // Registrace nejsou dostupné
      setRegistrations([])
    } finally {
      setLoading(false)
    }
  }

  const loadWorkshops = async () => {
    try {
      const response = await fetch('/api/workshops')
      if (!response.ok) {
        setWorkshops([])
        return
      }
      const data = await response.json()
      setWorkshops(data.workshops || [])
    } catch (error) {
      setWorkshops([])
    }
  }

  const handleCreateWorkshop = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/workshops', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(workshopForm),
      })

      if (response.ok) {
        await loadWorkshops()
        setIsCreatingWorkshop(false)
        setWorkshopForm({
          name: '',
          startDate: '',
          endDate: '',
          location: '',
          capacity: '',
          priceSingle: '',
          type: 'public',
          program: '',
          address: '',
          whatToBring: '',
          instructorInfo: '',
          bankAccount: '',
          variableSymbol: '',
        })
      } else {
        alert('Nepodařilo se vytvořit workshop')
      }
    } catch (error) {
      console.error('Error creating workshop:', error)
      alert('Chyba při vytváření workshopu')
    }
  }

  const handleUpdateWorkshop = async (workshop) => {
    try {
      // Převést prázdné stringy na null
      const cleanValue = (val) => (val === '' || val === undefined) ? null : val

      const response = await fetch('/api/workshops', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: workshop.id,
          name: cleanValue(workshop.name),
          location: workshop.location,
          capacity: cleanValue(workshop.capacity),
          priceSingle: Number(workshop.price_single),
          type: workshop.type || 'public',
          startDate: cleanValue(workshop.start_date),
          endDate: cleanValue(workshop.end_date),
          program: cleanValue(workshop.program),
          address: cleanValue(workshop.address),
          whatToBring: cleanValue(workshop.what_to_bring),
          instructorInfo: cleanValue(workshop.instructor_info),
          bankAccount: cleanValue(workshop.bank_account),
          variableSymbol: cleanValue(workshop.variable_symbol),
        }),
      })

      if (response.ok) {
        await loadWorkshops()
        setEditingWorkshop(null)
      } else {
        alert('Nepodařilo se aktualizovat workshop')
      }
    } catch (error) {
      console.error('Error updating workshop:', error)
      alert('Chyba při aktualizaci workshopu')
    }
  }

  const handleDeleteWorkshop = async (id) => {
    if (!confirm('Opravdu chceš smazat tento workshop?')) return

    try {
      const response = await fetch(`/api/workshops?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        await loadWorkshops()
      } else {
        alert('Nepodařilo se smazat workshop')
      }
    } catch (error) {
      console.error('Error deleting workshop:', error)
      alert('Chyba při mazání workshopu')
    }
  }

  // Nové funkce pro registrace
  const handleDeleteRegistration = async (id) => {
    if (!confirm('Opravdu chceš smazat tuto registraci?')) return

    try {
      const response = await fetch(`/api/register?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        await loadRegistrations()
      } else {
        alert('Nepodařilo se smazat registraci')
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
      alert('Chyba při mazání registrace')
    }
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (response.ok) {
        await loadRegistrations()
      } else {
        alert('Nepodařilo se aktualizovat status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Chyba při aktualizaci statusu')
    }
  }

  const handleExportCSV = () => {
    const filtered = getFilteredRegistrations()

    // Prepare CSV data
    const csvData = filtered.map(reg => ({
      'Jméno': reg.first_name,
      'Příjmení': reg.last_name,
      'Email': reg.email,
      'Telefon': reg.phone,
      'Adresa': reg.address || '',
      'Město': reg.city || '',
      'PSČ': reg.zip || '',
      'Workshop': reg.workshop_date,
      'Místo': reg.workshop_location,
      'Typ': reg.registration_type === 'pair' ? 'Pár' : '1 osoba',
      'Partner': reg.partner_first_name ? `${reg.partner_first_name} ${reg.partner_last_name}` : '',
      'Partner Email': reg.partner_email || '',
      'Cena': reg.price,
      'VS': reg.variable_symbol || reg.id,
      'Status': reg.status,
      'Poznámka': reg.notes || '',
      'Datum registrace': new Date(reg.created_at).toLocaleString('cs-CZ'),
    }))

    // Convert to CSV
    const headers = Object.keys(csvData[0]).join(',')
    const rows = csvData.map(row =>
      Object.values(row).map(val =>
        // Escape commas and quotes in values
        `"${String(val).replace(/"/g, '""')}"`
      ).join(',')
    )
    const csv = [headers, ...rows].join('\n')

    // Add BOM for Czech characters
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })

    // Download
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `registrace-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Toggle rozbalení workshopu
  const toggleWorkshop = (workshopKey) => {
    const newExpanded = new Set(expandedWorkshops)
    if (newExpanded.has(workshopKey)) {
      newExpanded.delete(workshopKey)
    } else {
      newExpanded.add(workshopKey)
    }
    setExpandedWorkshops(newExpanded)
  }

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth')
    const savedToken = localStorage.getItem('admin_token')
    if (savedAuth === 'true' && savedToken) {
      setIsAuthenticated(true)
      setAuthToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  // Načíst data když je authToken nastaven
  useEffect(() => {
    if (authToken && isAuthenticated) {
      loadRegistrations()
      loadWorkshops()
    }
  }, [authToken, isAuthenticated])

  // Pomocné funkce pro zpracování dat
  const getFilteredRegistrations = () => {
    if (statusFilter === 'all') return registrations
    return registrations.filter(r => r.status === statusFilter)
  }

  const getGroupedRegistrations = () => {
    const filtered = getFilteredRegistrations()
    const grouped = {}

    filtered.forEach(reg => {
      const key = `${reg.workshop_date}___${reg.workshop_location}`
      if (!grouped[key]) {
        grouped[key] = {
          date: reg.workshop_date,
          location: reg.workshop_location,
          registrations: []
        }
      }
      grouped[key].registrations.push(reg)
    })

    return grouped
  }

  const getTotalRevenue = () => {
    return getFilteredRegistrations()
      .filter(r => r.status === 'confirmed')
      .reduce((sum, reg) => {
        const price = parseInt(reg.price.replace(/[^\d]/g, '')) || 0
        return sum + price
      }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-earth-50 to-sage-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-6 text-center">
            Admin přístup
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Heslo
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                placeholder="Zadej admin heslo"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
            >
              Přihlásit se
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Správa registrací a workshopů Pět dohod
              </p>
            </div>
            <button
              onClick={() => {
                setIsAuthenticated(false)
                setAuthToken('')
                localStorage.removeItem('admin_auth')
                localStorage.removeItem('admin_token')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Odhlásit se
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('registrations')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'registrations'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrace
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'workshops'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Workshopy
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
                <div className="text-2xl font-bold text-gray-900">{registrations.length}</div>
                <div className="text-sm text-gray-600">Celkem registrací</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.status === 'confirmed').length}
                </div>
                <div className="text-sm text-gray-600">Potvrzených</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {registrations.filter(r => r.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">Čekajících na platbu</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {getTotalRevenue().toLocaleString('cs-CZ')} Kč
                </div>
                <div className="text-sm text-gray-600">Příjem (potvrzené)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Workshops Tab */}
        {activeTab === 'workshops' && (
          <div className="space-y-6">
            {/* Create Workshop Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setIsCreatingWorkshop(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Přidat workshop
              </button>
            </div>

            {/* Create Workshop Form */}
            {isCreatingWorkshop && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif font-bold text-gray-900">
                    Nový workshop
                  </h3>
                  <button
                    onClick={() => setIsCreatingWorkshop(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateWorkshop} className="space-y-4">
                  {/* Řádek 0: Název workshopu */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Název workshopu
                    </label>
                    <input
                      type="text"
                      value={workshopForm.name}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Například: Pět dohod - Základní workshop"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ponecháno prázdné = použije se standardní název "Workshop Pět dohod"</p>
                  </div>

                  {/* Řádek 1: Počátek a Konec workshopu */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Počátek workshopu (pro řazení) *
                      </label>
                      <input
                        type="date"
                        required
                        value={workshopForm.startDate}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, startDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Konec workshopu (pro datum rozsahu) *
                      </label>
                      <input
                        type="date"
                        required
                        value={workshopForm.endDate}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, endDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Řádek 2: Místo a Kapacita */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Místo *
                      </label>
                      <input
                        type="text"
                        required
                        value={workshopForm.location}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, location: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="Praha - Vinohrady"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kapacita
                      </label>
                      <input
                        type="number"
                        value={workshopForm.capacity}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, capacity: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="20 (nechej prázdné pro skrytí)"
                      />
                    </div>
                  </div>

                  {/* Řádek 3: Cena */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena *
                    </label>
                    <input
                      type="number"
                      required
                      value={workshopForm.priceSingle}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, priceSingle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="4800"
                    />
                  </div>

                  {/* Řádek 4: Program */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program
                    </label>
                    <textarea
                      rows="3"
                      value={workshopForm.program}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, program: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Popis programu pro den 1 a den 2..."
                    />
                  </div>

                  {/* Řádek 5: Přesná adresa vč. odkazu na Google Mapy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Přesná adresa vč. odkazu na Google Mapy
                    </label>
                    <textarea
                      rows="2"
                      value={workshopForm.address}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Přesná adresa místa konání..."
                    />
                  </div>

                  {/* Řádek 6: Co si vzít s sebou */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Co si vzít s sebou
                    </label>
                    <textarea
                      rows="2"
                      value={workshopForm.whatToBring}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, whatToBring: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Seznam věcí, které si mají účastníci vzít..."
                    />
                  </div>

                  {/* Řádek 7: Číslo účtu a Variabilní symbol */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Číslo účtu
                      </label>
                      <input
                        type="text"
                        value={workshopForm.bankAccount}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, bankAccount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="123456789/0100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variabilní symbol
                      </label>
                      <input
                        type="text"
                        value={workshopForm.variableSymbol}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, variableSymbol: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="202603"
                      />
                    </div>
                  </div>

                  {/* Tlačítka */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsCreatingWorkshop(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Zrušit
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      Vytvořit workshop
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Workshops List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-serif font-bold text-gray-900">
                  Všechny workshopy
                </h2>
              </div>

              {workshops.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  Zatím žádné workshopy
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Místo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Kapacita
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Registrace
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Cena (1 os.)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Akce
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {workshops.map((workshop) => (
                        <tr key={workshop.id} className="hover:bg-gray-50">
                          {editingWorkshop?.id === workshop.id ? (
                            <td colSpan="6" className="px-6 py-6 bg-gray-50">
                              <div className="bg-white rounded-lg p-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-semibold text-gray-900">Upravit workshop</h4>
                                  <button
                                    onClick={() => setEditingWorkshop(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                                    <input
                                      type="text"
                                      value={editingWorkshop.date}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, date: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Počátek (pro řazení)</label>
                                    <input
                                      type="date"
                                      value={formatDateForInput(editingWorkshop.start_date)}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, start_date: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Místo</label>
                                    <input
                                      type="text"
                                      value={editingWorkshop.location}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, location: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapacita</label>
                                    <input
                                      type="number"
                                      value={editingWorkshop.capacity || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, capacity: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cena (1 osoba)</label>
                                    <input
                                      type="number"
                                      value={editingWorkshop.price_single || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, price_single: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                                    <textarea
                                      rows="3"
                                      value={editingWorkshop.program || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, program: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresa</label>
                                    <textarea
                                      rows="2"
                                      value={editingWorkshop.address || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, address: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Co si vzít s sebou</label>
                                    <textarea
                                      rows="2"
                                      value={editingWorkshop.what_to_bring || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, what_to_bring: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Info o lektorovi</label>
                                    <textarea
                                      rows="2"
                                      value={editingWorkshop.instructor_info || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, instructor_info: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>

                                  <div className="md:col-span-2">
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2 mt-2">Platební údaje</h4>
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Konec workshopu</label>
                                    <input
                                      type="date"
                                      value={formatDateForInput(editingWorkshop.end_date)}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, end_date: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Číslo účtu</label>
                                    <input
                                      type="text"
                                      value={editingWorkshop.bank_account || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, bank_account: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="123456789/0100"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Variabilní symbol</label>
                                    <input
                                      type="text"
                                      value={editingWorkshop.variable_symbol || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, variable_symbol: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="202603"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Částka k úhradě</label>
                                    <input
                                      type="number"
                                      value={editingWorkshop.amount || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, amount: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="4800"
                                    />
                                  </div>

                                  <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                                    <button
                                      onClick={() => setEditingWorkshop(null)}
                                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      Zrušit
                                    </button>
                                    <button
                                      onClick={() => handleUpdateWorkshop(editingWorkshop)}
                                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                    >
                                      Uložit změny
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{workshop.date}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{workshop.location}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {workshop.capacity || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {(() => {
                                  const fillPercentage = workshop.capacity ? (workshop.registrationCount / workshop.capacity) * 100 : 0

                                  if (!workshop.capacity) {
                                    return (
                                      <div className="text-sm font-semibold text-gray-500">
                                        {workshop.registrationCount || 0}
                                      </div>
                                    )
                                  }

                                  if (fillPercentage >= 100) {
                                    return (
                                      <div className="text-sm font-semibold text-red-600">
                                        Naplněno
                                      </div>
                                    )
                                  }

                                  if (fillPercentage > 50) {
                                    return (
                                      <div className="text-sm font-semibold text-yellow-600">
                                        {workshop.registrationCount || 0} / {workshop.capacity}
                                      </div>
                                    )
                                  }

                                  return (
                                    <div className="text-sm font-semibold text-green-600">
                                      {workshop.registrationCount || 0} / {workshop.capacity}
                                    </div>
                                  )
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{workshop.price_single} Kč</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingWorkshop(workshop)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Upravit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWorkshop(workshop.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Smazat"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Registrations Tab */}
        {activeTab === 'registrations' && (
          <div className="space-y-6">
            {/* Filter bar */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Filtry</h3>
                  <p className="text-sm text-gray-600">
                    Zobrazeno: {getFilteredRegistrations().length} z {registrations.length} registrací
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Všechny
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'pending'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Čekající
                  </button>
                  <button
                    onClick={() => setStatusFilter('confirmed')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'confirmed'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Potvrzené
                  </button>
                  <button
                    onClick={() => setStatusFilter('cancelled')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'cancelled'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Zrušené
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={getFilteredRegistrations().length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Grouped Registrations */}
            {registrations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                Zatím žádné registrace
              </div>
            ) : (
              <>
                {Object.entries(getGroupedRegistrations()).map(([key, group]) => {
                  const isExpanded = expandedWorkshops.has(key)
                  const confirmedCount = group.registrations.filter(r => r.status === 'confirmed').length
                  const pendingCount = group.registrations.filter(r => r.status === 'pending').length
                  const cancelledCount = group.registrations.filter(r => r.status === 'cancelled').length

                  return (
                    <div key={key} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      {/* Workshop Header */}
                      <button
                        onClick={() => toggleWorkshop(key)}
                        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-900">{group.date}</h3>
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{group.location}</span>
                            </div>
                          </div>
                          <div className="flex gap-3 ml-8">
                            {confirmedCount > 0 && (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                {confirmedCount} potvrzených
                              </span>
                            )}
                            {pendingCount > 0 && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                                {pendingCount} čekajících
                              </span>
                            )}
                            {cancelledCount > 0 && (
                              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                                {cancelledCount} zrušených
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-bold text-gray-900">{group.registrations.length}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Registrations Table */}
                      {isExpanded && (
                        <div className="border-t border-gray-200">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Účastník
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Kontakt
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Typ
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Cena
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Datum registrace
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Akce
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {group.registrations.map((registration) => (
                                  <tr key={registration.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                      <div className="font-medium text-gray-900">
                                        {registration.first_name} {registration.last_name}
                                      </div>
                                      {registration.registration_type === 'pair' && registration.partner_first_name && (
                                        <div className="text-sm text-gray-500">
                                          + {registration.partner_first_name} {registration.partner_last_name}
                                        </div>
                                      )}
                                      {registration.notes && (
                                        <div className="text-sm text-gray-600 mt-1 italic">
                                          💬 {registration.notes}
                                        </div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-col gap-1 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Mail className="w-4 h-4" />
                                          <a href={`mailto:${registration.email}`} className="hover:text-primary-600">
                                            {registration.email}
                                          </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Phone className="w-4 h-4" />
                                          <a href={`tel:${registration.phone}`} className="hover:text-primary-600">
                                            {registration.phone}
                                          </a>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm text-gray-900">
                                        {registration.registration_type === 'pair' ? 'Pár' : '1 osoba'}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="text-sm font-semibold text-gray-900">
                                        {registration.price}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <select
                                        value={registration.status}
                                        onChange={(e) => handleUpdateStatus(registration.id, e.target.value)}
                                        className={`text-xs font-semibold rounded-lg px-3 py-1.5 border-2 cursor-pointer transition-colors ${
                                          registration.status === 'confirmed'
                                            ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                                            : registration.status === 'pending'
                                            ? 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                                            : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                                        }`}
                                      >
                                        <option value="pending">Čeká na platbu</option>
                                        <option value="confirmed">Potvrzeno</option>
                                        <option value="cancelled">Zrušeno</option>
                                      </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {new Date(registration.created_at).toLocaleDateString('cs-CZ', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <button
                                        onClick={() => handleDeleteRegistration(registration.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Smazat"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
