'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Calendar, Mail, Phone, MapPin, Loader2, Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Download, Eye, Send, MoreVertical, StickyNote, Tag } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function AdminPage() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState([])
  const [workshops, setWorkshops] = useState([])
  const [newsletter, setNewsletter] = useState([])
  const [emailTemplates, setEmailTemplates] = useState([])
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [workshopTemplates, setWorkshopTemplates] = useState([])
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [editingNotes, setEditingNotes] = useState(null) // Registrace s editovanými poznámkami (celý objekt)
  const [notesFormData, setNotesFormData] = useState({ notes: '', tags: '' })
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [authToken, setAuthToken] = useState('') // Uložené heslo pro API requesty
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('registrations') // 'registrations', 'workshops' nebo 'newsletter'
  const [editingWorkshop, setEditingWorkshop] = useState(null)
  const [isCreatingWorkshop, setIsCreatingWorkshop] = useState(false)

  // Nové stavy pro filtry a seskupení
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'pending', 'confirmed', 'cancelled'
  const [expandedWorkshops, setExpandedWorkshops] = useState(new Set()) // Které workshopy jsou rozbalené
  const [workshopTimeFilter, setWorkshopTimeFilter] = useState('upcoming') // 'upcoming', 'past', 'all'
  const [selectedRegistrations, setSelectedRegistrations] = useState(new Set()) // Vybrané registrace pro bulk akce
  const [openActionMenus, setOpenActionMenus] = useState(new Set()) // Otevřené dropdown menu pro akce
  const [showQuickActions, setShowQuickActions] = useState(false) // Zobrazení quick actions menu
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false) // Zobrazení nápovědy klávesových zkratek

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
    priceCouple: '',
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

  const loadNewsletter = async () => {
    try {
      const response = await fetch('/api/newsletter/subscribers', {
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        setNewsletter([])
        return
      }
      const data = await response.json()
      setNewsletter(data.subscribers || [])
    } catch (error) {
      setNewsletter([])
    }
  }

  const loadEmailTemplates = async () => {
    try {
      const response = await fetch('/api/email-templates', {
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        setEmailTemplates([])
        return
      }
      const data = await response.json()
      setEmailTemplates(data.templates || [])
    } catch (error) {
      setEmailTemplates([])
    }
  }

  const loadWorkshopTemplates = async () => {
    try {
      const response = await fetch('/api/workshop-templates', {
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        setWorkshopTemplates([])
        return
      }
      const data = await response.json()
      setWorkshopTemplates(data.templates || [])
    } catch (error) {
      setWorkshopTemplates([])
    }
  }

  const loadAuditLogs = async () => {
    try {
      const response = await fetch('/api/audit-log?limit=50', {
        headers: getAuthHeaders()
      })
      if (!response.ok) {
        setAuditLogs([])
        return
      }
      const data = await response.json()
      setAuditLogs(data.logs || [])
    } catch (error) {
      setAuditLogs([])
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
          priceCouple: '',
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

  const handleUseTemplate = (template) => {
    setWorkshopForm({
      name: template.name || '',
      startDate: '',
      endDate: '',
      location: template.location || '',
      capacity: template.capacity || '',
      priceSingle: template.price_single || '',
      priceCouple: template.price_couple || '',
      type: template.type || 'public',
      program: template.program || '',
      address: template.address || '',
      whatToBring: template.what_to_bring || '',
      instructorInfo: template.instructor_info || '',
      bankAccount: template.bank_account || '',
      variableSymbol: template.variable_symbol || '',
    })
    setShowTemplateSelector(false)
    setIsCreatingWorkshop(true)
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
          priceCouple: workshop.price_couple ? Number(workshop.price_couple) : null,
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

  const handleOpenNotes = (registration) => {
    setEditingNotes(registration)
    setNotesFormData({
      notes: registration.notes || '',
      tags: registration.tags || ''
    })
  }

  const handleUpdateNotes = async (e) => {
    e.preventDefault()
    if (!editingNotes) return

    try {
      const response = await fetch('/api/register', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: editingNotes.id,
          notes: notesFormData.notes,
          tags: notesFormData.tags
        }),
      })

      if (response.ok) {
        await loadRegistrations()
        setEditingNotes(null)
        setNotesFormData({ notes: '', tags: '' })
      } else {
        alert('Nepodařilo se aktualizovat poznámky')
      }
    } catch (error) {
      console.error('Error updating notes:', error)
      alert('Chyba při aktualizaci poznámek')
    }
  }

  const handleDeleteNewsletterSubscriber = async (id) => {
    if (!confirm('Opravdu chceš odstranit tohoto odběratele?')) return

    try {
      const response = await fetch(`/api/newsletter/subscribers?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      if (response.ok) {
        await loadNewsletter()
      } else {
        alert('Nepodařilo se odstranit odběratele')
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
      alert('Chyba při mazání odběratele')
    }
  }

  const handleExportNewsletterCSV = () => {
    if (newsletter.length === 0) return

    // Prepare CSV data
    const csvData = newsletter.map(sub => ({
      'Email': sub.email,
      'Datum přihlášení': new Date(sub.subscribed_at).toLocaleString('cs-CZ'),
      'Aktivní': sub.is_active ? 'Ano' : 'Ne'
    }))

    // Convert to CSV
    const headers = Object.keys(csvData[0]).join(',')
    const rows = csvData.map(row =>
      Object.values(row).map(val =>
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
    link.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Bulk actions
  const toggleRegistrationSelection = (id) => {
    const newSelected = new Set(selectedRegistrations)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRegistrations(newSelected)
  }

  const selectAllRegistrations = () => {
    const allIds = getFilteredRegistrations().map(r => r.id)
    setSelectedRegistrations(new Set(allIds))
  }

  const deselectAllRegistrations = () => {
    setSelectedRegistrations(new Set())
  }

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedRegistrations.size === 0) return
    if (!confirm(`Opravdu chceš změnit status ${selectedRegistrations.size} registrací na "${newStatus}"?`)) return

    try {
      const promises = Array.from(selectedRegistrations).map(id =>
        fetch('/api/register', {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ id, status: newStatus }),
        })
      )

      await Promise.all(promises)
      await loadRegistrations()
      setSelectedRegistrations(new Set())
    } catch (error) {
      console.error('Bulk status change error:', error)
      alert('Chyba při hromadné změně statusu')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRegistrations.size === 0) return
    if (!confirm(`Opravdu chceš smazat ${selectedRegistrations.size} registrací? Tato akce je nevratná!`)) return

    try {
      const promises = Array.from(selectedRegistrations).map(id =>
        fetch(`/api/register?id=${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders(),
        })
      )

      await Promise.all(promises)
      await loadRegistrations()
      setSelectedRegistrations(new Set())
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Chyba při hromadném mazání')
    }
  }

  const handleResendEmail = async (registrationId, emailType) => {
    const typeLabels = {
      confirmation: 'potvrzovací email',
      payment: 'email o platbě'
    }

    if (!confirm(`Opravdu chceš znovu odeslat ${typeLabels[emailType]}?`)) return

    try {
      const response = await fetch('/api/resend-email', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ registrationId, emailType }),
      })

      if (response.ok) {
        alert('Email byl úspěšně odeslán')
      } else {
        const data = await response.json()
        alert(data.error || 'Nepodařilo se odeslat email')
      }
    } catch (error) {
      console.error('Resend email error:', error)
      alert('Chyba při odesílání emailu')
    }
  }

  const toggleActionMenu = (registrationId) => {
    const newOpenMenus = new Set(openActionMenus)
    if (newOpenMenus.has(registrationId)) {
      newOpenMenus.delete(registrationId)
    } else {
      newOpenMenus.add(registrationId)
    }
    setOpenActionMenus(newOpenMenus)
  }

  const handleUpdateTemplate = async (templateId, subject, htmlBody) => {
    try {
      const response = await fetch('/api/email-templates', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: templateId,
          subject,
          html_body: htmlBody,
        }),
      })

      if (response.ok) {
        alert('Šablona byla úspěšně uložena')
        await loadEmailTemplates()
        setEditingTemplate(null)
      } else {
        const data = await response.json()
        alert(data.error || 'Nepodařilo se uložit šablonu')
      }
    } catch (error) {
      console.error('Template update error:', error)
      alert('Chyba při ukládání šablony')
    }
  }

  const handleSaveTemplate = (e) => {
    e.preventDefault()
    if (!editingTemplate) return

    const formData = new FormData(e.target)
    const subject = formData.get('subject')
    const htmlBody = formData.get('html_body')

    handleUpdateTemplate(editingTemplate.id, subject, htmlBody)
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
      loadNewsletter()
      loadEmailTemplates()
      loadWorkshopTemplates()
      loadAuditLogs()
    }
  }, [authToken, isAuthenticated])

  // Zavřít dropdown menu při kliknutí mimo
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openActionMenus.size > 0 && !event.target.closest('.relative')) {
        setOpenActionMenus(new Set())
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openActionMenus])

  // Klávesové zkratky
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Ignorovat pokud je uživatel v input poli
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      // Ctrl/Cmd + K = Otevřít/zavřít quick actions
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowQuickActions(prev => !prev)
      }

      // ? = Zobrazit nápovědu
      if (e.key === '?' && !e.shiftKey) {
        e.preventDefault()
        setShowKeyboardHelp(prev => !prev)
      }

      // Escape = Zavřít všechny modaly
      if (e.key === 'Escape') {
        setShowQuickActions(false)
        setShowKeyboardHelp(false)
        setEditingTemplate(null)
        setIsCreatingWorkshop(false)
      }

      // Tab přepínání (1-6)
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === '1') setActiveTab('registrations')
        if (e.key === '2') setActiveTab('statistics')
        if (e.key === '3') setActiveTab('workshops')
        if (e.key === '4') setActiveTab('newsletter')
        if (e.key === '5') setActiveTab('email-templates')
        if (e.key === '6') setActiveTab('audit-log')
      }

      // Ctrl/Cmd + E = Export CSV
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        if (activeTab === 'registrations') {
          handleExportCSV()
        } else if (activeTab === 'newsletter') {
          handleExportNewsletterCSV()
        }
      }
    }

    if (isAuthenticated) {
      document.addEventListener('keydown', handleKeyboard)
      return () => document.removeEventListener('keydown', handleKeyboard)
    }
  }, [isAuthenticated, activeTab])

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

  // Data pro grafy
  const getRevenueByWorkshop = () => {
    const revenueMap = {}

    registrations.forEach(reg => {
      if (reg.status === 'confirmed') {
        const key = `${reg.workshop_date} - ${reg.workshop_location}`
        const price = parseInt(reg.price.replace(/[^\d]/g, '')) || 0

        if (!revenueMap[key]) {
          revenueMap[key] = { name: key, revenue: 0, count: 0 }
        }

        revenueMap[key].revenue += price
        revenueMap[key].count += 1
      }
    })

    return Object.values(revenueMap).sort((a, b) => b.revenue - a.revenue)
  }

  const getStatusDistribution = () => {
    const confirmed = registrations.filter(r => r.status === 'confirmed').length
    const pending = registrations.filter(r => r.status === 'pending').length
    const cancelled = registrations.filter(r => r.status === 'cancelled').length
    const waitlist = registrations.filter(r => r.status === 'waitlist').length

    return [
      { name: 'Potvrzené', value: confirmed, color: '#10b981' },
      { name: 'Čekající', value: pending, color: '#f59e0b' },
      { name: 'Waitlist', value: waitlist, color: '#3b82f6' },
      { name: 'Zrušené', value: cancelled, color: '#ef4444' },
    ].filter(item => item.value > 0)
  }

  const getOccupancyByWorkshop = () => {
    const occupancyMap = {}

    workshops.forEach(workshop => {
      const workshopRegs = registrations.filter(r =>
        r.workshop_date === workshop.date &&
        r.workshop_location === workshop.location &&
        r.status !== 'cancelled'
      )

      const capacity = parseInt(workshop.capacity) || 0
      const occupied = workshopRegs.length
      const percentage = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0

      const key = `${workshop.date} - ${workshop.location}`
      occupancyMap[key] = {
        name: key,
        obsazeno: occupied,
        kapacita: capacity,
        procento: percentage
      }
    })

    return Object.values(occupancyMap).sort((a, b) => b.procento - a.procento)
  }

  // Rozdělení workshopů na nadcházející a proběhlé
  const getUpcomingWorkshops = () => {
    const now = new Date()
    return workshops.filter(w => {
      if (!w.start_date) return true // Pokud nemá datum, zobraz jako nadcházející
      return new Date(w.start_date) >= now
    }).sort((a, b) => {
      if (!a.start_date) return 1
      if (!b.start_date) return -1
      return new Date(a.start_date) - new Date(b.start_date)
    })
  }

  const getPastWorkshops = () => {
    const now = new Date()
    return workshops.filter(w => {
      if (!w.start_date) return false
      return new Date(w.start_date) < now
    }).sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
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
              onClick={() => setActiveTab('statistics')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'statistics'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Statistiky
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
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'newsletter'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Newsletter
            </button>
            <button
              onClick={() => setActiveTab('email-templates')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'email-templates'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Email šablony
            </button>
            <button
              onClick={() => setActiveTab('audit-log')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'audit-log'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Audit Log
            </button>
          </div>
        </div>

        {/* Workshops Tab */}
        {activeTab === 'workshops' && (
          <div className="space-y-6">
            {/* Create Workshop Button */}
            <div className="flex justify-end gap-3">
              {workshopTemplates.length > 0 && (
                <button
                  onClick={() => setShowTemplateSelector(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Použít šablonu
                </button>
              )}
              <button
                onClick={() => setIsCreatingWorkshop(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                Nový workshop
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
                        onWheel={(e) => e.target.blur()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="20 (nechej prázdné pro skrytí)"
                      />
                    </div>
                  </div>

                  {/* Řádek 3: Ceny */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cena za 1 osobu *
                      </label>
                      <input
                        type="number"
                        required
                        value={workshopForm.priceSingle}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, priceSingle: e.target.value })}
                        onWheel={(e) => e.target.blur()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="4800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cena za pár (2 osoby)
                      </label>
                      <input
                        type="number"
                        value={workshopForm.priceCouple}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, priceCouple: e.target.value })}
                        onWheel={(e) => e.target.blur()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="7800"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nepovinné - pokud nevyplníš, párová registrace nebude dostupná</p>
                    </div>
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
                        name="workshopBankAccount"
                        value={workshopForm.bankAccount}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, bankAccount: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="123456789/0100"
                        autoComplete="on"
                      />
                      <p className="text-xs text-gray-500 mt-1">Browser si pamatuje předchozí hodnoty</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variabilní symbol
                      </label>
                      <input
                        type="text"
                        name="workshopVariableSymbol"
                        value={workshopForm.variableSymbol}
                        onChange={(e) => setWorkshopForm({ ...workshopForm, variableSymbol: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="202603"
                        autoComplete="on"
                      />
                      <p className="text-xs text-gray-500 mt-1">Prefix pro variabilní symboly (např. 202603)</p>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif font-bold text-gray-900">
                    Workshopy
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWorkshopTimeFilter('upcoming')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                        workshopTimeFilter === 'upcoming'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Nadcházející ({getUpcomingWorkshops().length})
                    </button>
                    <button
                      onClick={() => setWorkshopTimeFilter('past')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                        workshopTimeFilter === 'past'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Proběhlé ({getPastWorkshops().length})
                    </button>
                    <button
                      onClick={() => setWorkshopTimeFilter('all')}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                        workshopTimeFilter === 'all'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Všechny ({workshops.length})
                    </button>
                  </div>
                </div>
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
                      {(workshopTimeFilter === 'upcoming' ? getUpcomingWorkshops() :
                        workshopTimeFilter === 'past' ? getPastWorkshops() :
                        workshops).map((workshop) => (
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
                                <div className="space-y-4">
                                  {/* Řádek 0: Název workshopu */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Název workshopu
                                    </label>
                                    <input
                                      type="text"
                                      value={editingWorkshop.name || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, name: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="Například: Pět dohod - Základní workshop"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Ponecháno prázdné = použije se standardní název "Workshop Pět dohod"</p>
                                  </div>

                                  {/* Řádek 1: Počátek a Konec workshopu */}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Počátek workshopu (pro řazení) *
                                      </label>
                                      <input
                                        type="date"
                                        required
                                        value={formatDateForInput(editingWorkshop.start_date)}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, start_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Konec workshopu (pro datum rozsahu) *
                                      </label>
                                      <input
                                        type="date"
                                        required
                                        value={formatDateForInput(editingWorkshop.end_date)}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, end_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  {/* Řádek 2: Místo a Kapacita */}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Místo *
                                      </label>
                                      <input
                                        type="text"
                                        required
                                        value={editingWorkshop.location}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                        placeholder="Praha - Vinohrady"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Kapacita
                                      </label>
                                      <input
                                        type="number"
                                        value={editingWorkshop.capacity || ''}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, capacity: e.target.value })}
                                        onWheel={(e) => e.target.blur()}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                        placeholder="20 (nechej prázdné pro skrytí)"
                                      />
                                    </div>
                                  </div>

                                  {/* Řádek 3: Ceny */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cena za 1 osobu *
                                      </label>
                                      <input
                                        type="number"
                                        required
                                        value={editingWorkshop.price_single || ''}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, price_single: e.target.value })}
                                        onWheel={(e) => e.target.blur()}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="4800"
                                    />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cena za pár (2 osoby)
                                      </label>
                                      <input
                                        type="number"
                                        value={editingWorkshop.price_couple || ''}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, price_couple: e.target.value })}
                                        onWheel={(e) => e.target.blur()}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                        placeholder="7800"
                                      />
                                    </div>
                                  </div>

                                  {/* Řádek 4: Program */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Program
                                    </label>
                                    <textarea
                                      rows="3"
                                      value={editingWorkshop.program || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, program: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="Popis programu pro den 1 a den 2..."
                                    />
                                  </div>

                                  {/* Řádek 5: Přesná adresa vč. odkazu na Google Mapy */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Přesná adresa vč. odkazu na Google Mapy
                                    </label>
                                    <textarea
                                      rows="2"
                                      value={editingWorkshop.address || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, address: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="Přesná adresa místa konání..."
                                    />
                                  </div>

                                  {/* Řádek 6: Co si vzít s sebou */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Co si vzít s sebou
                                    </label>
                                    <textarea
                                      rows="2"
                                      value={editingWorkshop.what_to_bring || ''}
                                      onChange={(e) => setEditingWorkshop({ ...editingWorkshop, what_to_bring: e.target.value })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                      placeholder="Seznam věcí, které si mají účastníci vzít..."
                                    />
                                  </div>

                                  {/* Řádek 7: Číslo účtu a Variabilní symbol */}
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Číslo účtu
                                      </label>
                                      <input
                                        type="text"
                                        value={editingWorkshop.bank_account || ''}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, bank_account: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                        placeholder="123456789/0100"
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Variabilní symbol
                                      </label>
                                      <input
                                        type="text"
                                        value={editingWorkshop.variable_symbol || ''}
                                        onChange={(e) => setEditingWorkshop({ ...editingWorkshop, variable_symbol: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                                        placeholder="202603"
                                      />
                                    </div>
                                  </div>

                                  {/* Tlačítka */}
                                  <div className="flex justify-end gap-3 pt-4">
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
                                    onClick={() => router.push(`/admin/workshop/${workshop.id}`)}
                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                                    title="Detail"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
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

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-6">
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

            {/* Charts */}
            {registrations.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Revenue by Workshop */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Příjem podle workshopů</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getRevenueByWorkshop()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value.toLocaleString('cs-CZ')} Kč`} />
                      <Bar dataKey="revenue" fill="#f49d15" name="Příjem" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rozložení registrací podle statusu</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getStatusDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getStatusDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Occupancy by Workshop */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Obsazenost workshopů</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getOccupancyByWorkshop()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="obsazeno" fill="#10b981" name="Obsazeno" />
                      <Bar dataKey="kapacita" fill="#e5e7eb" name="Kapacita" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500 mb-2">Zatím žádná data ke zobrazení</p>
                <p className="text-sm text-gray-400">Grafy se zobrazí po přidání registrací</p>
              </div>
            )}
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

              {/* Bulk Actions */}
              {selectedRegistrations.size > 0 && (
                <div className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="text-sm font-medium text-gray-900">
                      Vybráno: {selectedRegistrations.size} registrací
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleBulkStatusChange('confirmed')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        Potvrdit
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('pending')}
                        className="px-3 py-1.5 bg-yellow-600 text-white rounded text-sm font-semibold hover:bg-yellow-700 transition-colors"
                      >
                        Nastavit čekající
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('cancelled')}
                        className="px-3 py-1.5 bg-gray-600 text-white rounded text-sm font-semibold hover:bg-gray-700 transition-colors"
                      >
                        Zrušit
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        Smazat
                      </button>
                      <button
                        onClick={deselectAllRegistrations}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Zrušit výběr
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                                  <th className="px-6 py-3 text-left">
                                    <input
                                      type="checkbox"
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          const groupIds = group.registrations.map(r => r.id)
                                          setSelectedRegistrations(new Set([...selectedRegistrations, ...groupIds]))
                                        } else {
                                          const groupIds = new Set(group.registrations.map(r => r.id))
                                          setSelectedRegistrations(new Set([...selectedRegistrations].filter(id => !groupIds.has(id))))
                                        }
                                      }}
                                      checked={group.registrations.every(r => selectedRegistrations.has(r.id))}
                                      className="rounded border-gray-300"
                                    />
                                  </th>
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
                                  <tr
                                    key={registration.id}
                                    className={`
                                      ${registration.registration_type === 'pair'
                                        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400'
                                        : 'hover:bg-gray-50'}
                                    `}
                                  >
                                    <td className="px-6 py-4">
                                      <input
                                        type="checkbox"
                                        checked={selectedRegistrations.has(registration.id)}
                                        onChange={() => toggleRegistrationSelection(registration.id)}
                                        className="rounded border-gray-300"
                                      />
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-2">
                                        {registration.registration_type === 'pair' && (
                                          <span className="text-blue-600 font-bold" title="Párová registrace">👥</span>
                                        )}
                                        <div className="font-medium text-gray-900">
                                          {registration.first_name} {registration.last_name}
                                        </div>
                                      </div>
                                      {registration.registration_type === 'pair' && registration.partner_first_name && (
                                        <div className="text-sm text-gray-700 ml-6 font-medium">
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
                                      <span className={`
                                        text-xs font-semibold px-3 py-1.5 rounded-full
                                        ${registration.registration_type === 'pair'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-gray-100 text-gray-700'}
                                      `}>
                                        {registration.registration_type === 'pair' ? '👥 Pár' : '1 osoba'}
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
                                    <td className="px-6 py-4 whitespace-nowrap relative">
                                      <div className="flex items-center gap-2">
                                        {/* Dropdown menu pro akce */}
                                        <div className="relative">
                                          <button
                                            onClick={() => toggleActionMenu(registration.id)}
                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                            title="Akce"
                                          >
                                            <MoreVertical className="w-4 h-4" />
                                          </button>

                                          {/* Dropdown menu */}
                                          {openActionMenus.has(registration.id) && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                              <div className="py-1">
                                                {/* Email akce */}
                                                <button
                                                  onClick={() => {
                                                    handleResendEmail(registration.id, 'confirmation')
                                                    toggleActionMenu(registration.id)
                                                  }}
                                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                  <Send className="w-4 h-4" />
                                                  Poslat potvrzovací email
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    handleResendEmail(registration.id, 'payment')
                                                    toggleActionMenu(registration.id)
                                                  }}
                                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                  <Send className="w-4 h-4" />
                                                  Poslat email o platbě
                                                </button>

                                                {/* Divider */}
                                                <div className="border-t border-gray-100 my-1"></div>

                                                {/* Poznámky a tagy */}
                                                <button
                                                  onClick={() => {
                                                    handleOpenNotes(registration)
                                                    toggleActionMenu(registration.id)
                                                  }}
                                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                  <StickyNote className="w-4 h-4" />
                                                  <span>Poznámky a tagy</span>
                                                  {(registration.notes || registration.tags) && (
                                                    <span className="ml-auto w-2 h-2 bg-primary-500 rounded-full"></span>
                                                  )}
                                                </button>

                                                {/* Divider */}
                                                <div className="border-t border-gray-100 my-1"></div>

                                                {/* Delete akce */}
                                                <button
                                                  onClick={() => {
                                                    handleDeleteRegistration(registration.id)
                                                    toggleActionMenu(registration.id)
                                                  }}
                                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                >
                                                  <Trash2 className="w-4 h-4" />
                                                  Smazat registraci
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
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

        {/* Audit Log Tab */}
        {activeTab === 'audit-log' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Audit Log</h3>
                  <p className="text-sm text-gray-600">Historie změn v admin rozhraní</p>
                </div>
                <button
                  onClick={loadAuditLogs}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Obnovit
                </button>
              </div>
            </div>

            {/* Audit logs table */}
            {auditLogs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 mb-2">Žádné záznamy v audit logu</p>
                <p className="text-sm text-gray-400">Historie změn se začne zaznamenávat automaticky</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Datum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Akce
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Entita
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Detail
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {auditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.created_at).toLocaleString('cs-CZ', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              log.action === 'create' ? 'bg-green-100 text-green-800' :
                              log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'delete' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {log.entity_type}
                            {log.entity_id && <span className="text-gray-500"> #{log.entity_id}</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {log.entity_name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary-50 to-sage-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0">
                <h3 className="text-xl font-semibold text-gray-900">Vyberte šablonu workshopu</h3>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {workshopTemplates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Žádné šablony k dispozici</p>
                    <p className="text-sm text-gray-400 mt-2">Spusťte migraci /api/migrate-workshop-templates</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {workshopTemplates.map(template => (
                      <div
                        key={template.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer group"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {template.location} • Kapacita: {template.capacity} • {template.price_single} Kč / {template.price_couple} Kč
                            </p>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        {template.program && (
                          <p className="text-sm text-gray-500 line-clamp-2">{template.program}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Newsletter odběratelé</h3>
                  <p className="text-sm text-gray-600">
                    Celkem: {newsletter.length} odběratelů
                  </p>
                </div>
                <button
                  onClick={handleExportNewsletterCSV}
                  disabled={newsletter.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Subscribers list */}
            {newsletter.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                Zatím žádní odběratelé newsletteru
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Datum přihlášení
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stav
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Akce
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newsletter.map((subscriber) => (
                        <tr key={subscriber.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900">{subscriber.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(subscriber.subscribed_at).toLocaleString('cs-CZ', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              subscriber.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {subscriber.is_active ? 'Aktivní' : 'Neaktivní'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteNewsletterSubscriber(subscriber.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Odstranit"
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
        )}

        {/* Email Templates Tab */}
        {activeTab === 'email-templates' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Email šablony</h3>
                  <p className="text-sm text-gray-600">Upravit texty automatických emailů</p>
                </div>
              </div>
            </div>

            {/* Templates list */}
            {emailTemplates.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Žádné email šablony</p>
                <p className="text-sm text-gray-400 mb-6">Vytvoř výchozí šablony nebo přidej vlastní</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/migrate-email-templates', {
                          method: 'GET',
                          headers: getAuthHeaders()
                        })
                        const data = await response.json()
                        if (data.success) {
                          alert('✅ Výchozí šablony byly vytvořeny!')
                          loadEmailTemplates()
                        } else {
                          alert('❌ Chyba: ' + (data.error || 'Nepodařilo se vytvořit šablony'))
                        }
                      } catch (error) {
                        alert('❌ Chyba při vytváření šablon')
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Vytvořit výchozí šablony
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-6">
                {emailTemplates.map(template => (
                  <div key={template.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Template header */}
                    <div className="bg-gradient-to-r from-primary-50 to-sage-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{template.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">Klíč: <code className="bg-white px-2 py-0.5 rounded text-xs">{template.template_key}</code></p>
                        </div>
                        <button
                          onClick={() => setEditingTemplate(template)}
                          className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold border border-primary-200"
                        >
                          <Edit2 className="w-4 h-4" />
                          Upravit
                        </button>
                      </div>
                    </div>

                    {/* Template preview */}
                    <div className="p-6">
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Předmět:</label>
                        <p className="text-gray-900">{template.subject}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Náhled těla emailu:</label>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                          <div dangerouslySetInnerHTML={{ __html: template.html_body }} className="prose prose-sm max-w-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit modal */}
            {editingTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Upravit šablonu: {editingTemplate.name}</h3>
                    <button
                      onClick={() => setEditingTemplate(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTemplate} className="p-6 space-y-6">
                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Předmět emailu
                      </label>
                      <input
                        type="text"
                        name="subject"
                        defaultValue={editingTemplate.subject}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Můžeš použít proměnné: {'{'}{'{'} workshopDate {'}'}{'}'},  {'{'}{'{'} firstName {'}'}{'}'}, atd.
                      </p>
                    </div>

                    {/* HTML Body */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        HTML kód emailu
                      </label>
                      <textarea
                        name="html_body"
                        defaultValue={editingTemplate.html_body}
                        rows={20}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Dostupné proměnné jsou uvedeny v poli "variables": {editingTemplate.variables}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setEditingTemplate(null)}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                      >
                        Zrušit
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Uložit změny
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions Floating Button */}
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all transform hover:scale-110 flex items-center justify-center z-40"
          title="Quick Actions (Ctrl+K)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>

        {/* Quick Actions Menu */}
        {showQuickActions && (
          <div className="fixed bottom-24 right-8 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Rychlé akce</h3>
                <button
                  onClick={() => setShowKeyboardHelp(true)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Klávesové zkratky"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="py-2">
              {/* Tab přepínání */}
              <button
                onClick={() => { setActiveTab('registrations'); setShowQuickActions(false) }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Registrace</span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">1</kbd>
              </button>
              <button
                onClick={() => { setActiveTab('workshops'); setShowQuickActions(false) }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Workshopy</span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">2</kbd>
              </button>
              <button
                onClick={() => { setActiveTab('newsletter'); setShowQuickActions(false) }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Newsletter</span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">3</kbd>
              </button>
              <button
                onClick={() => { setActiveTab('email-templates'); setShowQuickActions(false) }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Email šablony</span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">4</kbd>
              </button>

              <div className="border-t border-gray-100 my-2"></div>

              {/* Akce */}
              <button
                onClick={() => {
                  if (activeTab === 'registrations') handleExportCSV()
                  else if (activeTab === 'newsletter') handleExportNewsletterCSV()
                  setShowQuickActions(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-gray-100 rounded">⌘E</kbd>
              </button>

              {activeTab === 'workshops' && (
                <button
                  onClick={() => { setIsCreatingWorkshop(true); setShowQuickActions(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nový workshop</span>
                </button>
              )}

              {selectedRegistrations.size > 0 && (
                <>
                  <div className="border-t border-gray-100 my-2"></div>
                  <div className="px-4 py-2 text-xs text-gray-500">
                    {selectedRegistrations.size} vybraných registrací
                  </div>
                  <button
                    onClick={() => { handleBulkStatusChange('confirmed'); setShowQuickActions(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                  >
                    Potvrdit vybrané
                  </button>
                  <button
                    onClick={() => { handleBulkDelete(); setShowQuickActions(false) }}
                    className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                  >
                    Smazat vybrané
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Notes Modal */}
        {editingNotes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-primary-50 to-sage-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Poznámky a tagy</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingNotes.first_name} {editingNotes.last_name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingNotes(null)
                    setNotesFormData({ notes: '', tags: '' })
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateNotes} className="p-6 space-y-4">
                {/* Tagy */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Tagy (oddělené čárkami)
                  </label>
                  <input
                    type="text"
                    value={notesFormData.tags}
                    onChange={(e) => setNotesFormData({ ...notesFormData, tags: e.target.value })}
                    placeholder="VIP, urgentní, zaplatil hotově..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Například: VIP, urgentní, zaplatil hotově
                  </p>
                </div>

                {/* Poznámky */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <StickyNote className="w-4 h-4 inline mr-2" />
                    Interní poznámky
                  </label>
                  <textarea
                    value={notesFormData.notes}
                    onChange={(e) => setNotesFormData({ ...notesFormData, notes: e.target.value })}
                    rows={6}
                    placeholder="Poznámky viditelné pouze v adminu..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tyto poznámky vidí pouze admin, nebudou zaslány účastníkovi
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotes(null)
                      setNotesFormData({ notes: '', tags: '' })
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
                  >
                    Zrušit
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Uložit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Keyboard Help Modal */}
        {showKeyboardHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-primary-50 to-sage-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Klávesové zkratky</h3>
                <button
                  onClick={() => setShowKeyboardHelp(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Quick Actions</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">⌘K</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Nápověda</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">?</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Registrace</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">1</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Statistiky</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">2</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Workshopy</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">3</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Newsletter</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">4</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Email šablony</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">5</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Audit Log</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">6</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Export CSV</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">⌘E</kbd>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">Zavřít</span>
                    <kbd className="px-3 py-1 bg-white border border-gray-300 rounded text-sm">ESC</kbd>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    💡 Tip: Klávesové zkratky nefungují když jsi v textovém poli.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
