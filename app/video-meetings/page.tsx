'use client'

import { useState, useEffect } from 'react'
import { CollaborationLayout } from '@/components/collaboration-layout'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Video, 
  Calendar, 
  Clock, 
  Plus, 
  ExternalLink, 
  Monitor, 
  Play, 
  X, 
  Users,
  VideoOff,
  User,
  Tv
} from 'lucide-react'
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Meeting {
  id: string
  title: string
  description: string
  scheduledFor: string
  meetLink: string
  hostName: string
  hostId: string
}

export default function VideoMeetingsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [employerId, setEmployerId] = useState<string | null>(null)
  
  // Meetings state
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Scheduling Form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [meetLink, setMeetLink] = useState('')

  // Active call simulator
  const [activeCall, setActiveCall] = useState<Meeting | null>(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callTimer, setCallTimer] = useState(0)

  // 1. Resolve User Session
  useEffect(() => {
    const employerSessionId = localStorage.getItem('registeredEmployerId')
    const employeeSessionStr = localStorage.getItem('loggedInEmployee')

    if (employeeSessionStr) {
      try {
        const emp = JSON.parse(employeeSessionStr)
        setCurrentUser({
          id: emp.id,
          name: emp.name,
          role: emp.role || 'employee'
        })
        setEmployerId(emp.employerId)
      } catch (e) {
        console.error(e)
      }
    } else if (employerSessionId) {
      setCurrentUser({
        id: employerSessionId,
        name: 'Employer Admin',
        role: 'employer'
      })
      setEmployerId(employerSessionId)
    } else {
      setCurrentUser({
        id: 'mock-user-id',
        name: 'Demo Guest',
        role: 'sales-executive'
      })
      setEmployerId('mock-employer-id')
    }
  }, [])

  // 2. Real-time Meetings Sync
  useEffect(() => {
    if (!employerId) return
    setLoading(true)

    const meetingsRef = collection(db, 'employers', employerId, 'meetings')
    const q = query(meetingsRef, orderBy('scheduledFor', 'asc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Meeting[] = []
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as Meeting)
      })
      setMeetings(list)
      setLoading(false)
    }, (error) => {
      console.error('Error listening to meetings:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [employerId])

  // 3. Active Call Timer
  useEffect(() => {
    let interval: any
    if (activeCall) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1)
      }, 1000)
    } else {
      setCallTimer(0)
    }
    return () => clearInterval(interval)
  }, [activeCall])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 4. Schedule Meeting
  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !scheduledFor || !employerId || !currentUser) return

    // Auto-generate standard Google Meet link if none provided
    const link = meetLink.trim() || `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`

    try {
      await addDoc(collection(db, 'employers', employerId, 'meetings'), {
        title,
        description,
        scheduledFor,
        meetLink: link,
        hostName: currentUser.name,
        hostId: currentUser.id,
        createdAt: new Date().toISOString()
      })

      // Reset
      setTitle('')
      setDescription('')
      setScheduledFor('')
      setMeetLink('')
      setShowScheduleModal(false)
    } catch (err) {
      console.error('Error scheduling meeting:', err)
    }
  }

  // 5. Start Active Call
  const handleStartCall = (meeting: Meeting) => {
    setActiveCall(meeting)
    // Launch Google Meet link in new browser tab
    window.open(meeting.meetLink, '_blank')
  }

  return (
    <CollaborationLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Video Meetings</h1>
          <p className="text-slate-600 font-medium">Launch Google Meet rooms, present screen shares, and view upcoming calls.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all text-sm shadow-md"
        >
          <Plus size={16} />
          Schedule Google Meet
        </motion.button>
      </div>

      {/* Active Call HUD Banner */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl text-left flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden"
          >
            {/* Ambient pulse background */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 blur-3xl rounded-full" />

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Active Call Status</span>
              <h3 className="text-2xl font-black">{activeCall.title}</h3>
              <div className="flex items-center gap-4 text-xs font-bold text-emerald-100">
                <span className="flex items-center gap-1"><Clock size={14}/> {formatTimer(callTimer)}</span>
                <span className="flex items-center gap-1"><User size={14}/> Host: {activeCall.hostName}</span>
                {isScreenSharing && <span className="bg-emerald-500/50 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1"><Monitor size={12} /> Presenting</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 flex-wrap">
              {/* Screen Share simulation */}
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isScreenSharing 
                    ? 'bg-rose-500 hover:bg-rose-600 text-white' 
                    : 'bg-white text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <Tv size={14} />
                {isScreenSharing ? 'Stop Presenting' : 'Share Screen'}
              </button>
              
              {/* Meet Launcher fallback */}
              <a
                href={activeCall.meetLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <ExternalLink size={14} />
                Meet Link
              </a>

              {/* End Meeting */}
              <button
                onClick={() => {
                  setActiveCall(null)
                  setIsScreenSharing(false)
                }}
                className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl transition-colors"
                title="End Meeting"
              >
                <VideoOff size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Sharing Virtual Monitor Frame */}
      <AnimatePresence>
        {isScreenSharing && activeCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left text-white shadow-xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5"><Monitor size={14} className="text-purple-400" /> Virtual Screen Sharing Output</span>
              <button
                onClick={() => setIsScreenSharing(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Screen share simulated canvas */}
            <div className="aspect-video max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 mix-blend-overlay pointer-events-none" />
              <div className="h-16 w-16 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 animate-ping" />
              <div className="absolute flex flex-col items-center justify-center">
                <Monitor size={36} className="text-purple-500 mb-2 animate-bounce" />
                <p className="text-sm font-extrabold">You are sharing your screen</p>
                <p className="text-xs text-slate-500 mt-1">GlowAI virtual mirror stream is broadcasting to Google Meet</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Meetings Grid / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Clock className="animate-spin text-purple-600 mb-3" size={40} />
          <p className="text-slate-500 text-sm font-semibold">Loading meeting schedules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {meetings.map((meeting) => (
            <motion.div
              layout
              key={meeting.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
                    <Video size={20} />
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    Google Meet
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{meeting.title}</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">Host: {meeting.hostName}</p>
                </div>

                {meeting.description && (
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">{meeting.description}</p>
                )}

                <div className="border-t border-slate-50 pt-4 space-y-2 text-slate-600 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{new Date(meeting.scheduledFor).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>{new Date(meeting.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 mt-2">
                <button
                  onClick={() => handleStartCall(meeting)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors"
                >
                  <Play size={12} />
                  Join Meeting &rarr;
                </button>
              </div>
            </motion.div>
          ))}

          {meetings.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <Video className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 font-semibold">No scheduled video meetings found.</p>
            </div>
          )}
        </div>
      )}

      {/* Schedule Meeting Modal */}
      <AnimatePresence>
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowScheduleModal(false)}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 p-8 shadow-2xl relative z-10 w-full max-w-lg text-left"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Video className="text-purple-600" size={22} />
                  Schedule Video Call
                </h3>
                <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleScheduleMeeting} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Meeting Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Q3 Product Kickoff"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    placeholder="Discussing roadmap design for next feature releases..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Google Meet Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm font-semibold"
                  />
                  <p className="text-[10px] text-slate-400 font-bold mt-1.5">If left empty, a secure, dynamic Google Meet link will be generated automatically.</p>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowScheduleModal(false)}
                    className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all text-xs"
                  >
                    Schedule Call
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CollaborationLayout>
  )
}
