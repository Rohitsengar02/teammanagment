'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardLayout } from '@/components/dashboard-layout'
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  Check,
  X,
  MessageSquare,
  Clock,
  Send,
  Loader2,
  Trash2,
  Video,
} from 'lucide-react'
import { doc, getDoc, updateDoc, collection, addDoc, getDocs, deleteDoc, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Lead } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

interface TimelineEvent {
  id: string
  title: string
  notes: string
  date: string
  time: string
  type: 'call' | 'meeting' | 'email' | 'note' | 'status_change' | 'reminder'
  meetLink?: string
  triggered?: boolean
  dateTime?: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = params.id as string
  const startEdit = searchParams.get('edit') === 'true'

  const [lead, setLead] = useState<Lead | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditingLead, setIsEditingLead] = useState(false)
  const [employerId, setEmployerId] = useState<string | null>(null)
  const [employeeId, setEmployeeId] = useState<string | null>(null)

  // Reminder Modal popup state
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false)
  const [isSavingReminder, setIsSavingReminder] = useState(false)
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    dateTime: '',
    meetLink: '',
  })

  // Edit Lead Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new' as Lead['status'],
    value: 0,
    source: '',
    notes: '',
  })

  // Timeline Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    notes: '',
    type: 'note' as TimelineEvent['type'],
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
  })
  const [isAddingEvent, setIsAddingEvent] = useState(false)

  // Load Lead and Timeline from Firebase
  useEffect(() => {
    const loadData = async () => {
      const loggedInEmployeeStr = localStorage.getItem('loggedInEmployee')
      if (!loggedInEmployeeStr) {
        setLoading(false)
        return
      }

      try {
        const employee = JSON.parse(loggedInEmployeeStr)
        const empId = employee.employerId
        const emplyId = employee.id
        setEmployerId(empId)
        setEmployeeId(emplyId)

        if (empId && emplyId && empId !== 'mock-employer-id') {
          // Fetch Lead details
          const leadRef = doc(db, 'employers', empId, 'employees', emplyId, 'leads', leadId)
          const leadSnap = await getDoc(leadRef)

          if (leadSnap.exists()) {
            const leadData = { id: leadSnap.id, ...leadSnap.data() } as Lead
            setLead(leadData)
            setEditFormData({
              name: leadData.name,
              email: leadData.email,
              phone: leadData.phone,
              company: leadData.company,
              status: leadData.status,
              value: leadData.value,
              source: leadData.source,
              notes: leadData.notes || '',
            })

            // Fetch Timeline
            const timelineRef = collection(db, 'employers', empId, 'employees', emplyId, 'leads', leadId, 'timeline')
            const timelineQuery = query(timelineRef, orderBy('date', 'desc'), orderBy('time', 'desc'))
            const timelineSnap = await getDocs(timelineQuery)
            const events: TimelineEvent[] = []
            timelineSnap.forEach((doc) => {
              const data = doc.data()
              events.push({
                id: doc.id,
                title: data.title,
                notes: data.notes,
                date: data.date,
                time: data.time,
                type: data.type,
                meetLink: data.meetLink || '',
                dateTime: `${data.date}T${data.time}`,
              })
            })

            // Fetch Reminders for this lead
            try {
              const remindersRef = collection(db, 'employers', empId, 'employees', emplyId, 'reminders')
              const remindersQuery = query(remindersRef, where('leadId', '==', leadId))
              const remindersSnap = await getDocs(remindersQuery)
              remindersSnap.forEach((doc) => {
                const data = doc.data()
                const dt = new Date(data.dateTime)
                const dateStr = dt.toISOString().split('T')[0]
                const timeStr = dt.toTimeString().split(' ')[0].substring(0, 5)
                events.push({
                  id: doc.id,
                  title: `[Reminder] ${data.title}`,
                  notes: data.description || 'Scheduled meeting reminder.',
                  date: dateStr,
                  time: timeStr,
                  type: 'reminder',
                  meetLink: data.meetLink || '',
                  triggered: data.triggered || false,
                  dateTime: data.dateTime,
                })
              })
            } catch (remErr) {
              console.error('Error loading reminders for timeline:', remErr)
            }

            // Sort merged events by dateTime descending
            events.sort((a, b) => {
              const t1 = a.dateTime ? new Date(a.dateTime).getTime() : 0
              const t2 = b.dateTime ? new Date(b.dateTime).getTime() : 0
              return t2 - t1
            })

            setTimeline(events)
          } else {
            router.push('/leads')
          }
        }
      } catch (err) {
        console.error('Error loading lead data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [leadId])

  // Auto-focus Edit Mode if edit query param is set
  useEffect(() => {
    if (startEdit && lead) {
      setIsEditingLead(true)
    }
  }, [startEdit, lead])

  // Save Lead details edits
  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employerId || !employeeId || !lead) return

    try {
      const leadRef = doc(db, 'employers', employerId, 'employees', employeeId, 'leads', leadId)
      await updateDoc(leadRef, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        company: editFormData.company,
        status: editFormData.status,
        value: Number(editFormData.value) || 0,
        source: editFormData.source,
        notes: editFormData.notes,
      })

      // Add a status change timeline event automatically if status changed
      if (editFormData.status !== lead.status) {
        const timelineRef = collection(db, 'employers', employerId, 'employees', employeeId, 'leads', leadId, 'timeline')
        const autoEvent = {
          title: `Status changed to ${editFormData.status.toUpperCase()}`,
          notes: `Status updated during profile edit.`,
          type: 'status_change' as const,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        }
        const docRef = await addDoc(timelineRef, autoEvent)
        setTimeline([{ id: docRef.id, ...autoEvent }, ...timeline])
      }

      setLead({
        ...lead,
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        company: editFormData.company,
        status: editFormData.status,
        value: Number(editFormData.value) || 0,
        source: editFormData.source,
        notes: editFormData.notes,
      })
      setIsEditingLead(false)
    } catch (error) {
      console.error('Error updating lead:', error)
      alert('Failed to save changes to Firestore.')
    }
  }

  // Create Timeline Event
  const handleAddTimelineEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employerId || !employeeId) return

    try {
      const timelineRef = collection(db, 'employers', employerId, 'employees', employeeId, 'leads', leadId, 'timeline')
      const eventData = {
        title: newEvent.title,
        notes: newEvent.notes,
        type: newEvent.type,
        date: newEvent.date,
        time: newEvent.time,
      }
      const docRef = await addDoc(timelineRef, eventData)

      setTimeline([{ id: docRef.id, ...eventData }, ...timeline])
      setNewEvent({
        title: '',
        notes: '',
        type: 'note',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      })
      setIsAddingEvent(false)
    } catch (error) {
      console.error('Error adding timeline event:', error)
      alert('Failed to add event to timeline.')
    }
  }

  // Delete a Timeline Event or Reminder
  const handleDeleteEvent = async (eventId: string, type: string) => {
    if (!employerId || !employeeId || !confirm('Are you sure you want to delete this event?')) return

    try {
      if (type === 'reminder') {
        const reminderRef = doc(db, 'employers', employerId, 'employees', employeeId, 'reminders', eventId)
        await deleteDoc(reminderRef)
      } else {
        const eventRef = doc(db, 'employers', employerId, 'employees', employeeId, 'leads', leadId, 'timeline', eventId)
        await deleteDoc(eventRef)
      }
      setTimeline(timeline.filter(e => e.id !== eventId))
    } catch (error) {
      console.error('Error deleting timeline item:', error)
    }
  }

  // Create & Save Meeting Reminder
  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employerId || !employeeId || !lead) return
    setIsSavingReminder(true)

    try {
      const remindersRef = collection(db, 'employers', employerId, 'employees', employeeId, 'reminders')
      
      // Fetch latest timeline event details or default to lead notes
      const lastTalkNotes = timeline.length > 0 ? timeline[0].notes : lead.notes || 'No timeline conversations logged yet.'

      await addDoc(remindersRef, {
        leadId: lead.id,
        leadName: lead.name,
        clientEmail: lead.email,
        clientPhone: lead.phone,
        clientCompany: lead.company,
        lastTalkNotes: lastTalkNotes,
        title: reminderForm.title,
        description: reminderForm.description,
        dateTime: reminderForm.dateTime,
        meetLink: reminderForm.meetLink,
        triggered: false,
        createdAt: new Date().toISOString(),
      })

      setIsReminderModalOpen(false)
      setReminderForm({
        title: '',
        description: '',
        dateTime: '',
        meetLink: '',
      })
      alert('Reminder set successfully!')
    } catch (error) {
      console.error('Error saving reminder:', error)
      alert('Failed to save meeting reminder.')
    } finally {
      setIsSavingReminder(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Loading lead profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-100 shadow-sm mt-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Lead not found</h2>
          <p className="text-slate-600 mb-6">This lead may have been deleted or moved.</p>
          <button
            onClick={() => router.push('/leads')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Leads
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Back to list */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push('/leads')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Leads List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Lead Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 md:p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">{lead.name}</h2>
                <p className="text-sm font-semibold text-purple-600 mt-1 uppercase tracking-wider">{lead.company}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReminderModalOpen(true)}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-indigo-600 hover:text-indigo-900 transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold"
                  title="Set Reminder"
                >
                  <Clock size={16} /> Set Reminder
                </button>
                <button
                  onClick={() => setIsEditingLead(!isEditingLead)}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-sm"
                >
                  {isEditingLead ? <X size={16} /> : <Edit2 size={16} />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isEditingLead ? (
                // Edit Lead Form
                <motion.form
                  key="edit-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onSubmit={handleUpdateLead}
                  className="space-y-4 text-left"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Lead Name</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Company</label>
                    <input
                      type="text"
                      required
                      value={editFormData.company}
                      onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Deal Value (INR)</label>
                      <input
                        type="number"
                        required
                        value={editFormData.value}
                        onChange={(e) => setEditFormData({ ...editFormData, value: Number(e.target.value) || 0 })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Lead['status'] })}
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Source</label>
                    <input
                      type="text"
                      value={editFormData.source}
                      onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Internal Notes</label>
                    <textarea
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm h-24 resize-none transition-all bg-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md text-sm flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Save Edits
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingLead(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              ) : (
                // View Lead Info Detail
                <motion.div
                  key="view-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase ${
                      lead.status === 'won'
                        ? 'bg-emerald-100 text-emerald-700'
                        : lead.status === 'lost'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {lead.status}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Status</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-700 text-sm">
                      <Mail className="text-slate-400 flex-shrink-0" size={18} />
                      <a href={`mailto:${lead.email}`} className="font-semibold text-slate-900 hover:underline">{lead.email}</a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 text-sm">
                      <Phone className="text-slate-400 flex-shrink-0" size={18} />
                      <a href={`tel:${lead.phone}`} className="font-semibold text-slate-900 hover:underline">{lead.phone}</a>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 text-sm">
                      <DollarSign className="text-slate-400 flex-shrink-0" size={18} />
                      <span className="font-extrabold text-slate-900 text-lg">{formatCurrency(lead.value)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 text-sm">
                      <Briefcase className="text-slate-400 flex-shrink-0" size={18} />
                      <span>Source: <strong className="text-slate-900">{lead.source || 'Direct'}</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 text-sm">
                      <Calendar className="text-slate-400 flex-shrink-0" size={18} />
                      <span>Last Contact: <strong className="text-slate-900">{lead.lastContact || 'None'}</strong></span>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl">
                      <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">Lead Notes</h4>
                      <p className="text-slate-700 text-sm leading-relaxed">{lead.notes}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Timeline Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900">Communication Timeline</h3>
                <p className="text-sm text-slate-500 mt-1">Logs of calls, meetings, pitches, and updates</p>
              </div>
              <button
                onClick={() => setIsAddingEvent(!isAddingEvent)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white font-bold hover:bg-slate-900 transition-colors shadow-md text-sm"
              >
                {isAddingEvent ? <X size={16} /> : <Plus size={16} />}
                {isAddingEvent ? 'Close Form' : 'Log Activity'}
              </button>
            </div>

            {/* Log Timeline Activity Form */}
            <AnimatePresence>
              {isAddingEvent && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-8 p-6 bg-slate-50 border border-slate-100 rounded-2xl"
                >
                  <form onSubmit={handleAddTimelineEvent} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Activity Title</label>
                        <input
                          type="text"
                          required
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          placeholder="e.g. Sent Price Proposal"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Activity Type</label>
                        <select
                          value={newEvent.type}
                          onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as TimelineEvent['type'] })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-slate-800 text-sm"
                        >
                          <option value="note">Internal Note</option>
                          <option value="call">Phone Call</option>
                          <option value="meeting">In-Person/Online Meeting</option>
                          <option value="email">Email Sent</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Date</label>
                        <input
                          type="date"
                          required
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Time</label>
                        <input
                          type="time"
                          required
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Notes & Summary</label>
                      <textarea
                        required
                        value={newEvent.notes}
                        onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                        placeholder="Detail of conversation or log notes..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 text-sm h-20 bg-white resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md text-sm flex items-center gap-2"
                      >
                        <Send size={16} /> Log Activity
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timeline UI */}
            {timeline.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <Clock size={40} className="mx-auto text-slate-400 mb-3" />
                <p className="text-slate-600 text-sm font-semibold">No activity logs recorded yet.</p>
                <p className="text-xs text-slate-500 mt-1">Click &quot;Log Activity&quot; above to add a new timeline event.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 ml-4 space-y-8 pb-8 text-left">
                {timeline.map((event, idx) => {
                  const typeColors = {
                    call: 'bg-blue-500 text-white border-blue-200',
                    meeting: 'bg-purple-500 text-white border-purple-200',
                    email: 'bg-cyan-500 text-white border-cyan-200',
                    note: 'bg-amber-500 text-white border-amber-200',
                    status_change: 'bg-emerald-500 text-white border-emerald-200',
                    reminder: 'bg-indigo-650 text-white border-indigo-200 shadow-md shadow-indigo-500/20',
                  }
                  const badgeColor = typeColors[event.type] || 'bg-slate-500 text-white'

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      className="relative pl-8"
                    >
                      {/* Timeline dot icon indicator */}
                      <span className={`absolute -left-[14px] top-1 h-7 w-7 rounded-full border-2 flex items-center justify-center font-bold text-xs ${badgeColor} shadow-md`}>
                        {event.type === 'call' && <Phone size={11} />}
                        {event.type === 'meeting' && <Calendar size={11} />}
                        {event.type === 'email' && <Mail size={11} />}
                        {event.type === 'note' && <MessageSquare size={11} />}
                        {event.type === 'status_change' && <Clock size={11} />}
                        {event.type === 'reminder' && <Clock size={11} />}
                      </span>

                      {/* Timeline Event Content */}
                      <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all relative group">
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.type)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Log"
                        >
                          <Trash2 size={15} />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-base">{event.title}</h4>
                          <span className="text-[10px] font-extrabold tracking-wide uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                            {event.type}
                          </span>
                          {event.type === 'reminder' && (
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              event.triggered ? 'bg-slate-100 text-slate-500' : 'bg-pink-100 text-pink-700 animate-pulse'
                            }`}>
                              {event.triggered ? 'Triggered' : 'Upcoming'}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed mb-3">{event.notes}</p>
                        
                        {event.meetLink && (
                          <div className="mb-4">
                            <a
                              href={event.meetLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                            >
                              <Video size={12} />
                              Join Meet
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
                          <Clock size={13} />
                          <span>{event.date} at {event.time}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Set Reminder Modal popup */}
      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsReminderModalOpen(false)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 flex flex-col"
            >
              <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
              
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                    <Clock size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Set Meeting Reminder</h3>
                </div>
                
                <form onSubmit={handleSaveReminder} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Reminder Title</label>
                    <input
                      type="text"
                      required
                      value={reminderForm.title}
                      onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                      placeholder="e.g. Project Proposal Discussion"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Meeting Description</label>
                    <textarea
                      value={reminderForm.description}
                      onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                      placeholder="e.g. Briefing about design tokens and timeline..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm h-20 resize-none transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={reminderForm.dateTime}
                      onChange={(e) => setReminderForm({ ...reminderForm, dateTime: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Google Meet Link</label>
                    <input
                      type="url"
                      value={reminderForm.meetLink}
                      onChange={(e) => setReminderForm({ ...reminderForm, meetLink: e.target.value })}
                      placeholder="https://meet.google.com/abc-defg-hij"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800 text-sm transition-all bg-white"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsReminderModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingReminder}
                      className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md text-sm flex items-center justify-center gap-2"
                    >
                      {isSavingReminder ? 'Saving...' : 'Set Alarm'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
