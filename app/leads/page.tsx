'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import { DataTable } from '@/components/data-table'
import { StatusCard } from '@/components/status-card'
import { MetricsCard } from '@/components/metrics-card'
import {
  Users,
  TrendingUp,
  Target,
  Plus,
  Mail,
  Phone,
  Loader2,
  Video,
  Filter,
  X,
  Calendar,
  Link2,
  Search,
} from 'lucide-react'
import { Lead } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { collection, addDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([])

  // Sidebar filter states
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMeetingDate, setFilterMeetingDate] = useState('all') // 'all', 'today', 'this-week'
  const [filterMeetingLink, setFilterMeetingLink] = useState('all') // 'all', 'has-link', 'no-link'

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new' as Lead['status'],
    value: '',
    source: 'LinkedIn',
    notes: '',
  })

  // Load reminders
  useEffect(() => {
    const loggedInEmployeeStr = localStorage.getItem('loggedInEmployee')
    if (!loggedInEmployeeStr) return

    let unsubscribe: () => void = () => {}

    try {
      const employee = JSON.parse(loggedInEmployeeStr)
      const employerId = employee.employerId
      const employeeId = employee.id

      if (employerId && employeeId && employerId !== 'mock-employer-id') {
        const remindersRef = collection(db, 'employers', employerId, 'employees', employeeId, 'reminders')
        const activeQuery = query(remindersRef, where('triggered', '==', false))
        
        unsubscribe = onSnapshot(activeQuery, (snapshot) => {
          const list: any[] = []
          snapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() })
          })
          list.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
          setUpcomingReminders(list)
        })
      }
    } catch (e) {
      console.error(e)
    }

    return () => unsubscribe()
  }, [])

  // Load leads from Firestore
  useEffect(() => {
    const fetchLeads = async () => {
      const loggedInEmployeeStr = localStorage.getItem('loggedInEmployee')
      let dbLeads: Lead[] = []
      if (loggedInEmployeeStr) {
        try {
          const employee = JSON.parse(loggedInEmployeeStr)
          const employerId = employee.employerId
          const employeeId = employee.id
          if (employerId && employeeId && employerId !== 'mock-employer-id') {
            const leadsRef = collection(db, 'employers', employerId, 'employees', employeeId, 'leads')
            const querySnapshot = await getDocs(leadsRef)
            querySnapshot.forEach((doc) => {
              dbLeads.push({ id: doc.id, ...doc.data() } as Lead)
            })
          }
        } catch (error) {
          console.error('Error fetching leads from Firestore:', error)
        }
      }

      setLeads(dbLeads)
      setLoading(false)
    }
    fetchLeads()
  }, [])

  // Handle lead submission
  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const loggedInEmployeeStr = localStorage.getItem('loggedInEmployee')
    let newLeadId = `lead_${Date.now()}`
    const newLeadData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      status: formData.status,
      value: Number(formData.value) || 0,
      lastContact: new Date().toISOString().split('T')[0],
      source: formData.source,
      notes: formData.notes,
    }

    if (loggedInEmployeeStr) {
      try {
        const employee = JSON.parse(loggedInEmployeeStr)
        const employerId = employee.employerId
        const employeeId = employee.id
        if (employerId && employeeId && employerId !== 'mock-employer-id') {
          const leadsRef = collection(db, 'employers', employerId, 'employees', employeeId, 'leads')
          const docRef = await addDoc(leadsRef, newLeadData)
          newLeadId = docRef.id
        }
      } catch (error) {
        console.error('Error saving lead to Firestore:', error)
        alert('Failed to save to Firestore. Saving locally instead.')
      }
    }

    const savedLead: Lead = {
      id: newLeadId,
      ...newLeadData,
    }

    setLeads([savedLead, ...leads])
    setIsModalOpen(false)
    setIsSubmitting(false)

    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'new',
      value: '',
      source: 'LinkedIn',
      notes: '',
    })
  }

  // Filter meetings based on query and date/meet filters
  const filteredMeetings = useMemo(() => {
    return upcomingReminders.filter((reminder) => {
      // 1. Search filter
      const matchesSearch =
        reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.leadName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())

      // 2. Meet Link filter
      let matchesLink = true
      if (filterMeetingLink === 'has-link') {
        matchesLink = !!reminder.meetLink
      } else if (filterMeetingLink === 'no-link') {
        matchesLink = !reminder.meetLink
      }

      // 3. Date range filter
      let matchesDate = true
      if (filterMeetingDate === 'today') {
        const todayStr = new Date().toISOString().split('T')[0]
        const remDateStr = new Date(reminder.dateTime).toISOString().split('T')[0]
        matchesDate = remDateStr === todayStr
      } else if (filterMeetingDate === 'this-week') {
        const now = new Date()
        const oneWeekLater = new Date()
        oneWeekLater.setDate(now.getDate() + 7)
        const remDate = new Date(reminder.dateTime)
        matchesDate = remDate >= now && remDate <= oneWeekLater
      }

      return matchesSearch && matchesLink && matchesDate
    })
  }, [upcomingReminders, searchTerm, filterMeetingDate, filterMeetingLink])

  // Filter leads based on query and sidebar status filters
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [leads, filterStatus, searchTerm])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = leads.length
    return {
      total,
      new: leads.filter((l) => l.status === 'new').length,
      qualified: leads.filter((l) => l.status === 'qualified').length,
      won: leads.filter((l) => l.status === 'won').length,
      totalValue: leads.reduce((sum, l) => sum + l.value, 0),
      avgValue: total > 0 ? Math.round(leads.reduce((sum, l) => sum + l.value, 0) / total) : 0,
    }
  }, [leads])

  // Calculate meeting stats
  const meetingStats = useMemo(() => {
    const total = upcomingReminders.length
    const withLink = upcomingReminders.filter(r => !!r.meetLink).length
    const todayStr = new Date().toISOString().split('T')[0]
    const todayCount = upcomingReminders.filter(r => {
      const remDateStr = new Date(r.dateTime).toISOString().split('T')[0]
      return remDateStr === todayStr
    }).length
    return { total, withLink, todayCount }
  }, [upcomingReminders])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Loading leads dashboard...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Leads Management</h1>
          <p className="text-slate-600 mt-2">Manage and track all your sales leads</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold hover:shadow-lg transition-shadow shadow-md"
        >
          <Plus size={20} />
          Add New Lead
        </motion.button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatusCard
          title="Total Leads"
          value={stats.total}
          color="blue"
          badge="All statuses"
        />
        <StatusCard
          title="New Leads"
          value={stats.new}
          color="green"
          badge="This month"
        />
        <StatusCard
          title="Qualified"
          value={stats.qualified}
          color="purple"
          badge="Ready for pitch"
        />
        <StatusCard
          title="Won Deals"
          value={stats.won}
          color="yellow"
          badge="Closed"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricsCard
          title="Total Lead Value"
          value={formatCurrency(stats.totalValue)}
          metric="All leads combined"
          icon={Target}
          backgroundColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <MetricsCard
          title="Average Lead Value"
          value={formatCurrency(stats.avgValue)}
          metric="Per lead"
          icon={TrendingUp}
          backgroundColor="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <MetricsCard
          title="Total Leads"
          value={stats.total}
          metric="Active pipeline"
          icon={Users}
          backgroundColor="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Search & Filter Sidebar trigger */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search leads, companies or meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
          />
        </div>
        <button
          onClick={() => setIsFilterSidebarOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors shadow-sm"
        >
          <Filter size={18} />
          Filter Options
          {(filterStatus !== 'all' || filterMeetingDate !== 'all' || filterMeetingLink !== 'all') && (
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
          )}
        </button>
      </div>

      {/* Upcoming Scheduled Meetings Section */}
      {upcomingReminders.length > 0 && (
        <div className="mb-8 text-left">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
              <h2 className="text-xl font-bold text-slate-900">Upcoming Meetings ({filteredMeetings.length})</h2>
            </div>
            
            {/* Meeting Stats bar */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2">
              <span>Total: <strong className="text-slate-800">{meetingStats.total}</strong></span>
              <span>Today: <strong className="text-indigo-600">{meetingStats.todayCount}</strong></span>
              <span>With Meet: <strong className="text-emerald-600">{meetingStats.withLink}</strong></span>
            </div>
          </div>

          {filteredMeetings.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/50 border border-slate-100 rounded-3xl">
              <p className="text-slate-500 text-sm">No scheduled meetings match your active filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetings.map((reminder) => {
                const dt = new Date(reminder.dateTime)
                const timeString = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                const dateString = dt.toLocaleDateString([], { month: 'short', day: 'numeric' })
                
                return (
                  <motion.div
                    key={reminder.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden text-left"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-cyan-500" />
                    
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {dateString} at {timeString}
                        </span>
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          Scheduled
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base mb-1 truncate">{reminder.title}</h3>
                      <p className="text-xs text-slate-500 font-semibold mb-3 truncate">
                        Client: {reminder.leadName} ({reminder.clientCompany})
                      </p>
                      {reminder.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {reminder.description}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2.5 mt-2">
                      {reminder.meetLink ? (
                        <a
                          href={reminder.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Video size={13} />
                          Join Meet
                        </a>
                      ) : (
                        <span className="flex-1 text-center py-2 text-xs font-semibold text-slate-400 bg-slate-50 rounded-xl">
                          No Meet Link
                        </span>
                      )}
                      <Link
                        href={`/leads/${reminder.leadId}`}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center transition-colors"
                      >
                        View Lead
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Leads Table */}
      <DataTable
        title={`Leads (${filteredLeads.length})`}
        columns={[
          { key: 'name', label: 'Lead Name', width: 'w-1/5' },
          { key: 'company', label: 'Company', width: 'w-1/5' },
          {
            key: 'status',
            label: 'Status',
            render: (status) => {
              const statusMap: Record<string, { bg: string; text: string }> = {
                new: { bg: 'bg-blue-100', text: 'text-blue-700' },
                contacted: { bg: 'bg-purple-100', text: 'text-purple-700' },
                qualified: { bg: 'bg-green-100', text: 'text-green-700' },
                proposal: { bg: 'bg-orange-100', text: 'text-orange-700' },
                negotiation: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
                won: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
                lost: { bg: 'bg-red-100', text: 'text-red-700' },
              }
              const s = statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              )
            },
          },
          {
            key: 'value',
            label: 'Deal Value',
            render: (value) => (
              <span className="font-semibold text-slate-900">{formatCurrency(value)}</span>
            ),
          },
          { key: 'lastContact', label: 'Last Contact' },
        ]}
        data={filteredLeads}
        actions={(row) => (
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Call"
            >
              <Phone size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              title="Email"
            >
              <Mail size={16} />
            </motion.button>
            <Link
              href={`/leads/${row.id}`}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors"
            >
              View Detail
            </Link>
            <Link
              href={`/leads/${row.id}?edit=true`}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors"
            >
              Edit
            </Link>
          </div>
        )}
      />

      {/* Empty State */}
      {filteredLeads.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="floating-card p-12 rounded-xl text-center mt-6"
        >
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No leads found</h3>
          <p className="text-slate-600 mb-6">
            {searchTerm ? 'Try adjusting your search criteria' : 'Create your first lead to get started'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Lead
            </button>
          )}
        </motion.div>
      )}

      {/* Slide-over Modal popup for Lead Creation */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
            >
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-cyan-500" />
              
              <div className="p-8 overflow-y-auto">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Add New Lead</h3>
                
                <form onSubmit={handleSaveLead} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Lead Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. rajesh@techcorp.com"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91-98765-43210"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. TechCorp India"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Deal Value (INR)</label>
                      <input
                        type="number"
                        required
                        value={formData.value}
                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                        placeholder="e.g. 500000"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Lead['status'] })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-800 text-sm transition-all"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="qualified">Qualified</option>
                        <option value="proposal">Proposal</option>
                        <option value="negotiation">Negotiation</option>
                        <option value="won">Won</option>
                        <option value="lost">Lost</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Source</label>
                      <input
                        type="text"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        placeholder="e.g. LinkedIn, Website"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter detailed notes..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm h-24 resize-none transition-all bg-white"
                    />
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-750 text-white font-bold transition-all shadow-md text-sm flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Lead'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Right Filter Sidebar Drawer */}
      <AnimatePresence>
        {isFilterSidebarOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsFilterSidebarOpen(false)}
            />

            {/* Sidebar drawer container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-screen max-w-md bg-white shadow-2xl p-6 md:p-8 flex flex-col justify-between border-l border-slate-100 h-full z-10"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Filter size={20} className="text-indigo-600" />
                    Filter Panel
                  </h3>
                  <button
                    onClick={() => setIsFilterSidebarOpen(false)}
                    className="p-2 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6 text-left">
                  {/* Search input inside sidebar as well */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Search Query</label>
                    <input
                      type="text"
                      placeholder="Search leads, companies or meetings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  {/* Lead Status Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lead Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-800 text-sm transition-all"
                    >
                      <option value="all">All Lead Statuses</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  {/* Meeting Date Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Date Range</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'today', label: 'Today' },
                        { id: 'this-week', label: '7 Days' },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setFilterMeetingDate(d.id)}
                          className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                            filterMeetingDate === d.id
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meeting Link Filter */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meeting Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'all', label: 'All' },
                        { id: 'has-link', label: 'Has Meet' },
                        { id: 'no-link', label: 'No Link' },
                      ].map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => setFilterMeetingLink(l.id)}
                          className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                            filterMeetingLink === l.id
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset button inside sidebar footer */}
              <div className="border-t border-slate-100 pt-6">
                <button
                  onClick={() => {
                    setFilterStatus('all')
                    setFilterMeetingDate('all')
                    setFilterMeetingLink('all')
                    setSearchTerm('')
                  }}
                  className="w-full py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  Reset All Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
