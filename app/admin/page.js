'use client'

import { useEffect, useState } from 'react'
import { Users, Calendar, Mail, Phone, MapPin, Loader2, Plus, Edit2, Trash2, Save, X } from 'lucide-react'

export default function AdminPage() {
  const [registrations, setRegistrations] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('registrations') // 'registrations' nebo 'workshops'
  const [editingWorkshop, setEditingWorkshop] = useState(null)
  const [isCreatingWorkshop, setIsCreatingWorkshop] = useState(false)
  const [workshopForm, setWorkshopForm] = useState({
    date: '',
    startDate: '',
    location: '',
    capacity: '',
    priceSingle: '',
    type: 'public',
    // Detail fields
    program: '',
    address: '',
    whatToBring: '',
    instructorInfo: '',
  })

  // Jednoduché heslo (později nahradíme NextAuth)
  const ADMIN_PASSWORD = 'pet-dohod-2026'

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem('admin_auth', 'true')
      loadRegistrations()
    } else {
      alert('Špatné heslo')
    }
  }

  const loadRegistrations = async () => {
    try {
      const response = await fetch('/api/register')
      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (error) {
      console.error('Chyba při načítání registrací:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWorkshops = async () => {
    try {
      const response = await fetch('/api/workshops')
      const data = await response.json()
      setWorkshops(data.workshops || [])
    } catch (error) {
      console.error('Chyba při načítání workshopů:', error)
    }
  }

  const handleCreateWorkshop = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workshopForm),
      })

      if (response.ok) {
        await loadWorkshops()
        setIsCreatingWorkshop(false)
        setWorkshopForm({
          date: '',
          startDate: '',
          location: '',
          capacity: '',
          priceSingle: '',
          type: 'public',
          program: '',
          address: '',
          whatToBring: '',
          instructorInfo: '',
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
      const response = await fetch('/api/workshops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workshop.id,
          date: workshop.date,
          location: workshop.location,
          capacity: workshop.capacity || null,
          priceSingle: workshop.price_single,
          type: workshop.type,
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

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      loadRegistrations()
      loadWorkshops()
    } else {
      setLoading(false)
    }
  }, [])

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
                localStorage.removeItem('admin_auth')
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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

                <form onSubmit={handleCreateWorkshop} className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Datum *
                    </label>
                    <input
                      type="text"
                      required
                      value={workshopForm.date}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="15.-16. března 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Počátek workshopu (pro řazení)
                    </label>
                    <input
                      type="date"
                      value={workshopForm.startDate}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                    />
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cena (1 osoba) *
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

                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresa
                    </label>
                    <textarea
                      rows="2"
                      value={workshopForm.address}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Přesná adresa místa konání..."
                    />
                  </div>

                  <div className="md:col-span-2">
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

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Info o lektorovi
                    </label>
                    <textarea
                      rows="2"
                      value={workshopForm.instructorInfo}
                      onChange={(e) => setWorkshopForm({ ...workshopForm, instructorInfo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="Krátké info o lektorovi..."
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3">
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
                            <>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={editingWorkshop.date}
                                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, date: e.target.value })}
                                  className="w-full px-3 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="text"
                                  value={editingWorkshop.location}
                                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, location: e.target.value })}
                                  className="w-full px-3 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  value={editingWorkshop.capacity || ''}
                                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, capacity: e.target.value })}
                                  className="w-20 px-3 py-1 border border-gray-300 rounded"
                                  placeholder="20"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {workshop.registrationCount || 0}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  value={editingWorkshop.price_single}
                                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, price_single: e.target.value })}
                                  className="w-24 px-3 py-1 border border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateWorkshop(editingWorkshop)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Uložit"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingWorkshop(null)}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    title="Zrušit"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
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
          <>
        {/* Registrations Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-serif font-bold text-gray-900">
              Všechny registrace
            </h2>
          </div>

          {registrations.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              Zatím žádné registrace
            </div>
          ) : (
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
                      Workshop
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {registration.first_name} {registration.last_name}
                        </div>
                        {registration.registration_type === 'pair' && registration.partner_first_name && (
                          <div className="text-sm text-gray-500">
                            + {registration.partner_first_name} {registration.partner_last_name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4" />
                            {registration.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            {registration.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{registration.workshop_date}</div>
                          <div className="text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {registration.workshop_location}
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
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            registration.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : registration.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {registration.status === 'confirmed'
                            ? 'Potvrzeno'
                            : registration.status === 'pending'
                            ? 'Čeká na platbu'
                            : 'Zrušeno'}
                        </span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  )
}
